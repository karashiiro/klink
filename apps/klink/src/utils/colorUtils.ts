/**
 * Calculate relative luminance for WCAG contrast ratio
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
function getLuminance(hex: string): number {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const rLinear = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gLinear = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bLinear = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate WCAG contrast ratio between two colors
 * https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */
function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Convert hex color to HSL
 */
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // Remove # if present
  const cleanHex = hex.replace("#", "");

  // Parse RGB values
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100,
  };
}

/**
 * Convert HSL to hex color
 */
function hslToHex(h: number, s: number, l: number): string {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Get high-contrast text color that matches the hue of the background
 * Uses WCAG contrast ratio calculation to ensure proper contrast
 * Iteratively finds a lightness value that meets 4.5:1 contrast ratio
 */
export function getContrastTextColor(bgColor: string): string {
  const hsl = hexToHSL(bgColor);
  const bgLuminance = getLuminance(bgColor);
  const targetRatio = 4.5; // WCAG AA standard

  // Determine if we should go darker or lighter
  const goDark = bgLuminance > 0.5;

  // Binary search for the right lightness value
  let minL = goDark ? 0 : hsl.l;
  let maxL = goDark ? hsl.l : 100;
  let bestL = goDark ? 0 : 100;
  let bestRatio = 1;

  // Iterate to find best lightness
  for (let i = 0; i < 20; i++) {
    const midL = (minL + maxL) / 2;
    const testColor = hslToHex(hsl.h, hsl.s, midL);
    const ratio = getContrastRatio(bgColor, testColor);

    if (ratio >= targetRatio) {
      bestL = midL;
      bestRatio = ratio;
      // Try to get closer to background (less extreme)
      if (goDark) {
        minL = midL;
      } else {
        maxL = midL;
      }
    } else {
      // Need more contrast
      if (goDark) {
        maxL = midL;
      } else {
        minL = midL;
      }
    }
  }

  // If we couldn't achieve target ratio with same saturation,
  // fall back to black or white
  if (bestRatio < targetRatio) {
    return goDark ? "#000000" : "#ffffff";
  }

  return hslToHex(hsl.h, hsl.s, bestL);
}

/**
 * Get a muted version of the contrast text color for secondary text
 * Uses 3:1 contrast ratio (WCAG AA for large text)
 */
export function getMutedTextColor(bgColor: string): string {
  const hsl = hexToHSL(bgColor);
  const bgLuminance = getLuminance(bgColor);
  const targetRatio = 3.0; // Lower contrast for muted text

  // Determine if we should go darker or lighter
  const goDark = bgLuminance > 0.5;

  // Binary search for the right lightness value
  let minL = goDark ? 0 : hsl.l;
  let maxL = goDark ? hsl.l : 100;
  let bestL = goDark ? 0 : 100;
  let bestRatio = 1;

  // Iterate to find best lightness
  for (let i = 0; i < 20; i++) {
    const midL = (minL + maxL) / 2;
    const testColor = hslToHex(hsl.h, hsl.s, midL);
    const ratio = getContrastRatio(bgColor, testColor);

    if (ratio >= targetRatio) {
      bestL = midL;
      bestRatio = ratio;
      // Try to get closer to background (less extreme)
      if (goDark) {
        minL = midL;
      } else {
        maxL = midL;
      }
    } else {
      // Need more contrast
      if (goDark) {
        maxL = midL;
      } else {
        minL = midL;
      }
    }
  }

  // If we couldn't achieve target ratio, fall back to main text color
  if (bestRatio < targetRatio) {
    return getContrastTextColor(bgColor);
  }

  return hslToHex(hsl.h, hsl.s, bestL);
}
