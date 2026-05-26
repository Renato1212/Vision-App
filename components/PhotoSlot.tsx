"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

type Props = {
  title: string;
  caption: string;
  instructions: string[];
  silhouette: React.ReactNode;
  value: string | null;
  onChange: (dataUrl: string | null) => void;
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function PhotoSlot({
  title,
  caption,
  instructions,
  silhouette,
  value,
  onChange,
}: Props) {
  const onDrop = useCallback(
    async (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;
      const dataUrl = await fileToDataUrl(file);
      onChange(dataUrl);
    },
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
  });

  return (
    <div>
      <p className="eyebrow mb-3">{caption}</p>
      <h3 className="font-serif-italic text-[26px] leading-tight text-carvao mb-6">
        {title}
      </h3>
      <div
        {...getRootProps()}
        className="relative cursor-pointer bg-pedra/30 border border-carvao/25 aspect-[3/4] flex items-center justify-center overflow-hidden"
        style={{ borderRadius: 2 }}
        data-drag={isDragActive}
      >
        <input {...getInputProps()} />
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-travertino w-2/3 max-w-[160px]">{silhouette}</div>
        )}
        {value ? (
          <div
            className="absolute bottom-3 right-3 bg-linho/90 px-2 py-1 eyebrow"
            style={{ color: "#1F1D1B" }}
          >
            Substituir
          </div>
        ) : (
          <div className="absolute bottom-3 left-3 eyebrow text-carvao/70">
            {isDragActive ? "Soltar fotografia" : "Carregar fotografia"}
          </div>
        )}
      </div>
      <ul className="mt-5 space-y-1.5">
        {instructions.map((line) => (
          <li
            key={line}
            className="text-[12.5px] text-travertino leading-snug pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[10px] before:w-1.5 before:h-px before:bg-travertino"
          >
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
