/** Share helpers for SVG → PNG result / champion cards. */

export type ResultShareParams = {
  wpm: number;
  accuracy: number;
  placement: number;
  name: string;
  mode?: string;
};

export function resultSharePath(p: ResultShareParams): string {
  const q = new URLSearchParams({
    wpm: String(Math.round(p.wpm)),
    acc: String(Math.round(p.accuracy)),
    place: String(p.placement),
    name: p.name.slice(0, 32),
  });
  if (p.mode) q.set("mode", p.mode);
  return `/r?${q.toString()}`;
}

export function resultShareUrl(p: ResultShareParams): string {
  if (typeof window === "undefined") return resultSharePath(p);
  return `${window.location.origin}${resultSharePath(p)}`;
}

export async function svgElementToPngBlob(
  svg: SVGSVGElement,
  scale = 2,
): Promise<Blob> {
  const xml = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  try {
    const img = await loadImage(url);
    const w = svg.viewBox.baseVal.width || 640;
    const h = svg.viewBox.baseVal.height || 360;
    const canvas = document.createElement("canvas");
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("toBlob"))),
        "image/png",
      );
    });
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}

export async function downloadPng(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function copyPngToClipboard(blob: Blob): Promise<boolean> {
  try {
    if (!navigator.clipboard || !("ClipboardItem" in window)) return false;
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob }),
    ]);
    return true;
  } catch {
    return false;
  }
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export async function webShare(opts: {
  title: string;
  text: string;
  url: string;
  file?: File;
}): Promise<"shared" | "copied" | "failed"> {
  try {
    if (navigator.share) {
      const data: ShareData = {
        title: opts.title,
        text: opts.text,
        url: opts.url,
      };
      if (opts.file && navigator.canShare?.({ files: [opts.file] })) {
        data.files = [opts.file];
      }
      await navigator.share(data);
      return "shared";
    }
  } catch {
    /* fall through */
  }
  const ok = await copyText(opts.url);
  return ok ? "copied" : "failed";
}

export function placeLabel(placement: number): string {
  const j = placement % 10;
  const k = placement % 100;
  if (k >= 11 && k <= 13) return `${placement}th`;
  if (j === 1) return `${placement}st`;
  if (j === 2) return `${placement}nd`;
  if (j === 3) return `${placement}rd`;
  return `${placement}th`;
}
