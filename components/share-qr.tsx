"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { QRCodeCanvas } from "qrcode.react";

const LOGO_SRC = "/jarlet-icon.svg";
const DISPLAY_SIZE = 168;

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

function logoSettings(size: number) {
  const mark = Math.round(size * 0.26);
  return {
    src: LOGO_SRC,
    height: mark,
    width: mark,
    excavate: true,
  };
}

export function ShareQr({
  url,
  caption,
  filename = "jarlet-qr.png",
}: {
  url: string;
  caption: string;
  filename?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ready = useIsClient();
  const [busy, setBusy] = useState(false);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setBusy(true);
    try {
      const href = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = href;
      link.download = filename;
      link.click();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="w-fit rounded-xl border border-line bg-white p-2">
        {ready ? (
          <QRCodeCanvas
            ref={canvasRef}
            value={url}
            size={DISPLAY_SIZE}
            level="H"
            marginSize={2}
            bgColor="#ffffff"
            fgColor="#2B2A33"
            title={caption}
            imageSettings={logoSettings(DISPLAY_SIZE)}
          />
        ) : (
          <div
            className="bg-white"
            style={{ width: DISPLAY_SIZE, height: DISPLAY_SIZE }}
            aria-hidden
          />
        )}
      </div>
      <div>
        <p className="text-xs text-muted">{caption}</p>
        <button
          type="button"
          onClick={download}
          disabled={!ready || busy}
          className="mt-2 rounded-lg border border-input bg-surface px-3 py-2 text-xs font-medium text-body transition-colors hover:border-heading disabled:opacity-50"
        >
          {busy ? "Preparing…" : "Download QR"}
        </button>
      </div>
    </div>
  );
}
