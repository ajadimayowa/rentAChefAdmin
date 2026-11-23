/**
 * Nigerian phone numbers are always stored as +234 followed by 10 digits
 * (e.g. +2348166064166). Forms collect only the local digits — with or without
 * the leading 0 — next to a fixed "+234" prefix.
 */

const LOCAL_NUMBER = /^[789]\d{9}$/;

/** Strips everything but digits, a leading 234 country code and a leading 0. */
function toLocalPart(value: string): string {
  let digits = (value ?? '').replace(/\D/g, '');
  if (digits.startsWith('234') && digits.length > 10) digits = digits.slice(3);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits;
}

/** Stored number → what the phone input shows (e.g. "+2348166064166" → "8166064166"). */
export function toPhoneInput(stored: string): string {
  return toLocalPart(stored);
}

/** Whether the typed digits form a valid Nigerian mobile number. */
export function isValidNigerianPhone(value: string): boolean {
  return LOCAL_NUMBER.test(toLocalPart(value));
}

/** Typed digits → stored format (e.g. "08166064166" → "+2348166064166"). */
export function toE164Nigerian(value: string): string {
  return `+234${toLocalPart(value)}`;
}
