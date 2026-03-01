import type { SystemPrompt } from './use-prompts-manager';
import { cn } from '@giulio-leone/lib-design-system';
import { motion } from 'framer-motion';
import { Search, Sparkles, Power } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PromptListProps {
  prompts: SystemPrompt[];
  selectedPromptId: string | null;
  onSelectPrompt: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  className?: string;
}

export function PromptList({
  prompts,
  selectedPromptId,
  onSelectPrompt,
  searchQuery,
  onSearchChange,
  className,
}: PromptListProps) {
  const t = useTranslations('admin.aiSettings.prompts');

  return (
    <div
      className={cn(
        'flex h-full flex-col bg-white/50 backdrop-blur-xl dark:bg-[#09090b]/50',
        className
      )}
    >
      {/* Search Header */}
      <div className="border-b border-neutral-200/60 p-4 dark:border-white/[0.06]">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            className="bg-muted/50 focus:ring-ring w-full rounded-xl border-none py-2.5 pr-4 pl-10 text-sm ring-offset-transparent transition-all focus:ring-2 focus:outline-none"
          />
        </div>
      </div>

      {/* List */}
      <div className="scrollbar-thin flex-1 overflow-y-auto p-2">
        <div className="space-y-6">
          {prompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-muted mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                <Sparkles className="text-muted-foreground h-6 w-6" />
              </div>
              <p className="text-sm font-medium">{t('noResults')}</p>
              <p className="text-muted-foreground text-xs">{t('adjustSearch')}</p>
            </div>
          ) : (
            Object.entries(
              prompts.reduce((acc, prompt) => {
                  const category = prompt.category || 'Other';
                  if (!acc[category]) acc[category] = [];
                  acc[category].push(prompt);
                  return acc;
                },
                {} as Record<string, SystemPrompt[]>
              )
            ).map(([category, categoryPrompts]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-2 px-2">
                  <span className="text-xs font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                    {category}
                  </span>
                  <div className="h-px flex-1 bg-neutral-200 dark:bg-white/[0.04]" />
                </div>
                <div className="space-y-1">
                  {categoryPrompts.map((prompt) => (
                    <motion.button
                      key={prompt.agentId}
                      layoutId={prompt.agentId}
                      onClick={() => onSelectPrompt(prompt.agentId)}
                      className={cn(
                        'group relative flex w-full flex-col items-start gap-1 rounded-xl p-3 text-left transition-all hover:bg-neutral-100 dark:hover:bg-white/[0.06]/50',
                        selectedPromptId === prompt.agentId
                          ? 'bg-primary-50/80 ring-1 ring-primary-200 dark:bg-primary-900/20 dark:ring-primary-800'
                          : 'bg-transparent'
                      )}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span
                          className={cn(
                            'truncate text-sm font-semibold',
                            selectedPromptId === prompt.agentId
                              ? 'text-primary-700 dark:text-primary-300'
                              : 'text-neutral-900 dark:text-neutral-100'
                          )}
                        >
                          {prompt.name}
                        </span>
                        {prompt.isActive && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                            <Power className="h-3 w-3" />
                          </div>
                        )}
                      </div>

                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="text-muted-foreground truncate text-xs">
                          {prompt.agentId}
                        </span>
                      </div>

                      {selectedPromptId === prompt.agentId && (
                        <motion.div
                          layoutId="active-indicator"
                          className="absolute top-3 bottom-3 left-0 w-1 rounded-r-full bg-primary-500"
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
