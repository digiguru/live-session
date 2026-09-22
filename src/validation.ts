export function cleanSessionName(input: unknown, maxLength = 72): string {
  if (typeof input !== "string") return "";
  return input.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function validSessionId(sessionId: unknown): sessionId is string {
  return typeof sessionId === "string" && /^[a-z0-9-]{3,64}$/i.test(sessionId);
}

export function validCredential(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9_-]{16,160}$/i.test(value);
}
