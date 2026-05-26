"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PhotoSlot } from "@/components/PhotoSlot";
import {
  FrontalSilhouette,
  ProfileSilhouette,
} from "@/components/Silhouettes";
import type { Intake, Photos } from "@/lib/types";

const COMMON_PHOTO_INSTRUCTIONS = [
  "Luz natural, junto a uma janela.",
  "Sem maquilhagem, idealmente.",
  "Fundo neutro, sem padrões.",
  "Câmara à altura dos olhos.",
  "Sem filtros, sem recortes.",
];

const EMPTY_INTAKE: Intake = {
  firstName: "",
  age: "",
  mirror: "",
  bothers: "",
  fears: "",
  previousWork: "",
  smilesFreely: "",
  orthodontic: "",
  dentalAesthetic: "",
  grinds: "",
  inFiveYears: "",
  inTenYears: "",
  inTwentyYears: "",
  ageingWell: "",
};

export function IntakeWizard() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [photos, setPhotos] = useState<Partial<Photos>>({});
  const [intake, setIntake] = useState<Intake>(EMPTY_INTAKE);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const photosComplete = useMemo(
    () =>
      Boolean(photos.frontal_rest && photos.frontal_smile && photos.profile),
    [photos],
  );

  const requiredQuestions: (keyof Intake)[] = [
    "firstName",
    "age",
    "mirror",
    "bothers",
    "fears",
    "smilesFreely",
    "orthodontic",
    "dentalAesthetic",
    "grinds",
    "inFiveYears",
    "inTenYears",
    "inTwentyYears",
    "ageingWell",
  ];

  const intakeComplete = requiredQuestions.every(
    (k) => intake[k].trim().length > 0,
  );

  async function submit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intake, photos }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(
          data.error ?? "Não foi possível iniciar a leitura.",
        );
      }
      const { id } = (await res.json()) as { id: string };
      router.push(`/processing/${id}`);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Erro inesperado.";
      setSubmitError(message);
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-prose px-6 md:px-0 py-20">
      <header className="mb-16">
        <p className="eyebrow mb-4">
          O Estudo · etapa {step} de 3
        </p>
        <h1 className="font-serif-italic text-[44px] md:text-[56px] leading-[1] text-carvao">
          {step === 1
            ? "As três fotografias"
            : step === 2
              ? "O questionário"
              : "Antes de gerar"}
        </h1>
      </header>

      {step === 1 ? (
        <StepPhotos
          photos={photos}
          setPhotos={setPhotos}
          onNext={() => setStep(2)}
          ready={photosComplete}
        />
      ) : step === 2 ? (
        <StepQuestions
          intake={intake}
          setIntake={setIntake}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
          ready={intakeComplete}
        />
      ) : (
        <StepReview
          intake={intake}
          photos={photos as Photos}
          onBack={() => setStep(2)}
          onSubmit={submit}
          submitting={submitting}
          submitError={submitError}
        />
      )}
    </div>
  );
}

function StepPhotos({
  photos,
  setPhotos,
  onNext,
  ready,
}: {
  photos: Partial<Photos>;
  setPhotos: (p: Partial<Photos>) => void;
  onNext: () => void;
  ready: boolean;
}) {
  function set(key: keyof Photos, value: string | null) {
    const next = { ...photos };
    if (value === null) {
      delete next[key];
    } else {
      next[key] = value;
    }
    setPhotos(next);
  }

  return (
    <>
      <p className="text-[15px] text-carvao/85 leading-relaxed mb-12 max-w-[58ch]">
        Três fotografias suas, feitas com o telemóvel, sem produção. A qualidade
        da leitura depende da honestidade da imagem — luz natural, fundo neutro,
        nenhum filtro.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <PhotoSlot
          caption="Fotografia 1"
          title="Frontal, em repouso"
          silhouette={<FrontalSilhouette className="w-full h-auto" />}
          instructions={[
            "Olhar para a câmara, lábios juntos sem força.",
            ...COMMON_PHOTO_INSTRUCTIONS,
          ]}
          value={photos.frontal_rest ?? null}
          onChange={(v) => set("frontal_rest", v)}
        />
        <PhotoSlot
          caption="Fotografia 2"
          title="Frontal, a sorrir"
          silhouette={<FrontalSilhouette className="w-full h-auto" />}
          instructions={[
            "Sorriso natural, como sorri sem se ver.",
            ...COMMON_PHOTO_INSTRUCTIONS,
          ]}
          value={photos.frontal_smile ?? null}
          onChange={(v) => set("frontal_smile", v)}
        />
        <PhotoSlot
          caption="Fotografia 3"
          title="Perfil direito"
          silhouette={<ProfileSilhouette className="w-full h-auto" />}
          instructions={[
            "Cabeça nivelada, olhar para a frente.",
            ...COMMON_PHOTO_INSTRUCTIONS,
          ]}
          value={photos.profile ?? null}
          onChange={(v) => set("profile", v)}
        />
      </div>

      <hr className="hairline my-16" />

      <div className="flex justify-end">
        <button
          type="button"
          className="btn-quiet"
          disabled={!ready}
          onClick={onNext}
        >
          Continuar para o questionário
        </button>
      </div>
    </>
  );
}

const AGE_OPTIONS = ["25–34", "35–44", "45–54", "55–64", "65+"];
const YES_NO_MAYBE = ["Sim", "Não", "Em parte"];

function ChoiceRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-10">
      <span className="field-label">{label}</span>
      <div className="flex flex-wrap mt-2">
        {options.map((opt) => (
          <button
            type="button"
            key={opt}
            className="choice"
            data-selected={value === opt}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="mb-10">
      <label className="field-label">{label}</label>
      <input
        className="field-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="mb-10">
      <label className="field-label">{label}</label>
      <textarea
        className="field-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
      />
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-16">
      <p className="eyebrow mb-2">{title}</p>
      <hr className="hairline-soft mb-10" />
      {children}
    </section>
  );
}

function StepQuestions({
  intake,
  setIntake,
  onBack,
  onNext,
  ready,
}: {
  intake: Intake;
  setIntake: (i: Intake) => void;
  onBack: () => void;
  onNext: () => void;
  ready: boolean;
}) {
  function set<K extends keyof Intake>(key: K, value: Intake[K]) {
    setIntake({ ...intake, [key]: value });
  }

  return (
    <>
      <Block title="Sobre si">
        <TextField
          label="Como prefere ser chamada"
          value={intake.firstName}
          onChange={(v) => set("firstName", v)}
          placeholder="Primeiro nome"
        />
        <ChoiceRow
          label="Faixa etária"
          value={intake.age}
          options={AGE_OPTIONS}
          onChange={(v) => set("age", v)}
        />
        <TextArea
          label="O que vê quando se observa ao espelho"
          value={intake.mirror}
          onChange={(v) => set("mirror", v)}
          placeholder="Sem censura. Como descreveria o seu rosto hoje?"
        />
        <TextArea
          label="O que mais a incomoda"
          value={intake.bothers}
          onChange={(v) => set("bothers", v)}
        />
        <TextArea
          label="O que receia em procedimentos estéticos"
          value={intake.fears}
          onChange={(v) => set("fears", v)}
        />
        <TextField
          label="Procedimentos já realizados (se algum)"
          value={intake.previousWork}
          onChange={(v) => set("previousWork", v)}
          placeholder="Opcional"
        />
      </Block>

      <Block title="Sobre o seu sorriso">
        <ChoiceRow
          label="Sorri livremente em fotografias?"
          value={intake.smilesFreely}
          options={YES_NO_MAYBE}
          onChange={(v) => set("smilesFreely", v)}
        />
        <ChoiceRow
          label="Já fez tratamento ortodôntico?"
          value={intake.orthodontic}
          options={["Sim, em criança", "Sim, em adulta", "Não"]}
          onChange={(v) => set("orthodontic", v)}
        />
        <ChoiceRow
          label="Já fez trabalho estético dentário?"
          value={intake.dentalAesthetic}
          options={["Sim", "Não", "Está a considerar"]}
          onChange={(v) => set("dentalAesthetic", v)}
        />
        <ChoiceRow
          label="Range ou aperta os dentes?"
          value={intake.grinds}
          options={["Sim, todas as noites", "Por vezes", "Não que saiba"]}
          onChange={(v) => set("grinds", v)}
        />
      </Block>

      <Block title="Sobre o tempo">
        <TextArea
          label="Como quer parecer daqui a cinco anos"
          value={intake.inFiveYears}
          onChange={(v) => set("inFiveYears", v)}
        />
        <TextArea
          label="Daqui a dez anos"
          value={intake.inTenYears}
          onChange={(v) => set("inTenYears", v)}
        />
        <TextArea
          label="Daqui a vinte anos"
          value={intake.inTwentyYears}
          onChange={(v) => set("inTwentyYears", v)}
        />
        <TextArea
          label='O que significa, para si, "envelhecer bem"'
          value={intake.ageingWell}
          onChange={(v) => set("ageingWell", v)}
          placeholder="Nas suas palavras."
        />
      </Block>

      <hr className="hairline my-16" />

      <div className="flex justify-between">
        <button type="button" className="btn-ghost" onClick={onBack}>
          Voltar
        </button>
        <button
          type="button"
          className="btn-quiet"
          disabled={!ready}
          onClick={onNext}
        >
          Continuar
        </button>
      </div>
    </>
  );
}

function StepReview({
  intake,
  photos,
  onBack,
  onSubmit,
  submitting,
  submitError,
}: {
  intake: Intake;
  photos: Photos;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  submitError: string | null;
}) {
  return (
    <>
      <p className="text-[15px] text-carvao/85 leading-relaxed mb-12 max-w-[58ch]">
        Antes de gerar. Confirme que as três fotografias estão correctas e que
        respondeu ao que importava. A leitura demora cerca de noventa segundos.
      </p>

      <div className="grid grid-cols-3 gap-4 mb-16">
        {([
          ["Frontal, em repouso", photos.frontal_rest],
          ["Frontal, a sorrir", photos.frontal_smile],
          ["Perfil direito", photos.profile],
        ] as const).map(([label, src]) => (
          <div key={label}>
            <div className="bg-pedra/30 aspect-[3/4] overflow-hidden">
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={label} className="w-full h-full object-cover" />
              ) : null}
            </div>
            <p className="eyebrow mt-3 text-travertino">{label}</p>
          </div>
        ))}
      </div>

      <dl className="mb-16 space-y-6">
        <ReviewRow label="Nome" value={intake.firstName} />
        <ReviewRow label="Idade" value={intake.age} />
        <ReviewRow label="Como se vê" value={intake.mirror} />
        <ReviewRow label="O que a incomoda" value={intake.bothers} />
        <ReviewRow label="O que receia" value={intake.fears} />
        <ReviewRow label="Envelhecer bem" value={intake.ageingWell} />
      </dl>

      {submitError ? (
        <p className="eyebrow text-rose mb-6">{submitError}</p>
      ) : null}

      <hr className="hairline my-16" />

      <div className="flex justify-between">
        <button
          type="button"
          className="btn-ghost"
          onClick={onBack}
          disabled={submitting}
        >
          Voltar
        </button>
        <button
          type="button"
          className="btn-quiet"
          onClick={onSubmit}
          disabled={submitting}
        >
          {submitting ? "A iniciar" : "Gerar o meu estudo"}
        </button>
      </div>
    </>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-6 items-baseline">
      <dt className="eyebrow">{label}</dt>
      <dd className="text-[15px] text-carvao leading-snug">{value || "—"}</dd>
    </div>
  );
}
