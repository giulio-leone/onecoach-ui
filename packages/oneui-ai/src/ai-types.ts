/**
 * Tipi UI decoupled dall'SDK AI per stabilità a lungo termine.
 * Manteniamo shape minima usata dai componenti locali.
 */

export type ToolUIPartState =
  | 'input-streaming'
  | 'input-available'
  | 'approval-requested'
  | 'approval-responded'
  | 'output-available'
  | 'output-error'
  | 'output-denied';

export type ToolUIPart = {
  id?: string;
  type: string;
  state: ToolUIPartState;
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

export type FileUIPart = {
  id?: string;
  filename?: string;
  url: string;
  mediaType?: string;
  size?: number;
  alt?: string;
  width?: number;
  height?: number;
};

export type GeneratedImage = {
  base64: string;
  mediaType: string;
  uint8Array?: Uint8Array;
};

export type LanguageModelUsage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  reasoningTokens?: number;
  cachedInputTokens?: number;
};
