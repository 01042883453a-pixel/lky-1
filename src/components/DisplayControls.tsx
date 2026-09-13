import { LayoutWidth, FontSizeScale } from '../types';
import { Maximize2, Minimize2, Type, ZoomIn, ZoomOut, Monitor } from 'lucide-react';

interface DisplayControlsProps {
  layoutWidth: LayoutWidth;
  onLayoutWidthChange: (width: LayoutWidth) => void;
  fontSizeScale: FontSizeScale;
  onFontSizeScaleChange: (scale: FontSizeScale) => void;
  zoomLevel: number;
  onZoomLevelChange: (zoom: number) => void;
}

export default function DisplayControls({
  layoutWidth,
  onLayoutWidthChange,
  fontSizeScale,
  onFontSizeScaleChange,
  zoomLevel,
  onZoomLevelChange,
}: DisplayControlsProps) {
  const handleZoomIn = () => {
    if (zoomLevel < 130) {
      onZoomLevelChange(Math.min(130, zoomLevel + 5));
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel > 90) {
      onZoomLevelChange(Math.max(90, zoomLevel - 5));
    }
  };

  const handleZoomReset = () => {
    onZoomLevelChange(100);
  };

  return (
    <div className="bg-white/90 backdrop-blur-xs border border-stone-200/80 rounded-2xl p-3 sm:px-4 sm:py-2.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
      {/* Left: Screen Ratio selection */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-bold text-stone-700 flex items-center gap-1.5 shrink-0">
          <Monitor className="w-4 h-4 text-amber-800" />
          <span>화면 비율:</span>
        </span>
        <div className="inline-flex bg-stone-100 p-0.5 rounded-xl border border-stone-200/80">
          <button
            type="button"
            id="btn-layout-standard"
            onClick={() => onLayoutWidthChange('standard')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              layoutWidth === 'standard'
                ? 'bg-white text-amber-950 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            title="기본 폭 (1024px)"
          >
            기본 (1024px)
          </button>
          <button
            type="button"
            id="btn-layout-wide"
            onClick={() => onLayoutWidthChange('wide')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              layoutWidth === 'wide'
                ? 'bg-white text-amber-950 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            title="넓은 화면 (1280px)"
          >
            넓게 (와이드)
          </button>
          <button
            type="button"
            id="btn-layout-full"
            onClick={() => onLayoutWidthChange('full')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
              layoutWidth === 'full'
                ? 'bg-white text-amber-950 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            title="모니터 전체 채우기 (96%)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>전체 화면</span>
          </button>
        </div>
      </div>

      {/* Right: Font Size and Zoom controls */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Font size switcher */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-stone-700 flex items-center gap-1.5 shrink-0">
            <Type className="w-4 h-4 text-amber-800" />
            <span>글씨 크기:</span>
          </span>
          <div className="inline-flex bg-stone-100 p-0.5 rounded-xl border border-stone-200/80">
            <button
              type="button"
              id="btn-font-normal"
              onClick={() => onFontSizeScaleChange('normal')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                fontSizeScale === 'normal'
                  ? 'bg-white text-amber-950 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="기본 글씨 크기 (16px)"
            >
              보통
            </button>
            <button
              type="button"
              id="btn-font-large"
              onClick={() => onFontSizeScaleChange('large')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                fontSizeScale === 'large'
                  ? 'bg-white text-amber-950 shadow-2xs font-bold text-amber-900'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="크게 확대 (18px)"
            >
              크게
            </button>
            <button
              type="button"
              id="btn-font-xlarge"
              onClick={() => onFontSizeScaleChange('xlarge')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                fontSizeScale === 'xlarge'
                  ? 'bg-white text-amber-950 shadow-2xs font-bold text-amber-900'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="아주 크게 확대 (20px)"
            >
              아주 크게
            </button>
          </div>
        </div>

        {/* Zoom Level +/- */}
        <div className="hidden sm:flex items-center gap-1.5 bg-stone-100 px-2 py-0.5 rounded-xl border border-stone-200/80">
          <span className="text-xs font-semibold text-stone-500 mr-1">배율:</span>
          <button
            type="button"
            id="btn-zoom-out"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 90}
            className="p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-md disabled:opacity-30"
            title="화면 축소"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            id="btn-zoom-reset"
            onClick={handleZoomReset}
            className="text-xs font-bold text-stone-700 hover:text-amber-900 px-1 py-0.5 rounded hover:bg-stone-200"
            title="배율 100% 리셋"
          >
            {zoomLevel}%
          </button>
          <button
            type="button"
            id="btn-zoom-in"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 130}
            className="p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-md disabled:opacity-30"
            title="화면 확대"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
