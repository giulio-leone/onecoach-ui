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
} from '@onecoach/ui';

// Type exports
export type { PromptAttachment } from '@onecoach/ui';
export type { FileUIPart } from './ai-types';
