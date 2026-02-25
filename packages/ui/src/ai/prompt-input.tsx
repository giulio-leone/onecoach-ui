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
} from '../components/ai-elements';

// Type exports
export type { PromptAttachment } from '../components/ai-elements/prompt-input';
export type { FileUIPart } from './ai-types';
