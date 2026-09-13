import { useState } from 'react';
import { X, ZoomIn, ZoomOut, Download, Copy, Check } from 'lucide-react';

interface ImageViewerModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export default function ImageViewerModal({ imageUrl, onClose }: ImageViewerModalProps) {
  const [scale, setScale] = useState(1);
  const [copied, setCopied] = useState(false);

  if (!imageUrl) return null;

  const handleCopy = async () => {
    try {
      if (imageUrl.startsWith('data:image')) {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `reading-image-${Date.now()}.png`;
    link.click();
  };

  return (
    <div
      id="image-viewer-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        id="image-viewer-container"
        className="relative max-h-[90vh] max-w-[90vw] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Controls header */}
        <div className="mb-3 flex items-center gap-2 rounded-full bg-stone-900/80 px-4 py-2 text-white border border-stone-700 shadow-lg">
          <button
            type="button"
            id="btn-zoom-in"
            onClick={() => setScale((s) => Math.min(s + 0.25, 3))}
            className="flex items-center gap-1 text-xs hover:text-amber-300 transition-colors p-1"
            title="확대"
          >
            <ZoomIn className="w-4 h-4" />
            <span>확대</span>
          </button>
          <span className="text-stone-500">|</span>
          <button
            type="button"
            id="btn-zoom-out"
            onClick={() => setScale((s) => Math.max(s - 0.25, 0.5))}
            className="flex items-center gap-1 text-xs hover:text-amber-300 transition-colors p-1"
            title="축소"
          >
            <ZoomOut className="w-4 h-4" />
            <span>축소</span>
          </button>
          <span className="text-stone-500">|</span>
          <button
            type="button"
            id="btn-copy-image"
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs hover:text-amber-300 transition-colors p-1"
            title="이미지 복사"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '복사됨' : '복사'}</span>
          </button>
          <button
            type="button"
            id="btn-download-image"
            onClick={handleDownload}
            className="flex items-center gap-1 text-xs hover:text-amber-300 transition-colors p-1"
            title="다운로드"
          >
            <Download className="w-4 h-4" />
            <span>저장</span>
          </button>
          <span className="text-stone-500">|</span>
          <button
            type="button"
            id="btn-close-viewer"
            onClick={onClose}
            className="text-stone-400 hover:text-white transition-colors p-1 ml-1"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Display */}
        <div className="overflow-auto max-h-[80vh] max-w-[85vw] rounded-lg shadow-2xl border border-stone-800 bg-stone-950 flex items-center justify-center p-2">
          <img
            src={imageUrl}
            alt="독서 기록 사진"
            className="max-h-[75vh] max-w-full object-contain transition-transform duration-150"
            style={{ transform: `scale(${scale})` }}
          />
        </div>
      </div>
    </div>
  );
}
