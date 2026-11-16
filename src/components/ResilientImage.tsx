import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  watermarkText?: string;
  compactWatermark?: boolean;
}

const MAX_CACHE_ENTRIES = 80;
const watermarkedCache = new Map<string, string>();

function getCacheKey(
  src: string,
  watermarkText: string,
  compactWatermark: boolean
): string {
  return `${watermarkText}::${compactWatermark ? '1' : '0'}::${src}`;
}

function setCachedWatermark(key: string, value: string): void {
  if (watermarkedCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = watermarkedCache.keys().next().value;
    if (oldestKey !== undefined) {
      watermarkedCache.delete(oldestKey);
    }
  }
  watermarkedCache.set(key, value);
}

async function waitForFontsBriefly(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts?.ready) return;
  await Promise.race([
    document.fonts.ready.then(() => undefined),
    new Promise<void>((resolve) => setTimeout(resolve, 350)),
  ]);
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

async function createWatermarkedDataUrl(
  src: string,
  watermarkText: string,
  compactWatermark: boolean
): Promise<string> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const loader = new Image();
    if (/^https?:\/\//i.test(src)) {
      loader.crossOrigin = 'anonymous';
      loader.referrerPolicy = 'no-referrer';
    }
    loader.onload = () => resolve(loader);
    loader.onerror = () => reject(new Error('Image load failed'));
    loader.src = src;
  });

  await waitForFontsBriefly();

  const naturalWidth = Math.max(1, img.naturalWidth || img.width);
  const naturalHeight = Math.max(1, img.naturalHeight || img.height);
  const targetWidth = Math.min(1200, naturalWidth);
  const targetHeight = Math.max(
    1,
    Math.round(naturalHeight * (targetWidth / naturalWidth))
  );

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context unavailable');
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // 1. Centered diagonal translucent watermark across the transformer photo
  ctx.save();
  ctx.translate(targetWidth / 2, targetHeight / 2);
  ctx.rotate((-22 * Math.PI) / 180);

  let diagonalFontSize = Math.max(
    16,
    Math.round(targetWidth * (compactWatermark ? 0.068 : 0.056))
  );
  const fontFamily = '"IBM Plex Sans Thai", "Noto Sans Thai", "Tahoma", sans-serif';
  ctx.font = `700 ${diagonalFontSize}px ${fontFamily}`;

  const maxSpan = Math.min(
    targetWidth * 0.9,
    Math.hypot(targetWidth, targetHeight) * 0.72
  );
  const measuredWidth = ctx.measureText(watermarkText).width;
  if (measuredWidth > maxSpan && measuredWidth > 0) {
    diagonalFontSize = Math.max(
      12,
      Math.floor(diagonalFontSize * (maxSpan / measuredWidth))
    );
    ctx.font = `700 ${diagonalFontSize}px ${fontFamily}`;
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.56)';
  ctx.lineWidth = Math.max(2, diagonalFontSize * 0.14);
  ctx.strokeText(watermarkText, 0, 0);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
  ctx.fillText(watermarkText, 0, 0);
  ctx.restore();

  // 2. Crisp bottom-left stamp pill on standard-size photos
  if (!compactWatermark) {
    ctx.save();
    let badgeFontSize = Math.max(11, Math.round(targetWidth * 0.024));
    ctx.font = `600 ${badgeFontSize}px ${fontFamily}`;
    let badgeTextWidth = ctx.measureText(watermarkText).width;
    const maxBadgeTextWidth = targetWidth * 0.54;

    if (badgeTextWidth > maxBadgeTextWidth && badgeTextWidth > 0) {
      badgeFontSize = Math.max(
        10,
        Math.floor(badgeFontSize * (maxBadgeTextWidth / badgeTextWidth))
      );
      ctx.font = `600 ${badgeFontSize}px ${fontFamily}`;
      badgeTextWidth = ctx.measureText(watermarkText).width;
    }

    const padX = Math.round(badgeFontSize * 0.75);
    const padY = Math.round(badgeFontSize * 0.45);
    const pillWidth = badgeTextWidth + padX * 2;
    const pillHeight = badgeFontSize + padY * 2;
    const marginX = Math.max(10, Math.round(targetWidth * 0.025));
    const marginY = Math.max(10, Math.round(targetHeight * 0.032));
    const pillX = marginX;
    const pillY = targetHeight - pillHeight - marginY;

    drawRoundedRectPath(
      ctx,
      pillX,
      pillY,
      pillWidth,
      pillHeight,
      Math.max(4, Math.round(badgeFontSize * 0.35))
    );
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fill();
    ctx.lineWidth = Math.max(1, targetWidth * 0.0018);
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.9)';
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FEF3C7';
    ctx.fillText(watermarkText, pillX + padX, pillY + pillHeight / 2 + 0.5);
    ctx.restore();
  }

  return canvas.toDataURL('image/jpeg', 0.9);
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackTitle,
  watermarkText,
  compactWatermark = false,
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  const cacheKey =
    src && watermarkText
      ? getCacheKey(src, watermarkText, compactWatermark)
      : '';
  const cachedUrl = cacheKey ? watermarkedCache.get(cacheKey) || null : null;

  const [watermarkedSrc, setWatermarkedSrc] = useState<string | null>(cachedUrl);

  useEffect(() => {
    setHasError(false);
    if (!src || !watermarkText) {
      setWatermarkedSrc(null);
      return;
    }

    const key = getCacheKey(src, watermarkText, compactWatermark);
    const existing = watermarkedCache.get(key);
    if (existing) {
      setWatermarkedSrc(existing);
      return;
    }

    setWatermarkedSrc(null);
    let cancelled = false;

    createWatermarkedDataUrl(src, watermarkText, compactWatermark)
      .then((dataUrl) => {
        setCachedWatermark(key, dataUrl);
        if (!cancelled) {
          setWatermarkedSrc(dataUrl);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setWatermarkedSrc(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [src, watermarkText, compactWatermark]);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-slate-100 text-slate-500 p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="w-12 h-12 rounded-lg bg-slate-200/80 flex items-center justify-center mb-3">
          <Zap className="w-6 h-6 text-slate-600" aria-hidden="true" />
        </div>
        <p className="text-xs font-medium text-slate-700 line-clamp-2 max-w-[220px]">
          {fallbackTitle || alt}
        </p>
      </div>
    );
  }

  if (!watermarkText) {
    return (
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={className}
      />
    );
  }

  const displaySrc = watermarkedSrc || src;
  const showOverlayFallback = !watermarkedSrc;

  return (
    <div className="relative w-full h-full">
      <img
        src={displaySrc}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={className}
      />

      {showOverlayFallback && (
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute inset-0 overflow-hidden flex items-center justify-center"
        >
          <span
            className={`-rotate-[22deg] font-bold text-white/80 drop-shadow-[0_1px_3px_rgba(15,23,42,0.85)] whitespace-nowrap px-2 ${
              compactWatermark ? 'text-[10px]' : 'text-sm sm:text-base'
            }`}
          >
            {watermarkText}
          </span>
          {!compactWatermark && (
            <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-slate-900/80 border border-amber-400/90 text-[10px] sm:text-xs font-semibold text-amber-100 whitespace-nowrap">
              {watermarkText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
