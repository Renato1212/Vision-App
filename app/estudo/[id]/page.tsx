import { notFound } from "next/navigation";
import Link from "next/link";
import { ReportView } from "@/components/ReportView";
import { getReport } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function EstudoPage({ params }: { params: { id: string } }) {
  const report = getReport(params.id);

  if (!report) {
    notFound();
  }

  if (report.status === "pending") {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-prose text-center">
          <p className="eyebrow mb-6">A leitura ainda decorre</p>
          <p className="font-serif-italic text-[28px] leading-snug text-carvao mb-10">
            O seu estudo está a ser composto. Volte à página de processamento.
          </p>
          <Link href={`/processing/${params.id}`} className="btn-quiet">
            Voltar à composição
          </Link>
        </div>
      </main>
    );
  }

  if (report.status === "error") {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-prose text-center">
          <p className="eyebrow mb-6">Não foi possível concluir</p>
          <p className="font-serif-italic text-[28px] leading-snug text-carvao mb-10">
            {report.error ??
              "Não foi possível concluir a leitura. Tente novamente dentro de instantes."}
          </p>
          <Link href="/intake" className="btn-quiet">
            Reiniciar o estudo
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-linho">
      <ReportView report={report} />
    </main>
  );
}
