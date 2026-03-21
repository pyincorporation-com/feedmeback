import FingerprintJS from "@fingerprintjs/fingerprintjs";

// Additional fingerprinting components
const getBrowserFingerprint = () => {
  const navigator = window.navigator;
  const screen = window.screen;

  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: (navigator as any).deviceMemory,
    maxTouchPoints: navigator.maxTouchPoints,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    screenResolution: `${screen.width}x${screen.height}`,
    screenColorDepth: screen.colorDepth,
    screenPixelDepth: screen.pixelDepth,
    availableScreenResolution: `${screen.availWidth}x${screen.availHeight}`,
    touchSupport: "ontouchstart" in window,
    webGLVendor: getWebGLVendor(),
    canvasFingerprint: getCanvasFingerprint(),
    audioFingerprint: getAudioFingerprint(),
    fonts: getInstalledFonts(),
    localStorage: !!window.localStorage,
    sessionStorage: !!window.sessionStorage,
    indexedDB: !!window.indexedDB,
    openDatabase: !!(window as any).openDatabase,
    cpuClass: (navigator as any).cpuClass,
    plugins: getPluginsFingerprint(),
  };
};

const getWebGLVendor = () => {
  const canvas = document.createElement("canvas");

  const gl =
    (canvas.getContext("webgl") as WebGLRenderingContext | null) ||
    (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

  if (!gl) return "WebGL not supported";

  const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");

  if (debugInfo) {
    const vendor = gl.getParameter((debugInfo as any).UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter(
      (debugInfo as any).UNMASKED_RENDERER_WEBGL,
    );

    return `${vendor}||${renderer}`;
  }

  return "WebGL info not available";
};

const getCanvasFingerprint = () => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return "Canvas not supported";

  canvas.width = 200;
  canvas.height = 50;

  // Draw text
  ctx.textBaseline = "top";
  ctx.font = "14px Arial";
  ctx.fillStyle = "#f60";
  ctx.fillRect(0, 0, 100, 50);
  ctx.fillStyle = "#069";
  ctx.fillText("Fingerprint", 2, 15);

  // Draw shapes
  ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
  ctx.fillRect(120, 10, 70, 30);
  ctx.strokeStyle = "#123456";
  ctx.strokeRect(125, 15, 60, 20);

  // Draw circle
  ctx.beginPath();
  ctx.arc(50, 35, 15, 0, Math.PI * 2);
  ctx.fillStyle = "#ff0000";
  ctx.fill();

  return canvas.toDataURL();
};

const getAudioFingerprint = async () => {
  try {
    const audioContext = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const oscillator = audioContext.createOscillator();
    const analyser = audioContext.createAnalyser();
    const gain = audioContext.createGain();
    const destination = audioContext.destination;

    oscillator.connect(analyser);
    analyser.connect(gain);
    gain.connect(destination);

    oscillator.type = "sine";
    oscillator.frequency.value = 440;
    oscillator.start();

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    oscillator.stop();
    audioContext.close();

    return Array.from(dataArray).slice(0, 50).join(",");
  } catch (e) {
    return "Audio not supported";
  }
};

const getInstalledFonts = () => {
  const fonts = [
    "Arial",
    "Verdana",
    "Times New Roman",
    "Courier New",
    "Georgia",
    "Comic Sans MS",
    "Impact",
    "Tahoma",
    "Trebuchet MS",
    "Lucida Sans Unicode",
    "Monaco",
    "Consolas",
    "Courier",
    "Helvetica",
    "sans-serif",
  ];

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  const baseFonts = ["monospace", "sans-serif", "serif"];
  const installedFonts = [];

  for (const font of fonts) {
    let isInstalled = false;
    for (const baseFont of baseFonts) {
      ctx.font = `72px ${font}, ${baseFont}`;
      const text = "mmmmmmmmmmlli";
      const metrics1 = ctx.measureText(text);

      ctx.font = `72px ${baseFont}`;
      const metrics2 = ctx.measureText(text);

      if (metrics1.width !== metrics2.width) {
        isInstalled = true;
        break;
      }
    }
    if (isInstalled) {
      installedFonts.push(font);
    }
  }

  return installedFonts.slice(0, 20);
};

const getPluginsFingerprint = () => {
  const plugins = [];
  for (let i = 0; i < navigator.plugins.length; i++) {
    plugins.push({
      name: navigator.plugins[i].name,
      filename: navigator.plugins[i].filename,
      description: navigator.plugins[i].description,
    });
  }
  return plugins;
};

// Generate unique device ID
export const generateDeviceFingerprint = async (): Promise<string> => {
  try {
    // Initialize FingerprintJS
    const fp = await FingerprintJS.load();

    // Get fingerprint from FingerprintJS
    const result = await fp.get();
    const fpResult = result.visitorId;

    // Get additional browser fingerprints
    const browserData = getBrowserFingerprint();

    // Get hardware fingerprints
    const hardwareData = {
      webGL: getWebGLVendor(),
      canvas: getCanvasFingerprint(),
      fonts: getInstalledFonts(),
    };

    // Get audio fingerprint
    const audioFingerprint = await getAudioFingerprint();

    // Combine all fingerprints
    const combinedData = {
      fpResult,
      browserData,
      hardwareData,
      audioFingerprint,
      timestamp: Date.now(),
      performanceTiming: {
        timeOrigin: performance.timeOrigin,
        navigation: performance.getEntriesByType("navigation")[0],
      },
    };

    // Convert to string for hashing
    const combinedString = JSON.stringify(combinedData);

    // Create a simple hash
    const hash = await sha256(combinedString);

    return hash;
  } catch (error) {
    console.error("Failed to generate fingerprint:", error);
    // Fallback to basic fingerprint
    return fallbackFingerprint();
  }
};

const fallbackFingerprint = () => {
  const data = [
    navigator.userAgent,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.language,
    !!window.localStorage,
    !!window.sessionStorage,
  ].join("||");

  return btoa(data).substring(0, 64);
};

const sha256 = async (message: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(message);
  //   console.log("await crypto.subtle", await crypto.subtle);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  //   const shashBuffer = await crypto.subtle.digest("");
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
};

// Store device fingerprint in session storage (temporary, not for blocking)
export const getDeviceFingerprint = async (): Promise<string> => {
  if (typeof window === "undefined") return "";

  // Check if we already have a fingerprint in session storage
  let fingerprint = sessionStorage.getItem("device_fingerprint");
  if (fingerprint) {
    return fingerprint;
  }

  // Generate new fingerprint
  fingerprint = await generateDeviceFingerprint();
  sessionStorage.setItem("device_fingerprint", fingerprint);

  return fingerprint;
};
