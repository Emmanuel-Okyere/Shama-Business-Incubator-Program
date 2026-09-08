/**
 * GiantSMS integration — https://documenter.getpostman.com/view/16317044/TzeZF6uf
 *
 * The API always answers HTTP 200; success is carried by the boolean `status`
 * field in the JSON body, so every response is inspected rather than trusted
 * on status code alone.
 *
 * Auth is HTTP Basic. Either supply the ready-made token:
 *   GIANTSMS_API_TOKEN=clJacXhCV0c6VWhFRHZDUllzYQ==
 * or the raw credentials, which are encoded for you:
 *   GIANTSMS_USERNAME=... / GIANTSMS_PASSWORD=...
 */

import { normaliseGhanaPhone } from "@/lib/sms-format";

export { isValidGhanaPhone, normaliseGhanaPhone, smsSegments } from "@/lib/sms-format";

const BASE_URL = process.env.GIANTSMS_BASE_URL ?? "https://api.giantsms.com/api";

/** Sender IDs are capped at 11 characters by the networks. */
export const SENDER_ID = (process.env.GIANTSMS_SENDER_ID ?? "ShamaInc").slice(0, 11);

export interface GiantSmsData {
  message_id: string;
  schedule_date: string | null;
  rate: number;
  status: string;
  reason: string;
  last_updated_date: string;
}

export interface GiantSmsResponse<T = GiantSmsData> {
  status: boolean;
  message: string | number;
  data?: T;
}

export class SmsNotConfiguredError extends Error {
  constructor() {
    super(
      "GiantSMS is not configured. Set GIANTSMS_API_TOKEN (or GIANTSMS_USERNAME and GIANTSMS_PASSWORD).",
    );
    this.name = "SmsNotConfiguredError";
  }
}

export function smsConfigured(): boolean {
  return Boolean(
    process.env.GIANTSMS_API_TOKEN ||
      (process.env.GIANTSMS_USERNAME && process.env.GIANTSMS_PASSWORD),
  );
}

function authHeader(): string {
  const token = process.env.GIANTSMS_API_TOKEN;
  if (token) return `Basic ${token.replace(/^Basic\s+/i, "")}`;

  const username = process.env.GIANTSMS_USERNAME;
  const password = process.env.GIANTSMS_PASSWORD;
  if (username && password) {
    return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
  }
  throw new SmsNotConfiguredError();
}

async function call<T>(
  path: string,
  init: { method: "GET" | "POST"; body?: unknown },
): Promise<GiantSmsResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: init.method,
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });

  const text = await res.text();
  let json: GiantSmsResponse<T>;
  try {
    json = JSON.parse(text) as GiantSmsResponse<T>;
  } catch {
    throw new Error(
      `GiantSMS returned a non-JSON response (HTTP ${res.status}): ${text.slice(0, 200)}`,
    );
  }
  return json;
}

/** Send one message. POST /v1/send with a JSON body. */
export function sendMessage(params: { to: string; msg: string; from?: string }) {
  return call<GiantSmsData>("/v1/send", {
    method: "POST",
    body: {
      from: params.from ?? SENDER_ID,
      to: normaliseGhanaPhone(params.to),
      msg: params.msg,
    },
  });
}

/** Send the same message to many recipients. POST /v1/send with `recipients`. */
export function sendBulk(params: { recipients: string[]; msg: string; from?: string }) {
  return call<never>("/v1/send", {
    method: "POST",
    body: {
      from: params.from ?? SENDER_ID,
      recipients: params.recipients.map(normaliseGhanaPhone),
      msg: params.msg,
    },
  });
}

/** Delivery status of a previously sent message. POST /v1/status. */
export function checkStatus(messageId: string) {
  return call<GiantSmsData>("/v1/status", {
    method: "POST",
    body: { message_id: messageId },
  });
}

/** Remaining SMS credits. GET /v1/balance — `message` carries the number. */
export function getBalance() {
  return call<never>("/v1/balance", { method: "GET" });
}

/** Approved sender IDs on the account. GET /v1/sender. */
export function getSenderIds() {
  return call<
    Array<{ name: string; purpose: string; approved: boolean; approval_status: string }>
  >("/v1/sender", { method: "GET" });
}

/** Phone verification: gateway generates and delivers the code. POST /v1/otp/send. */
export function sendOtp(mobile: string, sender = SENDER_ID) {
  return call<GiantSmsData>("/v1/otp/send", {
    method: "POST",
    body: { sender, mobile: normaliseGhanaPhone(mobile) },
  });
}

/** POST /v1/otp/verify. */
export function verifyOtp(mobile: string, code: string) {
  return call<never>("/v1/otp/verify", {
    method: "POST",
    body: { mobile: normaliseGhanaPhone(mobile), code },
  });
}
