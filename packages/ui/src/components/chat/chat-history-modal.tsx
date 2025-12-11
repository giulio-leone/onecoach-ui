'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Trash2, MessageSquare, Calendar, X, Pencil, Check } from 'lucide-react';
import { cn } from '@onecoach/lib-design-system';
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
  isLoading
}: ChatHistoryModalProps) {
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedIds([]);

  // Filter and Group Conversations
  const groupedConversations = useMemo(() => {
    const filtered = conversations.filter(c => 
      c.title.toLowerCase().includes(search.toLowerCase()) || 
      c.preview.toLowerCase().includes(search.toLowerCase())
    );

    const groups: Record<string, ChatHistoryItem[]> = {
      'Oggi': [],
      'Ieri': [],
      'Questa Settimana': [],
      'Questo Mese': [],
      'Più vecchi': []
    };

    filtered.forEach(c => {
      const date = new Date(c.updatedAt);
      if (isToday(date)) groups['Oggi'].push(c);
      else if (isYesterday(date)) groups['Ieri'].push(c);
      else if (isThisWeek(date)) groups['Questa Settimana'].push(c);
      else if (isThisMonth(date)) groups['Questo Mese'].push(c);
      else groups['Più vecchi'].push(c);
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
      className="flex flex-col h-[80vh] sm:h-[620px] p-0 overflow-hidden bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl w-[calc(100vw-20px)] max-w-[560px] sm:max-w-[680px]"
    >
      <div className="flex flex-col h-full">
        {/* Search Header */}
        <div className="px-3 py-3 sm:px-4 sm:py-4 border-b border-neutral-100 dark:border-white/10 bg-gradient-to-b from-white/90 to-white/40 dark:from-neutral-900/90 dark:to-neutral-900/40 sticky top-0 z-10 backdrop-blur-xl">
          <div className="flex flex-col gap-3 sm:gap-2">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                placeholder="Cerca nelle conversazioni..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                className="pl-10 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-white/10 focus:ring-indigo-500"
                autoFocus
              />
            </div>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span className="px-2 py-1 rounded-full bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-neutral-200">
                  {conversations.length} chat
                </span>
                {selectedIds.length > 0 && (
                  <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-100">
                    {selectedIds.length} selezionate
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {onDeleteSelected && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={selectedIds.length === 0}
                    onClick={() => {
                      onDeleteSelected?.(selectedIds);
                      clearSelection();
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    Elimina selezionate
                  </Button>
                )}
                {selectedIds.length > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearSelection}
                  >
                    Svuota selezione
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
                    + Nuova chat
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4 space-y-5 sm:space-y-6 bg-gradient-to-b from-transparent via-transparent to-neutral-50/50 dark:to-neutral-900/50">
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
              Caricamento conversazioni...
            </div>
          )}
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-400 py-12">
              <MessageSquare className="h-12 w-12 mb-3 opacity-20" />
              <p>Nessuna conversazione trovata</p>
            </div>
          ) : groupedConversations.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              Nessun risultato per "{search}"
            </div>
          ) : (
            groupedConversations.map(([label, items]) => (
              <div key={label} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h3 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.08em] mb-3 px-2 flex items-center gap-2">
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
                        "group relative flex items-start gap-3 p-3 sm:p-3.5 rounded-2xl cursor-pointer transition-all duration-200 border",
                        activeId === conv.id
                          ? "bg-indigo-50/70 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/30 shadow-md shadow-indigo-500/10"
                          : "bg-white/70 border-white/40 hover:border-neutral-200 hover:bg-white/90 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10"
                      )}
                    >
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
                      <div className={cn(
                        "mt-1 h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                        activeId === conv.id ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400" : "bg-neutral-100 text-neutral-500 dark:bg-white/10 dark:text-neutral-400"
                      )}>
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          {renameId === conv.id ? (
                            <div className="flex items-center gap-2 w-full pr-2">
                              <Input
                                value={renameValue}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRenameValue(e.target.value)}
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
                            <h4 className={cn(
                              "text-sm font-medium truncate pr-2",
                              activeId === conv.id ? "text-indigo-900 dark:text-indigo-100" : "text-neutral-900 dark:text-white"
                            )}>
                              {conv.title || 'Nuova Chat'}
                            </h4>
                          )}
                          <span className="text-[10px] text-neutral-400 whitespace-nowrap shrink-0">
                            {format(new Date(conv.updatedAt), 'HH:mm', { locale: it })}
                          </span>
                        </div>
                        {renameId !== conv.id && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                            {conv.preview}
                          </p>
                        )}
                      </div>

                      {/* Actions: sempre visibili su mobile, on-hover su desktop */}
                      <div
                        className={cn(
                          "absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm p-1 rounded-lg shadow-sm",
                          isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"
                        )}
                      >
                        {deleteId === conv.id ? (
                          <div className="flex items-center gap-1 animate-in zoom-in duration-200">
                            <span className="text-[10px] font-medium text-red-600 mr-1">Elimina?</span>
                            <Button 
                              size="icon-sm" 
                              variant="danger" 
                              className="h-6 w-6 rounded-md"
                              onClick={(e) => { e.stopPropagation(); confirmDelete(); }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="icon-sm" 
                              variant="ghost" 
                              className="h-6 w-6 rounded-md"
                              onClick={(e) => { e.stopPropagation(); setDeleteId(null); }}
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
                              className="h-7 w-7 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
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
