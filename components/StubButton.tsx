"use client";

import { useState } from "react";

export function StubButton({
  label,
  message,
  variant = "filled",
}: {
  label: string;
  message: string;
  variant?: "filled" | "ghost";
}) {
  const [showing, setShowing] = useState(false);

  return (
    <div className="flex flex-col items-start gap-3">
      <button
        type="button"
        onClick={() => {
          setShowing(true);
          window.setTimeout(() => setShowing(false), 4000);
        }}
        className={variant === "ghost" ? "btn-ghost" : "btn-quiet"}
      >
        {label}
      </button>
      {showing ? (
        <span className="eyebrow text-travertino">{message}</span>
      ) : null}
    </div>
  );
}
