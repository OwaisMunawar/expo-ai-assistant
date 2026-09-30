/** Limits shared by the client (input caps) and the server (validation). */
export const LIMITS = {
  maxMessages: 50,
  maxCharsPerMessage: 8_000,
  maxOutputTokens: 2_048,
} as const;
