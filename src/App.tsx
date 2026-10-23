/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import meJpegUrl from '../me.jpeg';

export const CALENDLY_BASE_URL = 'https://calendly.com/byabdullahkhan/book_and_discuss';

/**
 * Removes only the exterior connected white studio background from an uploaded
 * portrait (such as me.jpeg) while preserving 100% of the subject's face,
 * sunglasses, suit, watch, and interior white dress shirt.
 */
function createCutoutAndCircularAvatar(img: HTMLImageElement): {
  cutoutUrl: string;
  avatarUrl: string;
} {
  const targetW = 1670;
  const targetH = 1916;

  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = srcW;
  tempCanvas.height = srcH;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return { cutoutUrl: img.src, avatarUrl: img.src };

  tempCtx.drawImage(img, 0, 0, srcW, srcH);
  const imageData = tempCtx.getImageData(0, 0, srcW, srcH);
  const data = imageData.data;

  const visited = new Uint8Array(srcW * srcH);
  const isBg = new Uint8Array(srcW * srcH);
  const queue = new Int32Array(srcW * srcH);
  let head = 0;
  let tail = 0;

  const isWhiteBackdrop = (idx: number) => {
    const p = idx * 4;
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    return r > 218 && g > 218 && b > 214 && max - min < 28;
  };

  for (let x = 0; x < srcW; x++) {
    if (isWhiteBackdrop(x)) {
      visited[x] = 1;
      queue[tail++] = x;
    }
  }
  for (let y = 0; y < srcH; y++) {
    const l = y * srcW;
    if (!visited[l] && isWhiteBackdrop(l)) {
      visited[l] = 1;
      queue[tail++] = l;
    }
    const r = y * srcW + (srcW - 1);
    if (!visited[r] && isWhiteBackdrop(r)) {
      visited[r] = 1;
      queue[tail++] = r;
    }
  }

  while (head < tail) {
    const curr = queue[head++];
    isBg[curr] = 1;
    const cx = curr % srcW;
    const cy = (curr / srcW) | 0;

    if (cx > 0) {
      const n = curr - 1;
      if (!visited[n] && isWhiteBackdrop(n)) {
        visited[n] = 1;
        queue[tail++] = n;
      }
    }
    if (cx + 1 < srcW) {
      const n = curr + 1;
      if (!visited[n] && isWhiteBackdrop(n)) {
        visited[n] = 1;
        queue[tail++] = n;
      }
    }
    if (cy > 0) {
      const n = curr - srcW;
      if (!visited[n] && isWhiteBackdrop(n)) {
        visited[n] = 1;
        queue[tail++] = n;
      }
    }
    if (cy + 1 < srcH) {
      const n = curr + srcW;
      if (!visited[n] && isWhiteBackdrop(n)) {
        visited[n] = 1;
        queue[tail++] = n;
      }
    }
  }

  let minX = srcW;
  let maxX = 0;
  let minY = srcH;
  let maxY = 0;

  for (let i = 0; i < srcW * srcH; i++) {
    const alpha = data[i * 4 + 3];
    if (isBg[i] || alpha < 16) {
      data[i * 4 + 3] = 0;
    } else {
      const cx = i % srcW;
      const cy = (i / srcW) | 0;
      if (cx < minX) minX = cx;
      if (cx > maxX) maxX = cx;
      if (cy < minY) minY = cy;
      if (cy > maxY) maxY = cy;
    }
  }

  tempCtx.putImageData(imageData, 0, 0);

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { cutoutUrl: img.src, avatarUrl: img.src };

  const bboxW = Math.max(1, maxX - minX + 1);
  const bboxH = Math.max(1, maxY - minY + 1);

  const scale = (targetH * 0.94) / bboxH;
  const renderW = bboxW * scale;
  const renderH = bboxH * scale;

  const dx = (targetW - renderW) / 2;
  const dy = targetH - renderH;

  ctx.clearRect(0, 0, targetW, targetH);
  ctx.drawImage(tempCanvas, minX, minY, bboxW, bboxH, dx, dy, renderW, renderH);

  const cutoutUrl = canvas.toDataURL('image/png');

  // Circular avatar for CTAs & navigation
  const avatarSize = 256;
  const avatarCanvas = document.createElement('canvas');
  avatarCanvas.width = avatarSize;
  avatarCanvas.height = avatarSize;
  const aCtx = avatarCanvas.getContext('2d');
  if (!aCtx) return { cutoutUrl, avatarUrl: cutoutUrl };

  const faceBoxY = minY;
  const faceBoxH = bboxH * 0.44;
  const faceBoxW = bboxW * 0.72;
  const faceBoxX = minX + (bboxW - faceBoxW) / 2;

  aCtx.save();
  aCtx.beginPath();
  aCtx.arc(avatarSize / 2, avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  aCtx.closePath();
  aCtx.clip();

  aCtx.fillStyle = '#565653';
  aCtx.fillRect(0, 0, avatarSize, avatarSize);

  aCtx.drawImage(
    img,
    faceBoxX,
    faceBoxY,
    faceBoxW,
    faceBoxH,
    0,
    0,
    avatarSize,
    avatarSize
  );
  aCtx.restore();

  const avatarUrl = avatarCanvas.toDataURL('image/png');
  return { cutoutUrl, avatarUrl };
}

export default function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, setHasCustomPhoto] = useState(true);

  const applyPortraitToDom = (cutoutDataUrl: string, avatarDataUrl?: string) => {
    const isCustom = cutoutDataUrl.startsWith('data:image/');
    const targetDeskCutout = isCustom ? cutoutDataUrl : '/me-cutout.webp';
    const targetMobileCutout = isCustom ? cutoutDataUrl : '/me-cutout-mobile.webp';

    document.querySelectorAll<HTMLImageElement>('.hero-profile-img').forEach((el) => {
      if (el.getAttribute('src') !== targetDeskCutout) {
        el.src = targetDeskCutout;
      }
      el.removeAttribute('srcset');
    });

    document.querySelectorAll<HTMLImageElement>('.mobile-hero-image').forEach((el) => {
      if (el.getAttribute('src') !== targetMobileCutout) {
        el.src = targetMobileCutout;
      }
      el.removeAttribute('srcset');
    });

    if (avatarDataUrl) {
      const targetAvatar = avatarDataUrl.startsWith('data:image/') ? avatarDataUrl : '/me-avatar.webp';
      document
        .querySelectorAll<HTMLImageElement>('.cta_img, .is-profile-avatar')
        .forEach((el) => {
          if (el.getAttribute('src') !== targetAvatar) {
            el.src = targetAvatar;
          }
          el.removeAttribute('srcset');
        });
    }
    if (cutoutDataUrl.startsWith('data:image/')) {
      fetch('/__save_portrait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cutoutUrl: cutoutDataUrl, avatarUrl: avatarDataUrl }),
      }).catch(() => {});
    }
  };

  useEffect(() => {
    try {
      [
        'abdullah_exact_cutout_v3',
        'abdullah_circular_avatar_v4',
        'abdullah_me_cutout_v6',
        'abdullah_me_avatar_v6',
        'abdullah_me_cutout_v7',
        'abdullah_me_avatar_v7',
        'abdullah_me_cutout_v8',
        'abdullah_me_avatar_v8',
      ].forEach((k) => localStorage.removeItem(k));
    } catch {
      // Ignore storage errors
    }

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    applyPortraitToDom(isMobile ? '/me-cutout-mobile.webp' : '/me-cutout.webp', '/me-avatar.webp');
    setHasCustomPhoto(true);
  }, []);

  // Ensure all booking and CTA buttons ("Book a Call", "Let's Talk", and service plan options)
  // directly open the Calendly link in a new tab without opening an iframe modal.
  useEffect(() => {
    const handleBookingClick = (e: MouseEvent) => {
      const target = e.currentTarget as HTMLElement | null;
      if (!target) return;

      // If it's a non-anchor element (such as .service-price-item), open Calendly directly
      if (target.tagName.toLowerCase() !== 'a') {
        e.preventDefault();
        e.stopPropagation();
        window.open(CALENDLY_BASE_URL, '_blank', 'noopener,noreferrer');
        return;
      }

      // For anchor elements, ensure href and target are pristine
      const anchor = target as HTMLAnchorElement;
      anchor.href = CALENDLY_BASE_URL;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
    };

    const selectors = [
      '.nav-button',
      '.nav-button-mobile',
      '.hero-cta-button',
      '.cta-button',
      '.service-price-item',
    ];

    const elements: Element[] = [];
    selectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.cursor = 'pointer';

        if (htmlEl.tagName.toLowerCase() === 'a') {
          const anchor = htmlEl as HTMLAnchorElement;
          anchor.href = CALENDLY_BASE_URL;
          anchor.target = '_blank';
          anchor.rel = 'noopener noreferrer';
        } else {
          htmlEl.setAttribute('role', 'button');
          htmlEl.setAttribute('tabindex', '0');
          htmlEl.setAttribute('title', 'Book a Call');
        }

        htmlEl.addEventListener('click', handleBookingClick as EventListener);
        elements.push(htmlEl);
      });
    });

    return () => {
      elements.forEach((el) => el.removeEventListener('click', handleBookingClick as EventListener));
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      const rawUrl = reader.result;
      const img = new Image();
      img.onload = () => {
        const { cutoutUrl, avatarUrl } = createCutoutAndCircularAvatar(img);
        applyPortraitToDom(cutoutUrl, avatarUrl);
        setHasCustomPhoto(true);
        try {
          localStorage.setItem('abdullah_me_cutout_v8', cutoutUrl);
          localStorage.setItem('abdullah_me_avatar_v8', avatarUrl);
        } catch {
          // Ignore storage quota issues
        }
      };
      img.src = rawUrl;
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      {/* Hidden file input for custom portrait update */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
        aria-hidden="true"
      />
    </>
  );
}
