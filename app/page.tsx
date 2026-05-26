import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-linho">
      <header className="px-6 md:px-12 pt-10 pb-4 flex items-center justify-between">
        <span className="eyebrow">Arquitectura Facial · Dra. Cláudia Pacheco</span>
        <span className="eyebrow text-travertino">Lisboa · Porto</span>
      </header>

      <section className="px-6 md:px-12 pt-24 md:pt-36 pb-32 md:pb-48 max-w-hero mx-auto">
        <p className="eyebrow mb-10">O Estudo</p>
        <h1 className="font-serif-italic text-[56px] md:text-[88px] leading-[0.98] text-carvao mb-12" style={{ letterSpacing: "-0.01em" }}>
          Uma leitura arquitectónica do seu rosto.
        </h1>
        <p className="text-[16px] md:text-[17px] leading-[1.7] text-carvao max-w-[52ch] mb-14">
          Um relatório pessoal, escrito a partir de três fotografias e de doze
          perguntas, que descreve a estrutura, a linha do sorriso, os volumes,
          o movimento e a trajectória do seu rosto. Não é uma proposta de
          procedimento. É o vocabulário com que vai conversar com qualquer
          médico que a avalie.
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <Link href="/intake" className="btn-quiet">
            Iniciar o estudo · €39
          </Link>
          <span className="eyebrow text-travertino">
            Pagamento desactivado neste protótipo.
          </span>
        </div>
      </section>

      <hr className="hairline mx-6 md:mx-12" />

      <section className="px-6 md:px-12 py-28 md:py-36">
        <div className="max-w-prose mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          <Column
            roman="I"
            eyebrow="O que contém"
            body="Sete secções, escritas à mão por uma inteligência treinada na voz da Dra. Cláudia Pacheco. Proporção, linha do sorriso, mapa de volumes, mapa dinâmico, assimetria, trajectória a dez anos e uma lista de perguntas para levar a qualquer consulta."
          />
          <Column
            roman="II"
            eyebrow="O que não é"
            body="Não é uma prescrição. Não recomenda procedimentos, marcas, técnicas ou quantidades. Não diagnostica. Não substitui uma consulta presencial. É uma leitura — observação cuidada, posta em palavras."
          />
          <Column
            roman="III"
            eyebrow="Para quem é"
            body="Para quem está a considerar uma intervenção estética e prefere chegar à conversa com vocabulário próprio. Para quem quer compreender o rosto antes de decidir o que fazer com ele."
          />
        </div>
      </section>

      <hr className="hairline mx-6 md:mx-12" />

      <section className="px-6 md:px-12 py-28 md:py-36">
        <div className="max-w-prose mx-auto text-center">
          <p className="font-serif-italic text-[28px] md:text-[34px] leading-snug text-carvao mb-12 max-w-[34ch] mx-auto">
            O rosto lê-se como arquitectura. Estrutura primeiro, superfície depois.
          </p>
          <Link href="/intake" className="btn-quiet">
            Iniciar o estudo
          </Link>
        </div>
      </section>

      <footer className="px-6 md:px-12 py-12 border-t border-carvao/15">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 max-w-hero mx-auto">
          <span className="eyebrow text-travertino">
            Arquitectura Facial · Protótipo
          </span>
          <span className="eyebrow text-travertino">
            Sessão em memória — sem persistência
          </span>
        </div>
      </footer>
    </main>
  );
}

function Column({
  roman,
  eyebrow,
  body,
}: {
  roman: string;
  eyebrow: string;
  body: string;
}) {
  return (
    <div>
      <p className="font-serif-italic text-travertino text-[44px] leading-none mb-6">
        {roman}
      </p>
      <p className="eyebrow mb-4">{eyebrow}</p>
      <p className="text-[14.5px] leading-[1.7] text-carvao">{body}</p>
    </div>
  );
}
