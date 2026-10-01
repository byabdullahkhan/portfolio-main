/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import meJpegUrl from '../me.jpeg';
import {
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Globe,
  Mail,
  Video,
  X,
} from 'lucide-react';

interface BookingRecord {
  id: string;
  name: string;
  email: string;
  notes: string;
  dateKey: string;
  dateLabel: string;
  slot24: string;
  slotLabel: string;
  timezone: string;
  createdAt: string;
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

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

    const cropH = Math.min(trimH * 0.56, trimW * 0.8);
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

function getInitialSelectableDate(): Date {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // Check if today has any remaining time slots (last slot is 17:00)
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  if (d.getDay() === 0 || currentMinutes >= 17 * 60) {
    d.setDate(d.getDate() + 1);
  }
  if (d.getDay() === 0) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

export default function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasCustomPhoto, setHasCustomPhoto] = useState(true);
  const [avatarSrc, setAvatarSrc] = useState<string>('./me-avatar.png?v=78769');

  // Cal.com-style Book a Call / Schedule a Call Modal State
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const today = useMemo(() => new Date(), []);
  const initialDate = useMemo(() => getInitialSelectableDate(), []);
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [selectedSlotIdx, setSelectedSlotIdx] = useState<number | null>(null);
  const [is24Hour, setIs24Hour] = useState(false);
  const [step, setStep] = useState<'calendar' | 'form' | 'confirmed'>('calendar');

  // Booking form fields & saved bookings
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestNotes, setGuestNotes] = useState('');
  const [bookedSlots, setBookedSlots] = useState<BookingRecord[]>([]);
  const [copiedDetails, setCopiedDetails] = useState(false);

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
      [
        'abdullah_exact_cutout_v3',
        'abdullah_circular_avatar_v4',
        'abdullah_me_cutout_v6',
        'abdullah_me_avatar_v6',
        'abdullah_me_cutout_v7',
        'abdullah_me_avatar_v7',
      ].forEach((k) => localStorage.removeItem(k));
    } catch {
      // Ignore storage errors
    }

    // Apply pre-generated cutout & circular avatar immediately so there is zero delay
    applyPortraitToDom('./me-cutout.png?v=78769', './me-avatar.png?v=78769');

    // Also process me.jpeg directly with a cache-busting query string so any update to me.jpeg always renders fresh
    const img = new Image();
    img.crossOrigin = 'anonymous';
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
    const sep = meJpegUrl.includes('?') ? '&' : '?';
    img.src = `${meJpegUrl}${sep}v=78769_${Date.now()}`;

    // Ensure browser tab favicon logo is always rendered
    const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128" fill="none"><rect width="128" height="128" rx="28" fill="#0D0D0D"/><rect x="4" y="4" width="120" height="120" rx="24" stroke="#39FF14" stroke-opacity="0.4" stroke-width="3"/><path d="M39.5 92L56.2 36H71.8L88.5 92H75.4L71.9 79.2H56.1L52.6 92H39.5ZM59.1 68.4H68.9L64 50.1L59.1 68.4Z" fill="#39FF14"/><circle cx="96" cy="36" r="10" fill="#EBEADA"/></svg>`;
    const faviconDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(faviconSvg)}`;
    let iconLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!iconLink) {
      iconLink = document.createElement('link');
      iconLink.rel = 'icon';
      document.head.appendChild(iconLink);
    }
    iconLink.type = 'image/svg+xml';
    iconLink.href = faviconDataUrl;
  }, []);

  // Load existing bookings from localStorage + backend API
  useEffect(() => {
    try {
      const localRaw = localStorage.getItem('abdullah_booked_slots_v1');
      if (localRaw) {
        const parsed = JSON.parse(localRaw);
        if (Array.isArray(parsed)) setBookedSlots(parsed);
      }
    } catch {
      // ignore
    }

    fetch('/api/bookings')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.bookings)) {
          setBookedSlots((prev) => {
            const map = new Map<string, BookingRecord>();
            [...prev, ...data.bookings].forEach((b: BookingRecord) => {
              if (b && b.dateKey && b.slot24) {
                map.set(`${b.dateKey}_${b.slot24}`, b);
              }
            });
            const merged = Array.from(map.values());
            try {
              localStorage.setItem('abdullah_booked_slots_v1', JSON.stringify(merged));
            } catch {
              // ignore
            }
            return merged;
          });
        }
      })
      .catch(() => {});
  }, [isCalendarOpen]);

  // Intercept clicks on all "Book a Call", "Schedule a Call", "Let's Talk", and Service Plan buttons across the page
  useEffect(() => {
    const openBookingModal = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.currentTarget as HTMLElement | null;
      if (target && target.classList.contains('service-price-item')) {
        const card = target.closest('.service-card');
        const heading = card?.querySelector('.service-card-heading')?.textContent?.trim();
        const badge = target.textContent?.trim();
        if (heading) {
          setGuestNotes((prev) =>
            prev ? prev : `Interested in ${heading}${badge ? ` (${badge})` : ''}.`
          );
        }
      }
      setStep('calendar');
      setSelectedSlotIdx(null);
      setCopiedDetails(false);
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
        (el as HTMLElement).style.cursor = 'pointer';
        el.addEventListener('click', openBookingModal);
        elements.push(el);
      });
    });

    return () => {
      elements.forEach((el) => el.removeEventListener('click', openBookingModal));
    };
  }, []);

  // Lock background page scroll & pause Lenis while the booking modal is open
  useEffect(() => {
    const lenis = (window as unknown as { AnimationEngine?: { debug?: { state?: () => { lenis?: { stop?: () => void; start?: () => void } } } } })
      .AnimationEngine?.debug?.state?.()?.lenis;

    if (isCalendarOpen) {
      document.body.style.overflow = 'hidden';
      lenis?.stop?.();
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsCalendarOpen(false);
      };
      window.addEventListener('keydown', onKeyDown);
      return () => {
        document.body.style.overflow = '';
        lenis?.start?.();
        window.removeEventListener('keydown', onKeyDown);
      };
    } else {
      document.body.style.overflow = '';
      lenis?.start?.();
    }
  }, [isCalendarOpen]);

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

  // Build calendar grid for current viewYear & viewMonth
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: Array<{ day: number | null; date?: Date; disabled?: boolean }> = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push({ day: null });
    }
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(viewYear, viewMonth, d);
      const isSunday = dateObj.getDay() === 0;
      const isPastDay = dateObj < startOfToday;
      const isTodayAfterHours =
        dateObj.getTime() === startOfToday.getTime() && currentMinutes >= 17 * 60;
      cells.push({
        day: d,
        date: dateObj,
        disabled: isSunday || isPastDay || isTodayAfterHours,
      });
    }
    return cells;
  }, [viewYear, viewMonth, today]);

  // Determine which time slots are disabled on selectedDate (either past today or already booked)
  const disabledSlotIndices = useMemo(() => {
    const set = new Set<number>();
    const selectedKey = toDateKey(selectedDate);
    const now = new Date();
    const isToday = toDateKey(now) === selectedKey;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    TIME_SLOTS_24H.forEach((slot24, idx) => {
      if (isToday) {
        const [hh, mm] = slot24.split(':').map((n) => parseInt(n, 10) || 0);
        if (hh * 60 + mm <= currentMinutes) {
          set.add(idx);
        }
      }
      const alreadyBooked = bookedSlots.some(
        (b) => b.dateKey === selectedKey && b.slot24 === slot24
      );
      if (alreadyBooked) {
        set.add(idx);
      }
    });
    return set;
  }, [selectedDate, bookedSlots]);

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

  // Compute start & end UTC timestamps (YYYYMMDDTHHmmssZ) for the selected 30m slot
  const meetingUtcRange = useMemo(() => {
    const slot24 = selectedSlotIdx !== null ? TIME_SLOTS_24H[selectedSlotIdx] : '09:00';
    const [hh, mm] = slot24.split(':').map((n) => parseInt(n, 10) || 0);
    const start = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      hh,
      mm,
      0
    );
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    const fmt = (d: Date) =>
      d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    return { startUtc: fmt(start), endUtc: fmt(end) };
  }, [selectedDate, selectedSlotIdx]);

  const googleCalendarHref = useMemo(() => {
    const title = encodeURIComponent(`30m Intro Call: ${guestName || 'Client'} × Abdullah`);
    const details = encodeURIComponent(
      `30-minute Intro Call with Muhammad Abdullah Khan (byabdullahkhan@gmail.com)\n\n` +
        `Guest: ${guestName} (${guestEmail})\n` +
        `Project Notes: ${guestNotes || 'Let’s discuss my upcoming project.'}`
    );
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${meetingUtcRange.startUtc}/${meetingUtcRange.endUtc}&details=${details}&add=byabdullahkhan@gmail.com`;
  }, [guestName, guestEmail, guestNotes, meetingUtcRange]);

  const handleDownloadIcs = () => {
    const safeNotes = (guestNotes || 'Let’s discuss my upcoming project.').replace(/\r?\n/g, '\\n');
    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//byabdullahkhan.com//Intro Call//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:abdullah-call-${Date.now()}@byabdullahkhan.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}`,
      `DTSTART:${meetingUtcRange.startUtc}`,
      `DTEND:${meetingUtcRange.endUtc}`,
      `SUMMARY:30m Intro Call: ${guestName || 'Client'} x Abdullah`,
      `DESCRIPTION:Host: Muhammad Abdullah Khan (byabdullahkhan@gmail.com)\\nGuest: ${guestName} (${guestEmail})\\nNotes: ${safeNotes}`,
      'ORGANIZER;CN=Abdullah:mailto:byabdullahkhan@gmail.com',
      guestEmail ? `ATTENDEE;CN=${guestName || 'Guest'};RSVP=TRUE:mailto:${guestEmail}` : '',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].filter(Boolean);

    const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'abdullah-intro-call.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const mailtoBookingHref = useMemo(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local Time';
    const subject = encodeURIComponent(
      `Intro Call Booking: ${guestName || 'Client'} on ${formattedSelectedDate} at ${activeSlotLabel}`
    );
    const body = encodeURIComponent(
      `Hi Abdullah,\n\nI have scheduled a 30-minute Intro Call with you:\n\n` +
        `• Name: ${guestName}\n` +
        `• Email: ${guestEmail}\n` +
        `• Date: ${formattedSelectedDate}\n` +
        `• Time: ${activeSlotLabel} (${timezone})\n` +
        `• Project Notes: ${guestNotes || 'Let’s discuss my upcoming project.'}\n\nBest regards,\n${guestName}`
    );
    return `mailto:byabdullahkhan@gmail.com?subject=${subject}&body=${body}`;
  }, [guestName, guestEmail, guestNotes, formattedSelectedDate, activeSlotLabel]);

  const handleCopyBookingDetails = () => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local Time';
    const summary =
      `30m Intro Call — Abdullah × ${guestName}\n` +
      `Host: Abdullah (byabdullahkhan@gmail.com)\n` +
      `Guest: ${guestName} (${guestEmail})\n` +
      `When: ${formattedSelectedDate} at ${activeSlotLabel} (${timezone})\n` +
      `Notes: ${guestNotes || 'Let’s discuss my upcoming project.'}`;
    navigator.clipboard?.writeText(summary).then(() => {
      setCopiedDetails(true);
      setTimeout(() => setCopiedDetails(false), 2500);
    }).catch(() => {});
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSlotIdx === null) return;
    setIsSubmitting(true);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local Time';
    const dateKey = toDateKey(selectedDate);
    const slot24 = TIME_SLOTS_24H[selectedSlotIdx];

    const record: BookingRecord = {
      id: `bk_${Date.now()}`,
      name: guestName.trim(),
      email: guestEmail.trim(),
      notes: guestNotes.trim() || 'Let’s discuss my upcoming project.',
      dateKey,
      dateLabel: formattedSelectedDate,
      slot24,
      slotLabel: activeSlotLabel,
      timezone,
      createdAt: new Date().toISOString(),
    };

    // 1. Save locally so slot is immediately reserved
    setBookedSlots((prev) => {
      const next = [...prev, record];
      try {
        localStorage.setItem('abdullah_booked_slots_v1', JSON.stringify(next));
      } catch {
        // ignore quota errors
      }
      return next;
    });

    // 2. Persist to server endpoint (/api/bookings)
    try {
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
    } catch {
      // ignore network errors on static hosts
    }

    // 3. Best-effort background notification via FormSubmit
    try {
      const formData = new FormData();
      formData.append('_subject', `New Call Booked: ${guestName} — ${formattedSelectedDate} at ${activeSlotLabel}`);
      formData.append('Name', guestName);
      formData.append('Email', guestEmail);
      formData.append('Date', formattedSelectedDate);
      formData.append('Time', `${activeSlotLabel} (${timezone})`);
      formData.append('Project_Notes', guestNotes || 'Let’s discuss my upcoming project.');
      formData.append('_template', 'table');
      formData.append('_captcha', 'false');

      await fetch('https://formsubmit.co/ajax/byabdullahkhan@gmail.com', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });
    } catch {
      // ignore background email error
    } finally {
      setIsSubmitting(false);
      setStep('confirmed');
    }
  };

  return (
    <>
      {/* Cal.com-style Interactive "Book a Call / Schedule a Call" Calendar Modal */}
      {isCalendarOpen && (
        <div
          data-lenis-prevent=""
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto"
          onClick={() => setIsCalendarOpen(false)}
        >
          <div
            data-lenis-prevent=""
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

            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[480px]">
              {/* Left Column: Host & Intro Call Details */}
              <div className="md:col-span-4 p-6 border-b md:border-b-0 md:border-r border-white/10 bg-[#161615] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={avatarSrc}
                      alt="Muhammad Abdullah Khan — Custom Web Developer & Technical SEO Specialist"
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
                  <div className="md:col-span-3 p-5 flex flex-col max-h-[480px]">
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
                        const isSlotDisabled = disabledSlotIndices.has(idx);
                        const isBooked = bookedSlots.some(
                          (b) =>
                            b.dateKey === toDateKey(selectedDate) &&
                            b.slot24 === TIME_SLOTS_24H[idx]
                        );
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={isSlotDisabled}
                            onClick={() => {
                              if (isSlotDisabled) return;
                              setSelectedSlotIdx(idx);
                              setStep('form');
                            }}
                            className={`booking-slot-btn w-full py-2.5 px-3 rounded-lg text-xs font-medium transition flex items-center justify-center gap-2 ${
                              isSlotDisabled
                                ? 'opacity-35 cursor-not-allowed line-through'
                                : active
                                ? 'is-active cursor-pointer'
                                : 'cursor-pointer'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSlotDisabled ? 'bg-white/30' : 'bg-[#39FF14]'
                              }`}
                            />
                            <span>{slot}</span>
                            {isBooked && (
                              <span className="text-[10px] text-white/50 no-underline ml-1">
                                (Booked)
                              </span>
                            )}
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
                        className="booking-secondary-btn px-4 py-2.5 rounded-lg text-xs font-medium cursor-pointer transition"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="booking-primary-btn px-5 py-2.5 rounded-lg disabled:opacity-60 text-xs cursor-pointer shadow-lg transition"
                      >
                        {isSubmitting ? 'Scheduling...' : 'Schedule Call'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 3: Booking Confirmed */}
              {step === 'confirmed' && (
                <div className="md:col-span-8 p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#39FF14]/15 border border-[#39FF14]/40 flex items-center justify-center text-[#39FF14]">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white">This meeting is scheduled</h3>
                  <p className="text-xs text-white/70 max-w-md">
                    Your 30-minute Intro Call with <strong className="text-white">Abdullah</strong> (
                    <span className="text-[#39FF14]">byabdullahkhan@gmail.com</span>) is reserved for{' '}
                    <strong className="text-white">
                      {formattedSelectedDate} at {activeSlotLabel}
                    </strong>
                    . Add it to your calendar or send a direct confirmation below.
                  </p>

                  <div className="w-full max-w-md rounded-xl bg-[#181817] border border-white/10 p-4 text-left text-xs space-y-2">
                    <div className="flex justify-between gap-2">
                      <span className="text-white/50">Host:</span>
                      <span className="font-medium text-white">Abdullah (byabdullahkhan@gmail.com)</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-white/50">Guest:</span>
                      <span className="font-medium text-white truncate">
                        {guestName} ({guestEmail})
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-white/50">When:</span>
                      <span className="font-medium text-[#39FF14]">
                        {formattedSelectedDate} • {activeSlotLabel} (30m)
                      </span>
                    </div>
                    {guestNotes && (
                      <div className="pt-1.5 border-t border-white/10">
                        <span className="text-white/50 block mb-0.5">Notes:</span>
                        <span className="text-white/80 line-clamp-2">{guestNotes}</span>
                      </div>
                    )}
                  </div>

                  {/* Primary Calendar & Notification Actions */}
                  <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <a
                      href={googleCalendarHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="booking-primary-btn px-4 py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 shadow-lg transition"
                    >
                      <CalendarIcon className="w-3.5 h-3.5" />
                      <span>Add to Google Calendar</span>
                      <ExternalLink className="w-3 h-3 opacity-75" />
                    </a>
                    <button
                      type="button"
                      onClick={handleDownloadIcs}
                      className="booking-secondary-btn px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition"
                    >
                      <Download className="w-3.5 h-3.5 text-[#39FF14]" />
                      <span>Download .ics Invite</span>
                    </button>
                    <a
                      href={mailtoBookingHref}
                      className="booking-secondary-btn px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#39FF14]" />
                      <span>Send Email Confirmation</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyBookingDetails}
                      className="booking-secondary-btn px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition"
                    >
                      {copiedDetails ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#39FF14]" />
                          <span className="text-[#39FF14]">Copied Details!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#39FF14]" />
                          <span>Copy Meeting Details</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCalendarOpen(false)}
                      className="px-6 py-2 rounded-lg text-xs font-medium text-white/60 hover:text-white cursor-pointer transition"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
