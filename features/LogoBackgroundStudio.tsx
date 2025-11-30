
import React, { useMemo, useRef, useState } from "react";
import { removeBackground } from '../services/geminiService';
import { Button } from "../components/ui/Button";

interface LogoBackgroundStudioProps {
  src: string;
  title: string;
  brandSwatches?: string[];
  onClose: () => void;
}

export const LogoBackgroundStudio: React.FC<LogoBackgroundStudioProps> = ({
  src,
  title,
  brandSwatches = ["#111827", "#000000", "#FFFFFF", "#8A3FFC", "#00F0FF", "#FF007F"],
  onClose
}) => {
  type BgMode = "transparent" | "solid" | "gradient";
  type Format = "png" | "webp";

  const HARD_LIMIT_BYTES = 512 * 1024; // 512KB

  const [imageSrc, setImageSrc] = useState(src);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  
  const [bgMode, setBgMode] = useState<BgMode>("transparent");
  const [bgColor, setBgColor] = useState<string>(brandSwatches[0]);
  const [gradA, setGradA] = useState<string>("#8A3FFC");
  const [gradB, setGradB] = useState<string>("#00F0FF");
  const [gradAngle, setGradAngle] = useState<number>(135);
  const [lastExportInfo, setLastExportInfo] = useState<string>("");

  const imgRef = useRef<HTMLImageElement | null>(null);

  const bgStyle = useMemo<React.CSSProperties>(() => {
    if (bgMode === "transparent") return checkerboardStyle();
    if (bgMode === "gradient") return { backgroundImage: buildGradientCSS(gradAngle, gradA, gradB) };
    return { backgroundColor: bgColor };
  }, [bgMode, bgColor, gradA, gradB, gradAngle]);

  const handleRemoveBackground = async () => {
    setIsRemovingBg(true);
    try {
      const result = await removeBackground(imageSrc);
      setImageSrc(result);
    } catch (e) {
      console.error("BG Remove failed", e);
      alert("Could not remove background. Please try again.");
    } finally {
      setIsRemovingBg(false);
    }
  };

  async function handleDownload(format: Format) {
    if (!imgRef.current) return;
    const img = imgRef.current;
    
    // Create a new image element to load the potentially updated src
    const imageToRender = new Image();
    imageToRender.crossOrigin = "anonymous";
    imageToRender.src = imageSrc;
    await new Promise(resolve => { imageToRender.onload = resolve; });

    const W = Math.max(800, imageToRender.naturalWidth || 1200);
    const H = Math.max(600, imageToRender.naturalHeight || 800);

    const result = await renderWithLimit({
      width: W, height: H, scaleStart: 2, bgMode, bgColor, gradA, gradB, gradAngle, img: imageToRender, format, hardLimit: HARD_LIMIT_BYTES,
    });

    if (!result) {
      alert("Could not fit under 512KB. Try WEBP format.");
      return;
    }

    const { blob, bytes, scaleUsed } = result;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug(title)}-${bgMode}.${format}`;
    a.click();
    URL.revokeObjectURL(url);

    setLastExportInfo(`${format.toUpperCase()} • ${(bytes / 1024).toFixed(1)}KB • ${scaleUsed}x`);
  }

  return (
    <div className="flex flex-col h-full bg-background-dark text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
        <div>
          <h2 className="text-lg font-bold">Studio Editor</h2>
          <p className="text-xs text-gray-400">Optimize & Export Assets</p>
        </div>
        <button onClick={onClose} className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold hover:bg-white/20 transition-colors">
          Close
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 p-8 overflow-auto flex items-center justify-center bg-black/20">
          <div 
             className="relative w-full h-full max-w-4xl max-h-[800px] rounded-2xl shadow-xl overflow-hidden bg-white ring-1 ring-white/10 flex items-center justify-center transition-all"
             style={bgStyle}
          >
             <img ref={imgRef} src={imageSrc} alt={title} className="max-w-[80%] max-h-[80%] object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.5)]" />
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="w-80 bg-background-dark border-l border-white/10 p-6 flex-shrink-0 overflow-y-auto">
           <div className="space-y-8">
              <div className="space-y-3">
                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Image Tools</label>
                 <Button
                    variant="outline"
                    onClick={handleRemoveBackground}
                    isLoading={isRemovingBg}
                    disabled={isRemovingBg}
                    className="w-full"
                 >
                    <span className="material-symbols-outlined mr-2 text-sm">auto_fix_high</span>
                    {isRemovingBg ? "Creating cutout..." : "Remove Background"}
                 </Button>
              </div>

              <div className="space-y-3">
                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Background</label>
                 <div className="grid grid-cols-3 gap-2 bg-black/20 p-1 rounded-lg">
                    {(["transparent", "solid", "gradient"] as BgMode[]).map(m => (
                       <button
                          key={m}
                          onClick={() => setBgMode(m)}
                          className={`py-2 text-xs font-medium rounded-md ${bgMode === m ? 'bg-primary text-white shadow-glow-primary' : 'hover:bg-white/10'}`}
                       >
                          {capitalize(m)}
                       </button>
                    ))}
                 </div>
              </div>

              {bgMode === 'solid' && (
                 <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Color</label>
                    <div className="grid grid-cols-5 gap-2">
                       {brandSwatches.map(c => (
                          <button key={c} onClick={() => setBgColor(c)} className={`h-8 rounded-md shadow-sm border border-white/10 ${bgColor === c ? 'ring-2 ring-primary' : ''}`} style={{backgroundColor: c}} />
                       ))}
                    </div>
                    <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer bg-transparent border-white/10" />
                 </div>
              )}

              {bgMode === 'gradient' && (
                 <div className="space-y-4">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Gradient</label>
                    <div className="space-y-2">
                       <div className="flex gap-2"><input type="color" value={gradA} onChange={e => setGradA(e.target.value)} className="h-8 w-8 rounded bg-transparent"/><input type="text" value={gradA} onChange={e => setGradA(e.target.value)} className="flex-1 border border-white/10 rounded px-2 text-xs bg-transparent"/></div>
                       <div className="flex gap-2"><input type="color" value={gradB} onChange={e => setGradB(e.target.value)} className="h-8 w-8 rounded bg-transparent"/><input type="text" value={gradB} onChange={e => setGradB(e.target.value)} className="flex-1 border border-white/10 rounded px-2 text-xs bg-transparent"/></div>
                    </div>
                    <input type="range" min={0} max={360} value={gradAngle} onChange={e => setGradAngle(Number(e.target.value))} className="w-full accent-primary"/>
                 </div>
              )}

              <div className="pt-6 border-t border-white/10 space-y-3">
                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wide flex justify-between">
                    Export <span className="text-electric-green">Max 512KB</span>
                 </label>
                 <Button onClick={() => handleDownload('png')} className="w-full">Download PNG</Button>
                 <Button onClick={() => handleDownload('webp')} variant="secondary" className="w-full">Download WEBP</Button>
                 {lastExportInfo && <p className="text-xs text-center text-gray-400 bg-black/20 py-1 rounded">{lastExportInfo}</p>}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// ... helpers ...
function checkerboardStyle(): React.CSSProperties {
  return {
    backgroundImage: "linear-gradient(45deg, #1A1A2E 25%, transparent 25%), linear-gradient(-45deg, #1A1A2E 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1A1A2E 75%), linear-gradient(-45deg, transparent 75%, #1A1A2E 75%)",
    backgroundSize: "20px 20px", backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
  };
}
function buildGradientCSS(angle: number, c1: string, c2: string) { return `linear-gradient(${angle}deg, ${c1} 0%, ${c2} 100%)`; }
function slug(s: string) { return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""); }
function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

async function renderWithLimit(options: any): Promise<null | { blob: Blob; bytes: number; scaleUsed: number; qualityUsed?: number; }> {
  const { width, height, scaleStart, format, hardLimit } = options;
  for (let scale = scaleStart; scale >= 0.5; scale -= 0.25) {
    const res = await renderOnce({ ...options, scale });
    if (!res) continue;

    if (format === "png") {
      if (res.bytes <= hardLimit) return { ...res, scaleUsed: scale };
      continue; 
    }

    for (let q = 0.92; q >= 0.4; q -= 0.08) {
      const resQ = await renderOnce({ ...options, scale, quality: q });
      if (!resQ) continue;
      if (resQ.bytes <= hardLimit) return { ...resQ, scaleUsed: scale, qualityUsed: Math.round(q*100)/100 };
    }
  }
  return null;
}

async function renderOnce(options: any): Promise<null | { blob: Blob; bytes: number; }> {
  const { width, height, scale, bgMode, bgColor, gradA, gradB, gradAngle, img, format, quality } = options;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);

  if (bgMode === "transparent") {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  } else if (bgMode === "solid") {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    const rad = (gradAngle * Math.PI) / 180;
    const x1 = canvas.width / 2 - (Math.cos(rad) * canvas.width) / 2;
    const y1 = canvas.height / 2 - (Math.sin(rad) * canvas.height) / 2;
    const x2 = canvas.width / 2 + (Math.cos(rad) * canvas.width) / 2;
    const y2 = canvas.height / 2 + (Math.sin(rad) * canvas.height) / 2;
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, gradA);
    grad.addColorStop(1, gradB);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const pad = Math.round(40 * scale);
  const maxW = canvas.width - pad * 2;
  const maxH = canvas.height - pad * 2;
  const ratio = Math.min(maxW / (img.naturalWidth || 1), maxH / (img.naturalHeight || 1));
  const drawW = (img.naturalWidth || 1) * ratio;
  const drawH = (img.naturalHeight || 1) * ratio;
  const dx = (canvas.width - drawW) / 2;
  const dy = (canvas.height - drawH) / 2;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, dx, dy, drawW, drawH);

  const mime = format === "png" ? "image/png" : "image/webp";
  const q = format === "webp" ? (quality ?? 0.92) : undefined;
  
  return new Promise((resolve) => {
    canvas.toBlob((b) => {
      resolve(b ? { blob: b, bytes: b.size } : null);
    }, mime, q);
  });
}
