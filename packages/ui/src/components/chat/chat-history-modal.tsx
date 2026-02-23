'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Trash2, MessageSquare, Calendar, X, Pencil, Check } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';
import { Modal } from '../../dialog';
import { Input } from '../../input';
import { Button } from '../../button';
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import { it } from 'date-fns/locale';

export interface ChatHistoryItem {
  id: string;
  title: string;
  preview: string;
  updatedAt: Date;
  domain?: string;
}

interface ChatHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: ChatHistoryItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename?: (id: string, title: string) => Promise<void> | void;
  onNewChat?: () => void;
  onDeleteSelected?: (ids: string[]) => Promise<void> | void;
  isLoading?: boolean;
}

export function ChatHistoryModal({
  isOpen,
  onClose,
  conversations,
  activeId,
  onSelect,
  onDelete,
  onRename,
  onNewChat,
  onDeleteSelected,
  isLoading,
}: ChatHistoryModalProps) {
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setSelectionMode(false);
  };

  const enableSelectionMode = () => setSelectionMode(true);

  // Filter and Group Conversations
  const groupedConversations = useMemo(() => {
    const filtered = conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.preview.toLowerCase().includes(search.toLowerCase())
    );

    const groups: Record<string, ChatHistoryItem[]> = {
      Oggi: [],
      Ieri: [],
      'Questa Settimana': [],
      'Questo Mese': [],
      'Più vecchi': [],
    };

    filtered.forEach((c) => {
      const date = new Date(c.updatedAt);
      if (isToday(date)) groups['Oggi']!.push(c);
      else if (isYesterday(date)) groups['Ieri']!.push(c);
      else if (isThisWeek(date)) groups['Questa Settimana']!.push(c);
      else if (isThisMonth(date)) groups['Questo Mese']!.push(c);
      else groups['Più vecchi']!.push(c);
    });

    // Remove empty groups
    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [conversations, search]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const startRename = (e: React.MouseEvent, convId: string, currentTitle: string) => {
    e.stopPropagation();
    setRenameId(convId);
    setRenameValue(currentTitle || '');
    setDeleteId(null);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRenameId(null);
    setRenameValue('');
  };

  const confirmRename = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    if (!onRename) {
      setRenameId(null);
      return;
    }
    const trimmed = renameValue.trim();
    if (!trimmed) return;
    try {
      setIsSaving(true);
      await onRename(convId, trimmed);
      setRenameId(null);
      setRenameValue('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cronologia Chat"
      size="lg" // Wide modal
      mobileFullScreen={true}
      className="flex h-[80vh] w-[calc(100vw-20px)] max-w-[560px] flex-col overflow-hidden bg-white/90 p-0 backdrop-blur-xl sm:h-[620px] sm:max-w-[680px] dark:bg-neutral-900/90"
    >
      <div className="flex h-full flex-col">
        {/* Search Header */}
        <div className="sticky top-0 z-10 border-b border-neutral-100 bg-gradient-to-b from-white/90 to-white/40 px-3 py-3 backdrop-blur-xl sm:px-4 sm:py-4 dark:border-white/10 dark:from-neutral-900/90 dark:to-neutral-900/40">
          <div className="flex flex-col gap-3 sm:gap-2">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                placeholder="Cerca nelle conversazioni..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                className="border-neutral-200 bg-white pl-10 focus:ring-indigo-500 dark:border-white/10 dark:bg-neutral-900"
                autoFocus
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span className="rounded-full bg-neutral-100 px-2 py-1 text-neutral-700 dark:bg-white/10 dark:text-neutral-200">
                  {conversations.length} chat
                </span>
                {selectedIds.length > 0 && (
                  <span className="rounded-full bg-indigo-100 px-2 py-1 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-100">
                    {selectedIds.length} selezionate
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {onDeleteSelected && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={selectedIds.length === 0 && selectionMode}
                    onClick={() => {
                      if (!selectionMode) {
                        enableSelectionMode();
                      } else if (selectedIds.length > 0) {
                        onDeleteSelected?.(selectedIds);
                        clearSelection();
                      }
                    }}
                    className={cn(
                      selectionMode && selectedIds.length > 0
                        ? 'text-red-600 hover:text-red-700'
                        : 'text-neutral-600 hover:text-neutral-700'
                    )}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="ml-1 hidden sm:inline">
                      {selectionMode ? 'Elimina selezionate' : 'Seleziona'}
                    </span>
                  </Button>
                )}
                {selectionMode && (
                  <Button size="sm" variant="ghost" onClick={clearSelection}>
                    <X className="h-4 w-4" />
                    <span className="ml-1 hidden sm:inline">Annulla</span>
                  </Button>
                )}
                {onNewChat && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      clearSelection();
                      onNewChat();
                      onClose();
                    }}
                  >
                    <span className="text-lg leading-none">+</span>
                    <span className="ml-1 hidden sm:inline">Nuova chat</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 space-y-5 overflow-y-auto bg-gradient-to-b from-transparent via-transparent to-neutral-50/50 px-3 py-3 sm:space-y-6 sm:px-4 sm:py-4 dark:to-neutral-900/50">
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span className="h-2 w-2 animate-ping rounded-full bg-indigo-500" />
              Caricamento conversazioni...
            </div>
          )}
          {conversations.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-neutral-400">
              <MessageSquare className="mb-3 h-12 w-12 opacity-20" />
              <p>Nessuna conversazione trovata</p>
            </div>
          ) : groupedConversations.length === 0 ? (
            <div className="py-8 text-center text-neutral-500">Nessun risultato per "{search}"</div>
          ) : (
            groupedConversations.map(([label, items]) => (
              <div key={label} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h3 className="mb-3 flex items-center gap-2 px-2 text-[11px] font-semibold tracking-[0.08em] text-neutral-400 uppercase">
                  <Calendar className="h-3 w-3" /> {label}
                </h3>
                <div className="space-y-2">
                  {items.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => {
                        if (renameId === conv.id) return;
                        onSelect(conv.id);
                        onClose();
                      }}
                      className={cn(
                        'group relative flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-all duration-200 sm:p-3.5',
                        activeId === conv.id
                          ? 'border-indigo-200 bg-indigo-50/70 shadow-md shadow-indigo-500/10 dark:border-indigo-500/30 dark:bg-indigo-500/10'
                          : 'border-white/40 bg-white/70 hover:border-neutral-200 hover:bg-white/90 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'
                      )}
                    >
                      {/* Checkbox: only show in selection mode on mobile, always on desktop */}
                      {(selectionMode || !isMobile) && (
                        <div className="mt-1">
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-indigo-500"
                            checked={selectedIds.includes(conv.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleSelect(conv.id);
                            }}
                          />
                        </div>
                      )}
                      {/* Icon: hide on mobile to save space */}
                      <div
                        className={cn(
                          'mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                          'hidden sm:flex',
                          activeId === conv.id
                            ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'
                            : 'bg-neutral-100 text-neutral-500 dark:bg-white/10 dark:text-neutral-400'
                        )}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between">
                          {renameId === conv.id ? (
                            <div className="flex w-full items-center gap-2 pr-2">
                              <Input
                                value={renameValue}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  setRenameValue(e.target.value)
                                }
                                className="h-8 text-sm"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                className="h-8 w-8 text-green-600 hover:text-green-700"
                                disabled={isSaving}
                                onClick={(e) => confirmRename(e, conv.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                className="h-8 w-8 text-neutral-400 hover:text-neutral-600"
                                onClick={cancelRename}
                                disabled={isSaving}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <h4
                              className={cn(
                                'truncate pr-2 text-sm font-medium',
                                activeId === conv.id
                                  ? 'text-indigo-900 dark:text-indigo-100'
                                  : 'text-neutral-900 dark:text-white'
                              )}
                            >
                              {conv.title || 'Nuova Chat'}
                            </h4>
                          )}
                          <span className="shrink-0 text-[10px] whitespace-nowrap text-neutral-400">
                            {format(new Date(conv.updatedAt), 'HH:mm', { locale: it })}
                          </span>
                        </div>
                        {renameId !== conv.id && (
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                            {conv.preview}
                          </p>
                        )}
                      </div>

                      {/* Actions: sempre visibili su mobile, on-hover su desktop */}
                      <div
                        className={cn(
                          'absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1 rounded-lg bg-white/90 p-1 shadow-sm backdrop-blur-sm dark:bg-neutral-900/90',
                          isMobile
                            ? 'opacity-100'
                            : 'opacity-0 transition-opacity group-hover:opacity-100'
                        )}
                      >
                        {deleteId === conv.id ? (
                          <div className="animate-in zoom-in flex items-center gap-1 duration-200">
                            <span className="mr-1 text-[10px] font-medium text-red-600">
                              Elimina?
                            </span>
                            <Button
                              size="icon-sm"
                              variant="danger"
                              className="h-6 w-6 rounded-md"
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmDelete();
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              className="h-6 w-6 rounded-md"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteId(null);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            {onRename && (
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                className="h-7 w-7 text-neutral-400 hover:text-indigo-500"
                                onClick={(e) => startRename(e, conv.id, conv.title || '')}
                                disabled={isSaving}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              className="h-7 w-7 text-neutral-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                              onClick={(e) => handleDelete(e, conv.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
