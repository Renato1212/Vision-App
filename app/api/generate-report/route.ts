import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
  SYSTEM_PROMPT,
  STERNER_RETRY_INSTRUCTION,
  buildUserPrompt,
} from "@/lib/prompt";
import { saveReport, getReport, nextSerial } from "@/lib/store";
import type {
  Intake,
  Photos,
  ReportSections,
  ReportSectionKey,
  StoredReport,
} from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "gemini-2.5-flash";

const REQUIRED_KEYS: ReportSectionKey[] = [
  "proporcao",
  "linha_do_sorriso",
  "mapa_de_volumes",
  "mapa_dinamico",
  "assimetria",
  "trajectoria",
  "perguntas",
];

type DataUrl = {
  mediaType: "image/jpeg" | "image/png" | "image/webp";
  data: string;
};

function parseDataUrl(value: string): DataUrl {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(value);
  if (!match) {
    throw new Error("Formato de imagem inválido — esperado data URL base64.");
  }
  return { mediaType: match[1] as DataUrl["mediaType"], data: match[2] };
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = /```(?:json)?\s*([\s\S]*?)```/.exec(trimmed);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Nenhum objecto JSON encontrado na resposta.");
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

function validateSections(value: unknown): ReportSections {
  if (typeof value !== "object" || value === null) {
    throw new Error("Resposta não é um objecto JSON.");
  }
  const obj = value as Record<string, unknown>;
  const result: Partial<ReportSections> = {};
  for (const key of REQUIRED_KEYS) {
    const section = obj[key];
    if (!section || typeof section !== "object") {
      throw new Error(`Secção ausente ou inválida: ${key}`);
    }
    const s = section as Record<string, unknown>;
    if (typeof s.title !== "string" || typeof s.body !== "string") {
      throw new Error(`Secção ${key} sem title/body válidos.`);
    }
    const ann = Array.isArray(s.annotations) ? s.annotations : [];
    const annotations = ann
      .filter((a): a is Record<string, unknown> => !!a && typeof a === "object")
      .map((a) => ({
        photo: a.photo as "frontal_rest" | "frontal_smile" | "profile",
        x: Number(a.x),
        y: Number(a.y),
        label: String(a.label ?? ""),
      }))
      .filter(
        (a) =>
          (a.photo === "frontal_rest" ||
            a.photo === "frontal_smile" ||
            a.photo === "profile") &&
          Number.isFinite(a.x) &&
          Number.isFinite(a.y) &&
          a.label.length > 0,
      );
    result[key] = { title: s.title, body: s.body, annotations };
  }
  return result as ReportSections;
}

async function callGemini(
  client: GoogleGenAI,
  photos: Photos,
  intake: Intake,
  sterner: boolean,
): Promise<ReportSections> {
  const frontalRest = parseDataUrl(photos.frontal_rest);
  const frontalSmile = parseDataUrl(photos.frontal_smile);
  const profile = parseDataUrl(photos.profile);

  const userText = sterner
    ? `${buildUserPrompt(intake)}\n\n${STERNER_RETRY_INSTRUCTION}`
    : buildUserPrompt(intake);

  const response = await client.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: "Fotografia 1 — frontal em repouso (frontal_rest):",
          },
          {
            inlineData: {
              mimeType: frontalRest.mediaType,
              data: frontalRest.data,
            },
          },
          {
            text: "Fotografia 2 — frontal a sorrir (frontal_smile):",
          },
          {
            inlineData: {
              mimeType: frontalSmile.mediaType,
              data: frontalSmile.data,
            },
          },
          { text: "Fotografia 3 — perfil direito (profile):" },
          {
            inlineData: {
              mimeType: profile.mediaType,
              data: profile.data,
            },
          },
          { text: userText },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      maxOutputTokens: 8000,
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  });

  const raw = response.text;
  if (!raw) {
    throw new Error("Resposta vazia do modelo.");
  }

  const parsed = extractJson(raw);
  return validateSections(parsed);
}

export async function POST(request: Request) {
  let payload: { id: string; intake: Intake; photos: Photos };
  try {
    payload = (await request.json()) as {
      id: string;
      intake: Intake;
      photos: Photos;
    };
  } catch {
    return NextResponse.json(
      { error: "Pedido inválido — JSON malformado." },
      { status: 400 },
    );
  }

  const { id, intake, photos } = payload;
  if (
    !id ||
    !photos?.frontal_rest ||
    !photos?.frontal_smile ||
    !photos?.profile ||
    !intake?.firstName
  ) {
    return NextResponse.json(
      {
        error:
          "Faltam dados — id, três fotografias e o questionário são obrigatórios.",
      },
      { status: 400 },
    );
  }

  const alreadyReady = getReport(id);
  if (alreadyReady?.status === "ready") {
    return NextResponse.json({ ok: true, alreadyReady: true });
  }

  const apiKey =
    process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "GOOGLE_API_KEY não configurada no servidor.",
      },
      { status: 500 },
    );
  }

  const client = new GoogleGenAI({ apiKey });

  let sections: ReportSections | null = null;
  try {
    sections = await callGemini(client, photos, intake, false);
  } catch (errFirst) {
    console.error("[generate-report] tentativa 1 falhou:", errFirst);
    try {
      sections = await callGemini(client, photos, intake, true);
    } catch (errSecond) {
      console.error("[generate-report] tentativa 2 falhou:", errSecond);
      return NextResponse.json(
        {
          error:
            "Não foi possível concluir a leitura. Tente novamente dentro de instantes.",
        },
        { status: 502 },
      );
    }
  }

  const stored: StoredReport = {
    id,
    createdAt: new Date().toISOString(),
    serial: nextSerial(),
    intake,
    photos,
    sections: sections!,
    status: "ready",
  };
  saveReport(stored);

  return NextResponse.json({ ok: true });
}
