import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { randomUUID } from "node:crypto";
import {
  SYSTEM_PROMPT,
  STERNER_RETRY_INSTRUCTION,
  buildUserPrompt,
} from "@/lib/prompt";
import { nextSerial, saveReport, getReport } from "@/lib/store";
import type {
  Intake,
  Photos,
  ReportSections,
  ReportSectionKey,
  StoredReport,
} from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

const MODEL = "claude-sonnet-4-6";

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

async function callClaude(
  client: Anthropic,
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

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 6000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Fotografia 1 — frontal em repouso (frontal_rest):",
          },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: frontalRest.mediaType,
              data: frontalRest.data,
            },
          },
          {
            type: "text",
            text: "Fotografia 2 — frontal a sorrir (frontal_smile):",
          },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: frontalSmile.mediaType,
              data: frontalSmile.data,
            },
          },
          { type: "text", text: "Fotografia 3 — perfil direito (profile):" },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: profile.mediaType,
              data: profile.data,
            },
          },
          { type: "text", text: userText },
        ],
      },
    ],
  });

  const raw = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  const parsed = extractJson(raw);
  return validateSections(parsed);
}

async function runGeneration(
  id: string,
  intake: Intake,
  photos: Photos,
): Promise<void> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const existing = getReport(id);
    if (existing) {
      saveReport({
        ...existing,
        status: "error",
        error: "ANTHROPIC_API_KEY não configurada no servidor.",
      });
    }
    return;
  }

  const client = new Anthropic({ apiKey });

  let sections: ReportSections | null = null;
  try {
    sections = await callClaude(client, photos, intake, false);
  } catch (errFirst) {
    console.error("[generate-report] tentativa 1 falhou:", errFirst);
    try {
      sections = await callClaude(client, photos, intake, true);
    } catch (errSecond) {
      console.error("[generate-report] tentativa 2 falhou:", errSecond);
      const existing = getReport(id);
      if (existing) {
        saveReport({
          ...existing,
          status: "error",
          error:
            "Não foi possível concluir a leitura. Tente novamente dentro de instantes.",
        });
      }
      return;
    }
  }

  const existing = getReport(id);
  if (!existing || !sections) return;
  saveReport({
    ...existing,
    sections,
    status: "ready",
  });
}

export async function POST(request: Request) {
  let payload: { intake: Intake; photos: Photos };
  try {
    payload = (await request.json()) as { intake: Intake; photos: Photos };
  } catch {
    return NextResponse.json(
      { error: "Pedido inválido — JSON malformado." },
      { status: 400 },
    );
  }

  const { intake, photos } = payload;
  if (
    !photos?.frontal_rest ||
    !photos?.frontal_smile ||
    !photos?.profile ||
    !intake?.firstName
  ) {
    return NextResponse.json(
      {
        error:
          "Faltam dados — três fotografias e o questionário são obrigatórios.",
      },
      { status: 400 },
    );
  }

  const id = randomUUID();
  const serial = nextSerial();
  const pending: StoredReport = {
    id,
    createdAt: new Date().toISOString(),
    serial,
    intake,
    photos,
    sections: {} as ReportSections,
    status: "pending",
  };
  saveReport(pending);

  void runGeneration(id, intake, photos);

  return NextResponse.json({ id });
}
