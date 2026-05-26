import type { Annotation, PhotoKey } from "@/lib/types";

type Props = {
  src: string;
  alt: string;
  annotations: Annotation[];
  photoKey: PhotoKey;
  side?: "left" | "right";
};

export function AnnotatedPhoto({
  src,
  alt,
  annotations,
  photoKey,
  side = "right",
}: Props) {
  const filtered = annotations.filter((a) => a.photo === photoKey);

  return (
    <figure className="my-12">
      <div className="relative w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="block w-full h-auto grayscale-[15%]"
        />
        {filtered.map((annotation, index) => (
          <Marker
            key={`${photoKey}-${index}`}
            index={index + 1}
            annotation={annotation}
            side={side}
          />
        ))}
      </div>
    </figure>
  );
}

function Marker({
  index,
  annotation,
  side,
}: {
  index: number;
  annotation: Annotation;
  side: "left" | "right";
}) {
  const x = Math.max(0, Math.min(100, annotation.x));
  const y = Math.max(0, Math.min(100, annotation.y));

  const isRight = side === "right";

  return (
    <div
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="relative">
        <span
          className="block rounded-full border border-carvao bg-linho text-carvao"
          style={{
            width: 18,
            height: 18,
            fontSize: 9,
            lineHeight: "16px",
            textAlign: "center",
            fontFamily: "var(--font-sans), Inter, system-ui, sans-serif",
            letterSpacing: "0.06em",
          }}
        >
          {index}
        </span>
        <div
          className="absolute top-1/2"
          style={{
            [isRight ? "left" : "right"]: "100%",
            transform: "translateY(-50%)",
            whiteSpace: "nowrap",
          }}
        >
          <div className="flex items-center gap-2" style={{ flexDirection: isRight ? "row" : "row-reverse" }}>
            <span
              className="bg-carvao block"
              style={{ width: 32, height: 1 }}
            />
            <span
              className="text-carvao"
              style={{
                fontSize: 10,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontFamily: "var(--font-sans), Inter, system-ui, sans-serif",
              }}
            >
              {annotation.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
