/**
 * SMPTE 12M Timecode & Video Frame Rate Utilities
 * Supports standard non-drop frame and drop-frame (29.97 DF, 59.94 DF) calculations,
 * film feet/frames, audio sample synchronization, and timecode arithmetic.
 */

export interface FrameRateOption {
  id: string;
  label: string;
  fps: number;
  isDropFrame: boolean;
  nominalFps: number;
  description: string;
}

export const FRAME_RATES: FrameRateOption[] = [
  {
    id: "23.976",
    label: "23.976 fps",
    fps: 24000 / 1001,
    isDropFrame: false,
    nominalFps: 24,
    description: "Standard cinema & streaming production (NTSC Film)",
  },
  {
    id: "24",
    label: "24.0 fps",
    fps: 24,
    isDropFrame: false,
    nominalFps: 24,
    description: "True Cinema & DCP theatrical standard",
  },
  {
    id: "25",
    label: "25.0 fps",
    fps: 25,
    isDropFrame: false,
    nominalFps: 25,
    description: "PAL / European broadcast and cinema standard",
  },
  {
    id: "29.97-ndf",
    label: "29.97 fps NDF",
    fps: 30000 / 1001,
    isDropFrame: false,
    nominalFps: 30,
    description: "NTSC Non-Drop Frame (drifts 3.6 sec/hr vs clock)",
  },
  {
    id: "29.97-df",
    label: "29.97 fps DF",
    fps: 30000 / 1001,
    isDropFrame: true,
    nominalFps: 30,
    description: "NTSC Drop-Frame (syncs exactly with wall clock)",
  },
  {
    id: "30",
    label: "30.0 fps",
    fps: 30,
    isDropFrame: false,
    nominalFps: 30,
    description: "Web video, mobile capture, and animation",
  },
  {
    id: "48",
    label: "48.0 fps",
    fps: 48,
    isDropFrame: false,
    nominalFps: 48,
    description: "HFR Cinema standard (The Hobbit, Avatar)",
  },
  {
    id: "50",
    label: "50.0 fps",
    fps: 50,
    isDropFrame: false,
    nominalFps: 50,
    description: "PAL High Frame Rate broadcast & sports",
  },
  {
    id: "59.94-ndf",
    label: "59.94 fps NDF",
    fps: 60000 / 1001,
    isDropFrame: false,
    nominalFps: 60,
    description: "NTSC High Frame Rate Non-Drop Frame",
  },
  {
    id: "59.94-df",
    label: "59.94 fps DF",
    fps: 60000 / 1001,
    isDropFrame: true,
    nominalFps: 60,
    description: "NTSC High Frame Rate Drop-Frame broadcast",
  },
  {
    id: "60",
    label: "60.0 fps",
    fps: 60,
    isDropFrame: false,
    nominalFps: 60,
    description: "Smooth 60fps web video & gaming capture",
  },
  {
    id: "120",
    label: "120.0 fps",
    fps: 120,
    isDropFrame: false,
    nominalFps: 120,
    description: "Slow-motion capture & high refresh displays",
  },
];

export interface TimecodeParts {
  hours: number;
  minutes: number;
  seconds: number;
  frames: number;
  isDropFrame: boolean;
}

/**
 * Format hours, minutes, seconds, frames into standard SMPTE string (HH:MM:SS:FF or HH:MM:SS;FF)
 */
export function formatTimecodeString(
  h: number,
  m: number,
  s: number,
  f: number,
  isDropFrame = false
): string {
  const pad = (n: number) => Math.max(0, Math.floor(n)).toString().padStart(2, "0");
  const sep = isDropFrame ? ";" : ":";
  return `${pad(h)}:${pad(m)}:${pad(s)}${sep}${pad(f)}`;
}

/**
 * Parses timecode string into parts (supports :, ;, ,, . delimiters)
 */
export function parseTimecodeString(tcStr: string): TimecodeParts | null {
  if (!tcStr) return null;
  const clean = tcStr.trim();
  const isDropFrame = clean.includes(";") || clean.includes(",");

  // Split by any standard separator
  const parts = clean.split(/[:;,.]/);
  if (parts.length < 1 || parts.length > 4) return null;

  const numbers = parts.map((p) => parseInt(p.trim(), 10));
  if (numbers.some((n) => isNaN(n) || n < 0)) return null;

  let h = 0,
    m = 0,
    s = 0,
    f = 0;

  if (numbers.length === 4) {
    [h, m, s, f] = numbers;
  } else if (numbers.length === 3) {
    [m, s, f] = numbers;
  } else if (numbers.length === 2) {
    [s, f] = numbers;
  } else if (numbers.length === 1) {
    f = numbers[0];
  }

  return { hours: h, minutes: m, seconds: s, frames: f, isDropFrame };
}

/**
 * Converts total frame count to SMPTE Timecode
 */
export function framesToTimecode(
  totalFrames: number,
  rateOption: FrameRateOption
): string {
  let f = Math.max(0, Math.round(totalFrames));
  const { nominalFps, isDropFrame } = rateOption;

  if (!isDropFrame) {
    const framesPerSec = nominalFps;
    const framesPerMin = framesPerSec * 60;
    const framesPerHour = framesPerMin * 60;

    const hours = Math.floor(f / framesPerHour);
    f %= framesPerHour;

    const minutes = Math.floor(f / framesPerMin);
    f %= framesPerMin;

    const seconds = Math.floor(f / framesPerSec);
    const frames = f % framesPerSec;

    return formatTimecodeString(hours, minutes, seconds, frames, false);
  }

  // SMPTE Drop Frame Calculation
  if (nominalFps === 30) {
    // 29.97 DF: drop 2 frames every minute, except every 10th minute
    const dropFrames = 2;
    const framesPer10Min = 17982; // (30 * 60 * 10) - (2 * 9)
    const framesPerMin = 1798; // (30 * 60) - 2

    const d = Math.floor(f / framesPer10Min);
    const m = f % framesPer10Min;

    if (m > 1) {
      f += 18 * d + 2 * Math.floor((m - 2) / framesPerMin);
    } else {
      f += 18 * d;
    }

    const frames = f % 30;
    const seconds = Math.floor(f / 30) % 60;
    const minutes = Math.floor(f / (30 * 60)) % 60;
    const hours = Math.floor(f / (30 * 3600));

    return formatTimecodeString(hours, minutes, seconds, frames, true);
  } else if (nominalFps === 60) {
    // 59.94 DF: drop 4 frames every minute, except every 10th minute
    const dropFrames = 4;
    const framesPer10Min = 35964; // (60 * 60 * 10) - (4 * 9)
    const framesPerMin = 3596; // (60 * 60) - 4

    const d = Math.floor(f / framesPer10Min);
    const m = f % framesPer10Min;

    if (m > 3) {
      f += 36 * d + 4 * Math.floor((m - 4) / framesPerMin);
    } else {
      f += 36 * d;
    }

    const frames = f % 60;
    const seconds = Math.floor(f / 60) % 60;
    const minutes = Math.floor(f / (60 * 60)) % 60;
    const hours = Math.floor(f / (60 * 3600));

    return formatTimecodeString(hours, minutes, seconds, frames, true);
  }

  // Fallback if drop-frame specified for non-supported nominal rate
  const frames = f % nominalFps;
  const seconds = Math.floor(f / nominalFps) % 60;
  const minutes = Math.floor(f / (nominalFps * 60)) % 60;
  const hours = Math.floor(f / (nominalFps * 3600));
  return formatTimecodeString(hours, minutes, seconds, frames, false);
}

/**
 * Converts SMPTE Timecode string or parts into total frame count
 */
export function timecodeToFrames(
  timecode: string | TimecodeParts,
  rateOption: FrameRateOption
): number {
  const parts =
    typeof timecode === "string" ? parseTimecodeString(timecode) : timecode;
  if (!parts) return 0;

  const { hours, minutes, seconds, frames } = parts;
  const { nominalFps, isDropFrame } = rateOption;

  if (!isDropFrame) {
    return (
      hours * 3600 * nominalFps +
      minutes * 60 * nominalFps +
      seconds * nominalFps +
      frames
    );
  }

  // Drop-frame calculation
  if (nominalFps === 30) {
    const totalMinutes = 60 * hours + minutes;
    const dropFramesDropped = 2 * (totalMinutes - Math.floor(totalMinutes / 10));
    return (
      108000 * hours +
      1800 * minutes +
      30 * seconds +
      frames -
      dropFramesDropped
    );
  } else if (nominalFps === 60) {
    const totalMinutes = 60 * hours + minutes;
    const dropFramesDropped = 4 * (totalMinutes - Math.floor(totalMinutes / 10));
    return (
      216000 * hours +
      3600 * minutes +
      60 * seconds +
      frames -
      dropFramesDropped
    );
  }

  return (
    hours * 3600 * nominalFps +
    minutes * 60 * nominalFps +
    seconds * nominalFps +
    frames
  );
}

/**
 * Converts a timecode or frame count from one frame rate to another
 */
export function convertTimecodeFrameRate(
  sourceTimecode: string,
  sourceRate: FrameRateOption,
  targetRate: FrameRateOption
): {
  targetTimecode: string;
  sourceFrames: number;
  targetFrames: number;
  realSeconds: number;
  driftMsPerHour: number;
} {
  const sourceFrames = timecodeToFrames(sourceTimecode, sourceRate);
  // Real elapsed seconds = sourceFrames / exact source FPS
  const realSeconds = sourceFrames / sourceRate.fps;
  // Target frames = realSeconds * exact target FPS
  const targetFrames = Math.round(realSeconds * targetRate.fps);
  const targetTimecode = framesToTimecode(targetFrames, targetRate);

  // Compute drift in ms over 1 hour between these rates
  const framesInHourSource = 3600 * sourceRate.fps;
  const framesInHourTarget = 3600 * targetRate.fps;
  const driftMsPerHour = Math.abs(
    (framesInHourSource / sourceRate.fps - framesInHourTarget / targetRate.fps) *
      1000
  );

  return {
    targetTimecode,
    sourceFrames,
    targetFrames,
    realSeconds,
    driftMsPerHour,
  };
}

/**
 * Calculates Duration between In-Point and Out-Point
 */
export function calculateDuration(
  inTimecode: string,
  outTimecode: string,
  rateOption: FrameRateOption,
  inclusive = true
): {
  durationTimecode: string;
  durationFrames: number;
  inFrames: number;
  outFrames: number;
  realSeconds: number;
} {
  const inFrames = timecodeToFrames(inTimecode, rateOption);
  const outFrames = timecodeToFrames(outTimecode, rateOption);

  let durationFrames = outFrames - inFrames + (inclusive ? 1 : 0);
  if (durationFrames < 0) durationFrames = 0;

  const durationTimecode = framesToTimecode(durationFrames, rateOption);
  const realSeconds = durationFrames / rateOption.fps;

  return {
    durationTimecode,
    durationFrames,
    inFrames,
    outFrames,
    realSeconds,
  };
}

/**
 * Calculates film footage and audio sample stats for a given frame count
 */
export function getFilmAndAudioStats(
  totalFrames: number,
  rateOption: FrameRateOption
): {
  film35mm: string; // 16 frames per foot
  film16mm: string; // 40 frames per foot
  audioSamples48k: number;
  audioSamples96k: number;
  realTimeFormatted: string;
} {
  const f = Math.max(0, totalFrames);
  const feet35 = Math.floor(f / 16);
  const rem35 = f % 16;

  const feet16 = Math.floor(f / 40);
  const rem16 = f % 40;

  const realSeconds = f / rateOption.fps;
  const audioSamples48k = Math.round(realSeconds * 48000);
  const audioSamples96k = Math.round(realSeconds * 96000);

  const hours = Math.floor(realSeconds / 3600);
  const minutes = Math.floor((realSeconds % 3600) / 60);
  const secs = Math.floor(realSeconds % 60);
  const ms = Math.floor((realSeconds % 1) * 1000);

  const realTimeFormatted = `${hours > 0 ? `${hours}h ` : ""}${minutes}m ${secs}s ${ms}ms`;

  return {
    film35mm: `${feet35} ft + ${rem35} frames`,
    film16mm: `${feet16} ft + ${rem16} frames`,
    audioSamples48k,
    audioSamples96k,
    realTimeFormatted,
  };
}
