/**
 * AI Elements - onecoach
 *
 * Componenti chat ispirate ad AI Elements di Vercel ma con styling custom onecoach.
 * Integrazione nativa con AI SDK v6 useChat hook.
 *
 * PRINCIPI:
 * - KISS: Componenti semplici con API minimal
 * - SOLID: Single responsibility per ogni componente
 * - DRY: Logica condivisa in hook, styling in variants
 *
 * ARCHITETTURA:
 * - Conversation: Container per la lista messaggi
 * - Message: Singola bolla messaggio con supporto parts[]
 * - PromptInput: Input utente con toolbar azioni
 * - Tool: Visualizzazione tool invocations
 * - Reasoning: Collapsible per chain-of-thought
 * - Loader: Animazione durante streaming
 */
export * from './conversation';
export * from './message';
export * from './prompt-input';
export * from './tool';
export * from './reasoning';
export * from './loader';
//# sourceMappingURL=index.d.ts.map