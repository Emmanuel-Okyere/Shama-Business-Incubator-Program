/**
 * SMS text helpers with no server dependencies, so the admin composer can
 * count segments in the browser using exactly the same rules the sender uses.
 */

/** GSM-7 fits 160 characters per part; anything outside it drops to 70. */
export function smsSegments(body: string): { parts: number; encoding: "GSM-7" | "UCS-2" } {
  const gsm7 =
    /^[@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&'()*+,\-./0-9:;<=>?¡A-ZÄÖÑÜ§¿a-zäöñüà\f^{}\\[~\]|€]*$/;
  const encoding = gsm7.test(body) ? "GSM-7" : "UCS-2";
  const single = encoding === "GSM-7" ? 160 : 70;
  const multi = encoding === "GSM-7" ? 153 : 67;
  const len = body.length;
  return { parts: len <= single ? 1 : Math.ceil(len / multi), encoding };
}

/**
 * Normalise Ghanaian numbers to the local 10-digit form the gateway expects
 * (0XXXXXXXXX). Accepts +233…, 233…, 0… and spaced or dashed variants.
 */
export function normaliseGhanaPhone(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  if (digits.startsWith("233") && digits.length === 12) return `0${digits.slice(3)}`;
  if (digits.startsWith("0") && digits.length === 10) return digits;
  if (digits.length === 9) return `0${digits}`;
  return digits;
}

export function isValidGhanaPhone(raw: string): boolean {
  return /^0(2|5)\d{8}$/.test(normaliseGhanaPhone(raw));
}
