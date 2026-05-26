"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const PHASES = [
  "A ler as fotografias",
  "A analisar proporções",
  "A estudar a linha do sorriso",
  "A mapear volumes",
  "A projectar a trajectória",
  "A redigir o estudo",
];

const MIN_TOTAL_MS = 90_000;

export function ProcessingClient({ id }: { id: string }) {
  const router = useRouter();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const startedAt = useRef<number>(Date.now());
  const readyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    function scheduleNext(currentIndex: number) {
      if (cancelled) return;
      if (currentIndex >= PHASES.length - 1) return;
      const delay = 8000 + Math.random() * 7000;
      window.setTimeout(() => {
        if (cancelled) return;
        setPhaseIndex(currentIndex + 1);
        scheduleNext(currentIndex + 1);
      }, delay);
    }
    scheduleNext(0);

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      while (!cancelled) {
        try {
          const res = await fetch(`/api/report/${id}`, { cache: "no-store" });
          if (res.ok) {
            const data = (await res.json()) as {
              status: "pending" | "ready" | "error";
              error?: string;
            };
            if (data.status === "ready") {
              readyRef.current = true;
              const elapsed = Date.now() - startedAt.current;
              const remaining = Math.max(0, MIN_TOTAL_MS - elapsed);
              window.setTimeout(() => {
                if (cancelled) return;
                setPhaseIndex(PHASES.length - 1);
                router.push(`/estudo/${id}`);
              }, remaining);
              return;
            }
            if (data.status === "error") {
              setErrorMessage(
                data.error ??
                  "Não foi possível concluir a leitura. Tente novamente dentro de instantes.",
              );
              return;
            }
          } else if (res.status === 404) {
            setErrorMessage(
              "Sessão não encontrada. Reinicie o estudo a partir do início.",
            );
            return;
          }
        } catch {
          // network blip — keep polling
        }
        await new Promise((r) => window.setTimeout(r, 2500));
      }
    }

    void poll();
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  if (errorMessage) {
    return (
      <div className="max-w-prose text-center">
        <p className="eyebrow mb-6">A composição foi interrompida</p>
        <p className="font-serif-italic text-[26px] leading-snug text-carvao mb-10">
          {errorMessage}
        </p>
        <a href="/intake" className="btn-quiet">
          Reiniciar
        </a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-hero text-center">
      <p className="eyebrow mb-16 text-travertino">O Estudo · em composição</p>

      <div className="relative h-[3.5rem] mb-20 overflow-hidden">
        {PHASES.map((phase, i) => (
          <p
            key={phase}
            className="absolute inset-0 font-serif-italic text-[34px] md:text-[44px] leading-tight text-carvao transition-opacity duration-1000"
            style={{
              opacity: i === phaseIndex ? 1 : 0,
            }}
          >
            {phase}
          </p>
        ))}
      </div>

      <div className="mx-auto w-40">
        <div className="hairline-anim" />
      </div>

      <p className="eyebrow mt-20 text-travertino">
        A leitura demora o tempo que merece. Não feche esta janela.
      </p>
    </div>
  );
}
