'use client';

// Thin passthrough to UI package to avoid local wrapper
export {
  PromptInput,
  PromptInputRoot,
  PromptInputProvider,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputAttachButton,
  PromptInputVoiceButton,
  PromptInputAIMode,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  PromptInputAttachments,
  PromptInputAttachment,
  PromptInputSpeechButton,
  usePromptInput,
} from '@giulio-leone/ui';

// Type exports
export type { PromptAttachment } from '@giulio-leone/ui';
export type { FileUIPart } from './ai-types';
