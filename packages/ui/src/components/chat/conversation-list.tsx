'use client';

import React from 'react';
import { cn } from '@giulio-leone/lib-design-system';
import { Plus, MessageSquare, Search, Trash2, X, Check } from 'lucide-react';
import { Button } from '../../button';
import { Input } from '../../input';
import { motion, AnimatePresence } from 'framer-motion';

export interface ConversationListItem {
  id: string;
  title: string;
  preview: string;
  updatedAt: Date;
  domain?: string;
}

interface ConversationListProps {
  conversations: ConversationListItem[];
  activeId: string | null;
  onSelect: (id: string) => void | Promise<void>;
  onNewChat: () => void;
  onDelete?: (id: string) => void;
  onDeleteSelected?: (ids: string[]) => void;
  onDeleteAll?: () => void;
  isLoading?: boolean;
  isDeleting?: boolean;
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onDelete,
  onDeleteSelected,
  onDeleteAll,
  isDeleting = false,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectionMode, setSelectionMode] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [confirmDeleteAll, setConfirmDeleteAll] = React.useState(false);

  const filteredConversations = conversations.filter((conv: ConversationListItem) =>
    conv.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size > 0 && onDeleteSelected) {
      onDeleteSelected(Array.from(selectedIds));
      setSelectedIds(new Set());
      setSelectionMode(false);
    }
  };

  const handleDeleteAll = () => {
    if (confirmDeleteAll && onDeleteAll) {
      onDeleteAll();
      setConfirmDeleteAll(false);
      setSelectionMode(false);
      setSelectedIds(new Set());
    } else {
      setConfirmDeleteAll(true);
      // Reset confirmation after 3 seconds
      setTimeout(() => setConfirmDeleteAll(false), 3000);
    }
  };

  const cancelSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
    setConfirmDeleteAll(false);
  };

  return (
    <div className="flex h-full flex-col gap-3 p-3 sm:gap-4 sm:p-4">
      {/* Header Section */}
      <div className="flex flex-none flex-col gap-3">
        {selectionMode ? (
          <div className="flex gap-2">
            <Button onClick={cancelSelectionMode} variant="outline" size="sm" className="flex-1">
              <X size={16} className="mr-1" />
              Annulla
            </Button>
            <Button
              onClick={handleDeleteSelected}
              variant="danger"
              size="sm"
              className="flex-1"
              disabled={selectedIds.size === 0 || isDeleting}
            >
              <Trash2 size={16} className="mr-1" />
              Elimina ({selectedIds.size})
            </Button>
          </div>
        ) : (
          <Button
            onClick={onNewChat}
            className="w-full justify-start gap-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] hover:from-indigo-500 hover:to-indigo-400 active:scale-[0.98] dark:from-indigo-600 dark:to-indigo-500"
            size="lg"
          >
            <Plus size={20} />
            <span className="font-medium">Nuova Chat</span>
          </Button>
        )}

        <div className="group relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-indigo-500" />
          <Input
            placeholder="Cerca conversazioni..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-xl border-neutral-200 bg-neutral-50 pl-10 text-sm transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-indigo-500"
          />
        </div>

        {/* Action buttons when not in selection mode */}
        {!selectionMode &&
          conversations.length > 0 &&
          (onDelete || onDeleteSelected || onDeleteAll) && (
            <div className="flex gap-2">
              {onDeleteSelected && (
                <Button
                  onClick={() => setSelectionMode(true)}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                >
                  Seleziona
                </Button>
              )}
              {onDeleteAll && (
                <Button
                  onClick={handleDeleteAll}
                  variant={confirmDeleteAll ? 'danger' : 'outline'}
                  size="sm"
                  className="flex-1 text-xs"
                  disabled={isDeleting}
                >
                  {confirmDeleteAll ? (
                    <>
                      <Check size={14} className="mr-1" />
                      Conferma
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} className="mr-1" />
                      Elimina tutte
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
      </div>

      {/* List Section */}
      <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-200 dark:scrollbar-thumb-white/10 hover:scrollbar-thumb-neutral-300 dark:hover:scrollbar-thumb-white/20 -mr-1 min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="flex flex-col gap-1.5 pb-2 sm:gap-2">
          <AnimatePresence initial={false} mode="popLayout">
            {filteredConversations.map((conv, index) => (
              <motion.div
                key={conv.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => (selectionMode ? toggleSelection(conv.id) : onSelect(conv.id))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      selectionMode ? toggleSelection(conv.id) : onSelect(conv.id);
                    }
                  }}
                  className={cn(
                    'group relative flex w-full cursor-pointer flex-col items-start gap-1.5 rounded-xl p-4 text-left transition-all duration-200',
                    selectionMode && selectedIds.has(conv.id)
                      ? 'bg-red-50 ring-2 ring-red-500/50 dark:bg-red-900/20'
                      : activeId === conv.id
                        ? 'bg-white shadow-md ring-1 shadow-indigo-500/5 ring-indigo-500/10 dark:bg-white/10 dark:shadow-none dark:ring-white/10'
                        : 'hover:bg-neutral-100 dark:hover:bg-white/5'
                  )}
                >
                  {/* Selection checkbox indicator */}
                  {selectionMode && (
                    <div
                      className={cn(
                        'absolute top-4 left-4 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
                        selectedIds.has(conv.id)
                          ? 'border-red-500 bg-red-500'
                          : 'border-neutral-300 dark:border-neutral-600'
                      )}
                    >
                      {selectedIds.has(conv.id) && <Check size={12} className="text-white" />}
                    </div>
                  )}

                  {/* Active Indicator */}
                  {!selectionMode && activeId === conv.id && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute top-4 left-0 h-8 w-1 rounded-r-full bg-indigo-600 dark:bg-indigo-400"
                    />
                  )}

                  <div
                    className={cn(
                      'flex w-full items-center justify-between gap-2',
                      selectionMode && 'pl-8'
                    )}
                  >
                    <span
                      className={cn(
                        'truncate text-sm font-semibold',
                        selectionMode && selectedIds.has(conv.id)
                          ? 'text-red-700 dark:text-red-300'
                          : activeId === conv.id
                            ? 'text-indigo-900 dark:text-white'
                            : 'text-neutral-700 dark:text-neutral-200'
                      )}
                    >
                      {conv.title || 'Nuova conversazione'}
                    </span>
                    <div className="flex items-center gap-2">
                      {!selectionMode && onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          iconOnly
                          onClick={(e: React.MouseEvent<HTMLElement>) => {
                            e.stopPropagation();
                            onDelete(conv.id);
                          }}
                          className="h-7 w-7 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30"
                          disabled={isDeleting}
                        >
                          <Trash2 size={14} className="text-red-500" />
                        </Button>
                      )}
                      <span
                        className={cn(
                          'shrink-0 text-[10px] font-medium',
                          activeId === conv.id
                            ? 'text-indigo-500 dark:text-indigo-300'
                            : 'text-neutral-400'
                        )}
                      >
                        {new Date(conv.updatedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <p
                    className={cn(
                      'line-clamp-2 text-xs leading-relaxed',
                      selectionMode && 'pl-8',
                      selectionMode && selectedIds.has(conv.id)
                        ? 'text-red-600 dark:text-red-400'
                        : activeId === conv.id
                          ? 'text-neutral-600 dark:text-neutral-300'
                          : 'text-neutral-500 dark:text-neutral-400'
                    )}
                  >
                    {conv.preview}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredConversations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-white/5">
                <MessageSquare className="h-8 w-8 text-neutral-400" />
              </div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                Nessuna chat trovata
              </p>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Inizia una nuova conversazione per cominciare
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
