/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import savedPortrait from './data/savedPortrait.json';
import {
  Calendar as CalendarIcon,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Mail,
  Video,
  X,
} from 'lucide-react';

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

      let bgNeighbors = 0;
      if (cx > 0 && isBg[i - 1]) bgNeighbors++;
      if (cx + 1 < srcW && isBg[i + 1]) bgNeighbors++;
      if (cy > 0 && isBg[i - srcW]) bgNeighbors++;
      if (cy + 1 < srcH && isBg[i + srcW]) bgNeighbors++;
      if (bgNeighbors > 0) {
        data[i * 4 + 3] = Math.round(255 * (1 - bgNeighbors * 0.2));
      }
    }
  }

  tempCtx.putImageData(imageData, 0, 0);

  // Step 2: Place trimmed subject onto a 1670x1916 canvas aligned to bottom-center
  const outCanvas = document.createElement('canvas');
  outCanvas.width = targetW;
  outCanvas.height = targetH;
  const outCtx = outCanvas.getContext('2d');
  const trimW = Math.max(1, maxX - minX + 1);
  const trimH = Math.max(1, maxY - minY + 1);

  if (outCtx) {
    const desiredH = 1780;
    const scale = desiredH / trimH;
    const drawW = trimW * scale;
    const drawH = desiredH;
    const drawX = (targetW - drawW) / 2;
    const drawY = targetH - drawH;
    outCtx.drawImage(tempCanvas, minX, minY, trimW, trimH, drawX, drawY, drawW, drawH);
  }

  // Step 3: Build a 256x256 circular headshot profile picture (head & upper shoulders on #565653 circle)
  const avatarSize = 256;
  const avatarCanvas = document.createElement('canvas');
  avatarCanvas.width = avatarSize;
  avatarCanvas.height = avatarSize;
  const avatarCtx = avatarCanvas.getContext('2d');

  if (avatarCtx) {
    avatarCtx.save();
    avatarCtx.beginPath();
    avatarCtx.arc(avatarSize / 2, avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    avatarCtx.closePath();
    avatarCtx.clip();

    avatarCtx.fillStyle = '#565653';
    avatarCtx.fillRect(0, 0, avatarSize, avatarSize);

    const cropH = trimH * 0.56;
    const headScale = (avatarSize * 0.92) / cropH;
    const destW = trimW * headScale;
    const destH = cropH * headScale;
    const destX = (avatarSize - destW) / 2;
    const destY = avatarSize - destH + 6;

    avatarCtx.drawImage(tempCanvas, minX, minY, trimW, cropH, destX, destY, destW, destH);
    avatarCtx.restore();
  }

  return {
    cutoutUrl: outCanvas.toDataURL('image/png'),
    avatarUrl: avatarCanvas.toDataURL('image/png'),
  };
}

const TIME_SLOTS_12H = [
  '9:00am',
  '9:30am',
  '10:00am',
  '10:30am',
  '11:00am',
  '11:30am',
  '1:00pm',
  '1:30pm',
  '2:00pm',
  '2:30pm',
  '3:00pm',
  '4:00pm',
  '5:00pm',
];

const TIME_SLOTS_24H = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '16:00',
  '17:00',
];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export default function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasCustomPhoto, setHasCustomPhoto] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(() => savedPortrait.avatarUrl || '');

  // Cal.com-style Book a Call / Schedule a Call Modal State
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    return d;
  });
  const [selectedSlotIdx, setSelectedSlotIdx] = useState<number | null>(null);
  const [is24Hour, setIs24Hour] = useState(false);
  const [step, setStep] = useState<'calendar' | 'form' | 'confirmed'>('calendar');

  // Booking form fields
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestNotes, setGuestNotes] = useState('');

  const applyPortraitToDom = (cutoutDataUrl: string, avatarDataUrl?: string) => {
    document.querySelectorAll<HTMLImageElement>('.hero-profile-img, .mobile-hero-image').forEach((el) => {
      el.src = cutoutDataUrl;
      el.removeAttribute('srcset');
    });
    if (avatarDataUrl) {
      setAvatarSrc(avatarDataUrl);
      document
        .querySelectorAll<HTMLImageElement>('.cta_img, .is-profile-avatar')
        .forEach((el) => {
          el.src = avatarDataUrl;
          el.removeAttribute('srcset');
        });
    }
    fetch('/__save_portrait', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({cutoutUrl: cutoutDataUrl, avatarUrl: avatarDataUrl}),
    }).catch(() => {});
  };

  useEffect(() => {
    try {
      const savedCutout = localStorage.getItem('abdullah_exact_cutout_v3') || savedPortrait.cutoutUrl;
      const savedCircularAvatar = localStorage.getItem('abdullah_circular_avatar_v4') || savedPortrait.avatarUrl;
      if (savedCutout && savedCircularAvatar) {
        applyPortraitToDom(savedCutout, savedCircularAvatar);
        setHasCustomPhoto(true);
      } else if (savedCutout) {
        const img = new Image();
        img.onload = () => {
          const { avatarUrl } = createCutoutAndCircularAvatar(img);
          applyPortraitToDom(savedCutout, avatarUrl);
          setHasCustomPhoto(true);
          try {
            localStorage.setItem('abdullah_circular_avatar_v4', avatarUrl);
          } catch {
            // Ignore storage quota issues
          }
        };
        img.src = savedCutout;
      }
    } catch {
      // Ignore storage read issues
    }
  }, []);

  // Intercept clicks on all "Book a Call", "Schedule a Call", and "Let's Talk" buttons across the page
  useEffect(() => {
    const openBookingModal = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      setStep('calendar');
      setSelectedSlotIdx(null);
      setIsCalendarOpen(true);
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
        const text = (el.textContent || '').toLowerCase();
        if (
          sel !== '.service-price-item' ||
          text.includes('book a call') ||
          text.includes('schedule')
        ) {
          (el as HTMLElement).style.cursor = 'pointer';
          el.addEventListener('click', openBookingModal);
          elements.push(el);
        }
      });
    });

    return () => {
      elements.forEach((el) => el.removeEventListener('click', openBookingModal));
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
          localStorage.setItem('abdullah_exact_cutout_v3', cutoutUrl);
          localStorage.setItem('abdullah_circular_avatar_v4', avatarUrl);
        } catch {
          // Ignore storage quota issues
        }
      };
      img.src = rawUrl;
    };
    reader.readAsDataURL(file);
  };

  // Build calendar grid for current viewYear & viewMonth
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: Array<{ day: number | null; date?: Date; disabled?: boolean }> = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push({ day: null });
    }
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(viewYear, viewMonth, d);
      const isSunday = dateObj.getDay() === 0;
      const isPast = dateObj < startOfToday;
      cells.push({
        day: d,
        date: dateObj,
        disabled: isSunday || isPast,
      });
    }
    return cells;
  }, [viewYear, viewMonth, today]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const formattedSelectedDate = useMemo(() => {
    return selectedDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [selectedDate]);

  const activeSlotLabel =
    selectedSlotIdx !== null
      ? is24Hour
        ? TIME_SLOTS_24H[selectedSlotIdx]
        : TIME_SLOTS_12H[selectedSlotIdx]
      : '';

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local Time';
    try {
      await fetch('https://formsubmit.co/ajax/byabdullahkhan@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          _subject: `New Call Booked: ${guestName} — ${formattedSelectedDate} at ${activeSlotLabel}`,
          Name: guestName,
          Email: guestEmail,
          Date: formattedSelectedDate,
          Time: `${activeSlotLabel} (${timezone})`,
          Project_Notes: guestNotes || 'Let’s discuss my upcoming project.',
          _template: 'table',
        }),
      });
    } catch {
      // Fallback: open mail client if network blocks external request
      window.location.href = mailtoBookingHref;
    } finally {
      setIsSubmitting(false);
      setStep('confirmed');
    }
  };

  const mailtoBookingHref = useMemo(() => {
    const subject = encodeURIComponent(
      `Intro Call Booking: ${guestName || 'Client'} on ${formattedSelectedDate} at ${activeSlotLabel}`
    );
    const body = encodeURIComponent(
      `Hi Abdullah,\n\nI would like to schedule a 30-minute Intro Call with you.\n\n` +
        `• Name: ${guestName}\n` +
        `• Email: ${guestEmail}\n` +
        `• Date: ${formattedSelectedDate}\n` +
        `• Time: ${activeSlotLabel}\n` +
        `• Project Notes: ${guestNotes || 'Let’s discuss my upcoming project.'}\n\nBest regards,\n${guestName}`
    );
    return `mailto:byabdullahkhan@gmail.com?subject=${subject}&body=${body}`;
  }, [guestName, guestEmail, guestNotes, formattedSelectedDate, activeSlotLabel]);

  return (
    <>
      {/* Cal.com-style Interactive "Book a Call / Schedule a Call" Calendar Modal */}
      {isCalendarOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto"
          onClick={() => setIsCalendarOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl rounded-2xl bg-[#111111] border border-white/15 text-white shadow-2xl overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsCalendarOpen(false)}
              className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white cursor-pointer transition"
              aria-label="Close calendar"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[470px]">
              {/* Left Column: Host & Intro Call Details */}
              <div className="md:col-span-4 p-6 border-b md:border-b-0 md:border-r border-white/10 bg-[#161615] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={avatarSrc}
                      alt="Abdullah"
                      className="w-11 h-11 rounded-full object-cover bg-[#565653] border border-white/15"
                    />
                    <div>
                      <p className="text-xs font-medium text-white/60">Abdullah</p>
                      <p className="text-[11px] text-[#39FF14]">byabdullahkhan@gmail.com</p>
                    </div>
                  </div>

                  <h2 className="text-xl font-bold tracking-tight text-white mb-2">
                    Schedule a Call
                  </h2>
                  <p className="text-xs text-white/70 leading-relaxed mb-6">
                    Have something in mind? Book a 30-minute intro call to discuss your website,
                    project scope, timeline, and how we can work together.
                  </p>

                  <div className="space-y-3 text-xs text-white/80">
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-[#39FF14] shrink-0" />
                      <span>30m</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Video className="w-4 h-4 text-[#39FF14] shrink-0" />
                      <span>Google Meet video conference</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-[#39FF14] shrink-0" />
                      <span>{Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local Time'}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-[#39FF14] shrink-0" />
                      <span className="truncate">byabdullahkhan@gmail.com</span>
                    </div>
                  </div>
                </div>

                {selectedSlotIdx !== null && (
                  <div className="mt-6 pt-4 border-t border-white/10 text-xs">
                    <p className="text-white/50 uppercase tracking-wider text-[10px] mb-1">
                      Selected Slot
                    </p>
                    <p className="font-semibold text-[#39FF14]">
                      {formattedSelectedDate} • {activeSlotLabel}
                    </p>
                  </div>
                )}
              </div>

              {/* Center & Right Columns: Step 1 = Calendar + Time Slots */}
              {step === 'calendar' && (
                <>
                  {/* Center Column: Interactive Month Calendar */}
                  <div className="md:col-span-5 p-6 border-b md:border-b-0 md:border-r border-white/10">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-sm font-semibold text-white">
                        {MONTH_NAMES[viewMonth]}{' '}
                        <span className="text-white/50 font-normal">{viewYear}</span>
                      </h3>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handlePrevMonth}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white cursor-pointer transition"
                          aria-label="Previous month"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextMonth}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white cursor-pointer transition"
                          aria-label="Next month"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      {WEEKDAYS.map((day) => (
                        <div
                          key={day}
                          className="text-[10px] font-semibold tracking-wider text-white/45 py-1"
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1.5">
                      {calendarDays.map((cell, idx) => {
                        if (!cell.day || !cell.date) {
                          return <div key={`empty-${idx}`} className="aspect-square" />;
                        }
                        const isSelected =
                          cell.date.getFullYear() === selectedDate.getFullYear() &&
                          cell.date.getMonth() === selectedDate.getMonth() &&
                          cell.date.getDate() === selectedDate.getDate();

                        return (
                          <button
                            key={cell.day}
                            type="button"
                            disabled={cell.disabled}
                            onClick={() => {
                              if (cell.date) {
                                setSelectedDate(cell.date);
                                setSelectedSlotIdx(null);
                              }
                            }}
                            className={`aspect-square rounded-lg text-xs font-medium flex items-center justify-center transition relative ${
                              cell.disabled
                                ? 'text-white/20 cursor-not-allowed'
                                : isSelected
                                ? 'bg-[#39FF14] text-black font-bold shadow-md cursor-pointer'
                                : 'bg-[#1f1f1e] hover:bg-white/15 text-white cursor-pointer'
                            }`}
                          >
                            {cell.day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Time Slot Picker */}
                  <div className="md:col-span-3 p-5 flex flex-col max-h-[470px]">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs font-semibold text-white">
                        {selectedDate.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <div className="inline-flex rounded-lg bg-white/5 p-0.5 border border-white/10 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setIs24Hour(false)}
                          className={`px-2 py-0.5 rounded-md cursor-pointer transition ${
                            !is24Hour ? 'bg-white/15 text-white font-semibold' : 'text-white/50'
                          }`}
                        >
                          12h
                        </button>
                        <button
                          type="button"
                          onClick={() => setIs24Hour(true)}
                          className={`px-2 py-0.5 rounded-md cursor-pointer transition ${
                            is24Hour ? 'bg-white/15 text-white font-semibold' : 'text-white/50'
                          }`}
                        >
                          24h
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                      {(is24Hour ? TIME_SLOTS_24H : TIME_SLOTS_12H).map((slot, idx) => {
                        const active = selectedSlotIdx === idx;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => {
                              setSelectedSlotIdx(idx);
                              setStep('form');
                            }}
                            className={`w-full py-2.5 px-3 rounded-lg text-xs font-medium border transition flex items-center justify-center gap-2 cursor-pointer ${
                              active
                                ? 'bg-[#39FF14] text-black border-[#39FF14] font-bold'
                                : 'bg-[#181817] hover:bg-white/10 hover:border-[#39FF14]/50 border-white/10 text-white'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14]" />
                            <span>{slot}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Step 2: Guest Details Form */}
              {step === 'form' && (
                <div className="md:col-span-8 p-6 flex flex-col justify-between">
                  <form onSubmit={handleConfirmBooking} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <h3 className="text-base font-bold text-white">Confirm your details</h3>
                        <p className="text-xs text-white/60">
                          {formattedSelectedDate} at {activeSlotLabel} (30m)
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep('calendar')}
                        className="text-xs text-[#39FF14] hover:underline cursor-pointer"
                      >
                        ← Change Date / Time
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/80 mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full rounded-lg bg-[#1a1a19] border border-white/15 px-3.5 py-2.5 text-xs text-white placeholder-white/35 focus:outline-none focus:border-[#39FF14]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/80 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full rounded-lg bg-[#1a1a19] border border-white/15 px-3.5 py-2.5 text-xs text-white placeholder-white/35 focus:outline-none focus:border-[#39FF14]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/80 mb-1">
                        Tell me about your project
                      </label>
                      <textarea
                        rows={3}
                        value={guestNotes}
                        onChange={(e) => setGuestNotes(e.target.value)}
                        placeholder="Share a quick overview of your website goals, timeline, or questions..."
                        className="w-full rounded-lg bg-[#1a1a19] border border-white/15 px-3.5 py-2.5 text-xs text-white placeholder-white/35 focus:outline-none focus:border-[#39FF14]"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep('calendar')}
                        className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium text-white cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-5 py-2.5 rounded-lg bg-[#39FF14] hover:bg-[#32e010] disabled:opacity-60 text-xs font-bold text-black cursor-pointer shadow-lg"
                      >
                        {isSubmitting ? 'Scheduling...' : 'Schedule Call'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 3: Booking Confirmed */}
              {step === 'confirmed' && (
                <div className="md:col-span-8 p-8 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#39FF14]/15 border border-[#39FF14]/40 flex items-center justify-center text-[#39FF14]">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white">This meeting is scheduled</h3>
                  <p className="text-xs text-white/70 max-w-md">
                    Your 30-minute Intro Call with <strong className="text-white">Abdullah</strong> (
                    <span className="text-[#39FF14]">byabdullahkhan@gmail.com</span>) is set for{' '}
                    <strong className="text-white">
                      {formattedSelectedDate} at {activeSlotLabel}
                    </strong>
                    .
                  </p>

                  <div className="w-full max-w-sm rounded-xl bg-[#181817] border border-white/10 p-4 text-left text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-white/50">Host:</span>
                      <span className="font-medium text-white">Abdullah</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Guest:</span>
                      <span className="font-medium text-white">
                        {guestName} ({guestEmail})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">When:</span>
                      <span className="font-medium text-[#39FF14]">
                        {formattedSelectedDate} • {activeSlotLabel}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <a
                      href={mailtoBookingHref}
                      className="px-5 py-2.5 rounded-lg bg-[#39FF14] hover:bg-[#32e010] text-xs font-bold text-black flex items-center gap-2 shadow-lg"
                    >
                      <CalendarIcon className="w-3.5 h-3.5" />
                      <span>Send Confirmation Email</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setIsCalendarOpen(false)}
                      className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium text-white cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Photo Uploader Button */}
      <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-[9999]">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-[#141413]/85 hover:bg-[#141413] text-[#39FF14] border border-[#39FF14]/40 text-[11px] sm:text-xs font-medium flex items-center gap-1.5 sm:gap-2 shadow-lg backdrop-blur-md cursor-pointer transition-transform active:scale-95"
          title="Select your exact me.jpeg file from your device"
        >
          <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>{hasCustomPhoto ? 'Change Photo' : 'Upload Exact me.jpeg'}</span>
        </button>
      </div>
    </>
  );
}
