/**
 * React resets a `<form action={…}>` once its action completes — including
 * when the action completed by *rejecting* the submission. Without help, a
 * server-side validation error therefore throws away everything the person
 * typed, which on a long application answer or a news post body is worse than
 * the original mistake.
 *
 * Actions echo the submission back through their state, and fields read from
 * it so the form comes back filled in.
 */
export type SubmittedValues = Record<string, string>;

/**
 * String entries of a submission. Uploaded files are skipped (a File cannot be
 * put back into an input), and repeated names — a group of checkboxes sharing
 * one name — are joined with newlines; read those with `wasChecked`.
 */
export function formValues(formData: FormData): SubmittedValues {
  const out: SubmittedValues = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string") continue;
    if (key.startsWith("$ACTION")) continue; // React's own action plumbing
    out[key] = key in out ? `${out[key]}\n${value}` : value;
  }
  return out;
}

/** Value for a field, falling back to whatever it held before the submission. */
export function submitted(
  values: SubmittedValues | undefined,
  name: string,
  fallback: string | number | null | undefined = "",
): string {
  const value = values?.[name];
  if (value !== undefined) return value;
  return fallback === null || fallback === undefined ? "" : String(fallback);
}

/** Whether a checkbox was ticked in the rejected submission. */
export function wasChecked(
  values: SubmittedValues | undefined,
  name: string,
  fallback = false,
): boolean {
  if (!values) return fallback;
  return name in values;
}

/** Whether one checkbox of a same-named group was ticked. */
export function wasCheckedIn(
  values: SubmittedValues | undefined,
  name: string,
  value: string,
  fallback = false,
): boolean {
  if (!values) return fallback;
  const raw = values[name];
  if (raw === undefined) return false;
  return raw.split("\n").includes(value);
}
