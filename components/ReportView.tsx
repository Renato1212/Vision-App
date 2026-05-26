import { AnnotatedPhoto } from "@/components/AnnotatedPhoto";
import { StubButton } from "@/components/StubButton";
import type {
  ReportSection,
  ReportSectionKey,
  StoredReport,
} from "@/lib/types";

const ROMAN: Record<ReportSectionKey, string> = {
  proporcao: "I",
  linha_do_sorriso: "II",
  mapa_de_volumes: "III",
  mapa_dinamico: "IV",
  assimetria: "V",
  trajectoria: "VI",
  perguntas: "VII",
};

const EYEBROW: Record<ReportSectionKey, string> = {
  proporcao: "Secção I · Proporção",
  linha_do_sorriso: "Secção II · A linha do sorriso",
  mapa_de_volumes: "Secção III · Mapa de volumes",
  mapa_dinamico: "Secção IV · Mapa dinâmico",
  assimetria: "Secção V · Assimetria",
  trajectoria: "Secção VI · Trajectória",
  perguntas: "Secção VII · Perguntas que vale a pena fazer",
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
}

function Prose({ text }: { text: string }) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <div className="report-prose text-[15.5px] leading-[1.75] text-carvao">
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

function SectionHeader({ sectionKey }: { sectionKey: ReportSectionKey }) {
  return (
    <div className="mb-10">
      <p className="eyebrow">{EYEBROW[sectionKey]}</p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-serif-italic text-[42px] md:text-[52px] leading-[1.05] text-carvao mt-3 mb-12"
      style={{ letterSpacing: "-0.005em" }}
    >
      {children}
    </h2>
  );
}

type PhotosBag = {
  frontal_rest: string;
  frontal_smile: string;
  profile: string;
};

function Proporcao({
  section,
  photos,
}: {
  section: ReportSection;
  photos: PhotosBag;
}) {
  return (
    <section>
      <SectionHeader sectionKey="proporcao" />
      <SectionTitle>{section.title}</SectionTitle>
      <Prose text={section.body} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
        <AnnotatedPhoto
          src={photos.frontal_rest}
          alt="Fotografia frontal em repouso"
          annotations={section.annotations}
          photoKey="frontal_rest"
          side="right"
        />
        <AnnotatedPhoto
          src={photos.profile}
          alt="Fotografia de perfil direito"
          annotations={section.annotations}
          photoKey="profile"
          side="left"
        />
      </div>
    </section>
  );
}

function GenericSection({
  sectionKey,
  section,
  photos,
  photoKey,
  side = "right",
}: {
  sectionKey: ReportSectionKey;
  section: ReportSection;
  photos: PhotosBag;
  photoKey: keyof PhotosBag;
  side?: "left" | "right";
}) {
  return (
    <section>
      <SectionHeader sectionKey={sectionKey} />
      <SectionTitle>{section.title}</SectionTitle>
      <Prose text={section.body} />
      <AnnotatedPhoto
        src={photos[photoKey]}
        alt={section.title}
        annotations={section.annotations}
        photoKey={photoKey as "frontal_rest" | "frontal_smile" | "profile"}
        side={side}
      />
    </section>
  );
}

function Perguntas({ section }: { section: ReportSection }) {
  const items = section.body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => p.replace(/^\d+\.\s*/, ""));

  return (
    <section>
      <SectionHeader sectionKey="perguntas" />
      <SectionTitle>{section.title}</SectionTitle>
      <ol className="space-y-7 mt-4">
        {items.map((q, i) => (
          <li key={i} className="flex gap-6">
            <span
              className="font-serif-italic text-travertino text-[28px] leading-none pt-1 shrink-0"
              style={{ minWidth: "2.2rem" }}
            >
              {(i + 1).toString().padStart(2, "0")}
            </span>
            <p className="text-[15.5px] leading-[1.7] text-carvao">{q}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Divider() {
  return <hr className="hairline my-24" />;
}

export function ReportView({ report }: { report: StoredReport }) {
  const { sections, photos, intake, serial, createdAt } = report;

  return (
    <article className="mx-auto max-w-prose px-6 md:px-0 py-20 md:py-32">
      <header className="mb-32">
        <p className="eyebrow mb-8">{serial}</p>
        <h1
          className="font-serif-italic text-[64px] md:text-[88px] leading-[0.95] text-carvao mb-12"
          style={{ letterSpacing: "-0.01em" }}
        >
          {intake.firstName}
        </h1>
        <p className="font-serif-italic text-[22px] md:text-[26px] leading-snug text-carvao mb-10 max-w-[28ch]">
          Uma leitura arquitectónica do rosto.
        </p>
        <hr className="hairline-soft mb-6" />
        <div className="flex flex-wrap gap-x-10 gap-y-2">
          <span className="eyebrow">{formatDate(createdAt)}</span>
          <span className="eyebrow">Dra. Cláudia Pacheco</span>
          <span className="eyebrow">Arquitectura Facial</span>
        </div>
      </header>

      <Proporcao section={sections.proporcao} photos={photos} />
      <Divider />
      <GenericSection
        sectionKey="linha_do_sorriso"
        section={sections.linha_do_sorriso}
        photos={photos}
        photoKey="frontal_smile"
        side="right"
      />
      <Divider />
      <GenericSection
        sectionKey="mapa_de_volumes"
        section={sections.mapa_de_volumes}
        photos={photos}
        photoKey="frontal_rest"
        side="right"
      />
      <Divider />
      <GenericSection
        sectionKey="mapa_dinamico"
        section={sections.mapa_dinamico}
        photos={photos}
        photoKey="frontal_smile"
        side="left"
      />
      <Divider />
      <GenericSection
        sectionKey="assimetria"
        section={sections.assimetria}
        photos={photos}
        photoKey="frontal_rest"
        side="left"
      />
      <Divider />
      <section>
        <SectionHeader sectionKey="trajectoria" />
        <SectionTitle>{sections.trajectoria.title}</SectionTitle>
        <Prose text={sections.trajectoria.body} />
      </section>
      <Divider />
      <Perguntas section={sections.perguntas} />
      <Divider />
      <ClosingBlock />
    </article>
  );
}

function ClosingBlock() {
  return (
    <section className="mt-12">
      <p className="eyebrow mb-8">Fecho</p>
      <p className="font-serif-italic text-[24px] md:text-[28px] leading-snug text-carvao mb-12 max-w-[34ch]">
        Este estudo é uma leitura — não uma prescrição. Serve para que conheça a
        gramática do seu próprio rosto antes de qualquer decisão.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <StubButton
          message="Em breve. A exportação em PDF não está activa neste protótipo."
          label="Descarregar em PDF"
        />
        <StubButton
          message="Em breve. O agendamento com a Dra. Cláudia não está activo neste protótipo."
          label="Discutir este estudo · 30 min · €180"
          variant="ghost"
        />
      </div>
      <p className="eyebrow mt-12 text-travertino">
        Protótipo · sessão em memória
      </p>
    </section>
  );
}
