import { ProcessingClient } from "@/components/ProcessingClient";

export default function ProcessingPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <main className="min-h-screen bg-linho flex items-center justify-center px-6">
      <ProcessingClient id={params.id} />
    </main>
  );
}
