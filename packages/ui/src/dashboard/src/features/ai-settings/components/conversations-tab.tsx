import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@giulio-leone/lib-design-system';
import {
  MessageSquare,
  Search,
  User,
  Bot,
  Trash2,
  Eye,
  Clock,
  Loader2,
  X,
  MoreVertical,
  Flag,
  Archive,
  RefreshCw,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it, enUS } from 'date-fns/locale';
import { toast } from 'sonner';
import { Checkbox } from '@giulio-leone/ui';
import { useTranslations, useLocale } from 'next-intl';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  metadata?: {
    model?: string;
    tokens?: number;
    toolCalls?: string[];
  };
}

interface Conversation {
  id: string;
  title: string | null;
  userId: string;
  userName: string;
  userEmail: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  status: 'active' | 'archived' | 'flagged';
}

type ConversationStatus = Conversation['status'];

interface ConversationsTabProps {
  initialConversations?: Conversation[];
}

export function ConversationsTab({ initialConversations = [] }: ConversationsTabProps) {
  const t = useTranslations('admin.aiSettings.conversations');
  const tAdmin = useTranslations('admin');
  const locale = useLocale();
  const dateLocale = locale === 'it' ? it : enUS;

  const STATUS_CONFIG: Record<
    ConversationStatus,
    { label: string; color: string; textColor: string }
  > = useMemo(
    () => ({
      active: {
        label: t('status.active'),
        color: 'bg-emerald-500',
        textColor: 'text-emerald-600',
      },
      archived: {
        label: t('status.archived'),
        color: 'bg-neutral-400',
        textColor: 'text-neutral-500',
      },
      flagged: {
        label: t('status.flagged'),
        color: 'bg-red-500',
        textColor: 'text-red-600',
      },
    }),
    [t]
  );

  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [isLoading, setIsLoading] = useState(!initialConversations.length);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Conversation['status'] | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBatchLoading, setIsBatchLoading] = useState(false);

  // Load conversations
  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/admin/conversations?${params}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        setSelectedIds(new Set());
        setSelectionMode(false);
      }
    } catch {
      // Mock data
      setConversations([
        {
          id: '1',
          title: 'Richiesta piano alimentare',
          userId: 'user1',
          userName: 'Marco Rossi',
          userEmail: 'marco@example.com',
          messageCount: 12,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date(Date.now() - 1800000).toISOString(),
          lastMessage: 'Perfetto, grazie per il piano!',
          status: 'active',
        },
        {
          id: '2',
          title: 'Programma workout settimanale',
          userId: 'user2',
          userName: 'Giulia Bianchi',
          userEmail: 'giulia@example.com',
          messageCount: 24,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 43200000).toISOString(),
          lastMessage: 'Ho completato tutte le serie!',
          status: 'active',
        },
        {
          id: '3',
          title: 'Consulenza nutrizione',
          userId: 'user3',
          userName: 'Luca Verdi',
          userEmail: 'luca@example.com',
          messageCount: 8,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
          lastMessage: 'Grazie, conversazione archiviata',
          status: 'archived',
        },
        {
          id: '4',
          title: 'Segnalazione comportamento',
          userId: 'user4',
          userName: 'Test User',
          userEmail: 'test@example.com',
          messageCount: 3,
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          lastMessage: 'Contenuto sospetto...',
          status: 'flagged',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    if (!initialConversations.length) {
      loadConversations();
    }
  }, [loadConversations, initialConversations.length]);

  // Load messages for a conversation
  const loadMessages = async (conversationId: string) => {
    setIsLoadingMessages(true);
    try {
      const res = await fetch(`/api/admin/conversations/${conversationId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {
      // Mock messages
      setMessages([
        {
          id: 'm1',
          role: 'user',
          content: 'Ciao, vorrei un piano alimentare per la settimana',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'm2',
          role: 'assistant',
          content:
            'Certo! Per creare un piano alimentare personalizzato ho bisogno di alcune informazioni...',
          createdAt: new Date(Date.now() - 3500000).toISOString(),
          metadata: { model: 'gpt-4o', tokens: 245 },
        },
        {
          id: 'm3',
          role: 'user',
          content: 'Peso 75kg, altezza 180cm, obiettivo: definizione muscolare',
          createdAt: new Date(Date.now() - 3400000).toISOString(),
        },
        {
          id: 'm4',
          role: 'assistant',
          content:
            'Perfetto! In base ai tuoi dati, il tuo fabbisogno calorico giornaliero è di circa 2400 kcal. Per la definizione muscolare ti consiglio un deficit moderato di 300-400 calorie...',
          createdAt: new Date(Date.now() - 3300000).toISOString(),
          metadata: {
            model: 'gpt-4o',
            tokens: 512,
            toolCalls: ['calculate_bmr', 'get_macro_split'],
          },
        },
      ]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Handle conversation selection
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
  };

  // Handle actions
  const handleAction = async (action: 'archive' | 'flag' | 'delete', conversationId: string) => {
    try {
      const res = await fetch(`/api/admin/conversations/${conversationId}/${action}`, {
        method: 'POST',
      });

      if (res.ok) {
        if (action === 'delete') {
          setConversations((prev) => prev.filter((c: any) => c.id !== conversationId));
          if (selectedConversation?.id === conversationId) {
            setSelectedConversation(null);
            setMessages([]);
          }
          setSelectedIds((prev) => {
            if (!prev.has(conversationId)) return prev;
            const next = new Set(prev);
            next.delete(conversationId);
            return next;
          });
          toast.success(tAdmin('toasts.deleted'));
        } else if (action === 'archive') {
          setConversations((prev) =>
            prev.map((c: any) => (c.id === conversationId ? { ...c, status: 'archived' as const } : c))
          );
          toast.success(tAdmin('toasts.archived'));
        } else {
          setConversations((prev) =>
            prev.map((c: any) => (c.id === conversationId ? { ...c, status: 'flagged' as const } : c))
          );
          toast.success(tAdmin('toasts.flagged'));
        }
      }
    } catch {
      toast.error(tAdmin('toasts.error'));
    }
    setActionMenuId(null);
  };

  const toggleConversationSelection = (conversationId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(conversationId)) {
        next.delete(conversationId);
      } else {
        next.add(conversationId);
      }
      return next;
    });
    setSelectionMode(true);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  const handleBatchAction = async (action: 'archive' | 'flag' | 'delete') => {
    if (!selectedIds.size) return;
    setIsBatchLoading(true);
    try {
      const res = await fetch('/api/admin/conversations/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids: Array.from(selectedIds) }),
      });

      if (!res.ok) {
        throw new Error('Batch request failed');
      }

      if (action === 'delete') {
        setConversations((prev) => prev.filter((c: any) => !selectedIds.has(c.id)));
        if (selectedConversation && selectedIds.has(selectedConversation.id)) {
          setSelectedConversation(null);
          setMessages([]);
        }
        toast.success(tAdmin('toasts.batchDeleted'));
      } else {
        const targetStatus = action === 'archive' ? ('archived' as const) : ('flagged' as const);
        setConversations((prev) =>
          prev.map((c: any) => (selectedIds.has(c.id) ? { ...c, status: targetStatus } : c))
        );
        toast.success(
          targetStatus === 'archived' ? tAdmin('toasts.batchArchived') : tAdmin('toasts.batchFlagged')
        );
      }
      clearSelection();
    } catch {
      toast.error(tAdmin('toasts.batchError'));
    } finally {
      setIsBatchLoading(false);
      setActionMenuId(null);
    }
  };

  // Filtered conversations
  const filteredConversations = conversations.filter((c: any) => {
    const matchesSearch =
      !searchQuery ||
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const hasSelection = selectedIds.size > 0;
  const selectAllFiltered = () => {
    setSelectionMode(true);
    setSelectedIds(new Set(filteredConversations.map((conversation: any) => conversation.id)));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{t('title')}</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {t('subtitle', { count: filteredConversations.length })}
          </p>
        </div>
        <button
          onClick={() => loadConversations()}
          className={cn(
            'flex items-center gap-2 rounded-xl px-4 py-2.5',
            'bg-neutral-100 dark:bg-white/[0.08]',
            'text-neutral-600 dark:text-neutral-300',
            'hover:bg-neutral-200 dark:hover:bg-neutral-600'
          )}
        >
          <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          <span className="hidden sm:inline">{t('refresh')}</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full rounded-xl border py-2.5 pr-4 pl-10',
              'border-neutral-200/60 dark:border-white/[0.08]',
              'bg-white dark:bg-white/[0.04]',
              'text-neutral-900 placeholder:text-neutral-400 dark:text-white',
              'focus:border-primary-500 focus:ring-primary-500/20 focus:ring-2'
            )}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            Object.entries(STATUS_CONFIG) as [
              ConversationStatus,
              (typeof STATUS_CONFIG)[ConversationStatus],
            ][]
          ).map(([status, config]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? null : status)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-2',
                'text-sm font-medium transition-colors',
                statusFilter === status
                  ? `${config.color} text-white`
                  : 'bg-neutral-100 text-neutral-600 dark:bg-white/[0.08] dark:text-neutral-300'
              )}
            >
              <div
                className={cn(
                  'h-2 w-2 rounded-full',
                  statusFilter === status ? 'bg-white' : config.color
                )}
              />
              {config.label}
            </button>
          ))}
          <button
            onClick={() => (selectionMode ? clearSelection() : setSelectionMode(true))}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              selectionMode
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-200'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-white/[0.08] dark:text-neutral-300 dark:hover:bg-neutral-600'
            )}
          >
            {selectionMode ? t('selection.cancel') : t('selection.multi')}
          </button>
        </div>
      </div>

      {(selectionMode || hasSelection) && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200/60 bg-white/80 p-3 text-sm dark:border-white/[0.08] dark:bg-neutral-800/80">
          <span className="text-neutral-600 dark:text-neutral-300">
            {hasSelection ? t('selection.count', { count: selectedIds.size }) : t('selection.none')}
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={selectAllFiltered}
              disabled={!filteredConversations.length}
              className={cn(
                'rounded-lg px-3 py-1.5',
                'border border-neutral-200/60 text-neutral-700 hover:bg-neutral-100',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'dark:border-white/[0.08] dark:text-neutral-200 dark:hover:bg-white/[0.08]'
              )}
            >
              {t('selection.all', { count: filteredConversations.length })}
            </button>
            <button
              onClick={() => handleBatchAction('archive')}
              disabled={!hasSelection || isBatchLoading}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-1.5',
                'border border-neutral-200/60 text-neutral-700 hover:bg-neutral-100',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'dark:border-white/[0.08] dark:text-neutral-200 dark:hover:bg-white/[0.08]'
              )}
            >
              <Archive className="h-4 w-4" />
              {t('actions.archive')}
            </button>
            <button
              onClick={() => handleBatchAction('flag')}
              disabled={!hasSelection || isBatchLoading}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-1.5',
                'border border-amber-200 text-amber-700 hover:bg-amber-50',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'dark:border-amber-500/40 dark:text-amber-200 dark:hover:bg-amber-500/10'
              )}
            >
              <Flag className="h-4 w-4" />
              {t('actions.flag')}
            </button>
            <button
              onClick={() => handleBatchAction('delete')}
              disabled={!hasSelection || isBatchLoading}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-1.5',
                'border border-red-200 text-red-600 hover:bg-red-50',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'dark:border-red-500/40 dark:text-red-200 dark:hover:bg-red-500/10'
              )}
            >
              <Trash2 className="h-4 w-4" />
              {t('actions.delete')}
            </button>
            {hasSelection && (
              <button
                onClick={clearSelection}
                className={cn(
                  'rounded-lg px-3 py-1.5',
                  'border border-neutral-200/60 text-neutral-600 hover:bg-neutral-100',
                  'dark:border-white/[0.08] dark:text-neutral-300 dark:hover:bg-white/[0.08]'
                )}
              >
                {t('selection.cancel')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Conversations List */}
        <div
          className={cn(
            'rounded-2xl lg:col-span-2',
            'bg-white/80 dark:bg-neutral-800/80',
            'backdrop-blur-xl',
            'border border-neutral-200/50 dark:border-white/[0.08]',
            'overflow-hidden'
          )}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-primary-500 h-6 w-6 animate-spin" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
              <MessageSquare className="mb-3 h-12 w-12 opacity-50" />
              <p>{t('actions.noResults')}</p>
            </div>
          ) : (
            <div className="max-h-[600px] divide-y divide-neutral-100 overflow-y-auto dark:divide-white/[0.08]">
              {filteredConversations.map((conversation: any) => (
                <div
                  key={conversation.id}
                  className={cn(
                    'relative cursor-pointer p-4 transition-colors',
                    selectedConversation?.id === conversation.id
                      ? 'bg-primary-50 dark:bg-primary-500/10'
                      : selectionMode && selectedIds.has(conversation.id)
                        ? 'bg-primary-50/60 dark:bg-primary-500/10'
                        : 'hover:bg-neutral-50 dark:hover:bg-white/[0.08]/50'
                  )}
                  onClick={() => {
                    if (selectionMode) {
                      toggleConversationSelection(conversation.id);
                      return;
                    }
                    handleSelectConversation(conversation);
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-3">
                        {selectionMode && (
                          <Checkbox
                            checked={selectedIds.has(conversation.id)}
                            onChange={() => toggleConversationSelection(conversation.id)}
                            onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}
                            className="mt-1"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                'h-2 w-2 rounded-full',
                                STATUS_CONFIG[conversation.status as ConversationStatus].color
                              )}
                            />
                            <h4 className="truncate font-medium text-neutral-900 dark:text-white">
                              {conversation.title || t('messages.noTitle')}
                            </h4>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-sm text-neutral-500">
                            <User className="h-3.5 w-3.5" />
                            <span className="truncate">{conversation.userName}</span>
                          </div>
                          <p className="mt-1.5 truncate text-sm text-neutral-600 dark:text-neutral-400">
                            {conversation.lastMessage}
                          </p>
                          <div className="mt-2 flex items-center gap-3 text-xs text-neutral-400">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {conversation.messageCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(conversation.updatedAt), {
                                addSuffix: true,
                                locale: dateLocale,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Menu */}
                    <div className="relative">
                      <button
                        onClick={(e: React.MouseEvent<HTMLElement>) => {
                          e.stopPropagation();
                          setActionMenuId(
                            actionMenuId === conversation.id ? null : conversation.id
                          );
                        }}
                        className={cn(
                          'rounded-lg p-1.5',
                          'hover:bg-neutral-100 dark:hover:bg-neutral-600',
                          'text-neutral-400 hover:text-neutral-600'
                        )}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      <AnimatePresence>
                        {actionMenuId === conversation.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={cn(
                              'absolute top-full right-0 z-50 mt-1',
                              'min-w-[140px] rounded-lg p-1',
                              'bg-white dark:bg-white/[0.04]',
                              'border border-neutral-200/60 dark:border-white/[0.08]',
                              'shadow-xl'
                            )}
                            onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handleAction('archive', conversation.id)}
                              className={cn(
                                'flex w-full items-center gap-2 rounded-md px-3 py-2',
                                'text-sm text-neutral-700 dark:text-neutral-300',
                                'hover:bg-neutral-100 dark:hover:bg-white/[0.08]'
                              )}
                            >
                              <Archive className="h-4 w-4" />
                              {t('actions.archive')}
                            </button>
                            <button
                              onClick={() => handleAction('flag', conversation.id)}
                              className={cn(
                                'flex w-full items-center gap-2 rounded-md px-3 py-2',
                                'text-sm text-amber-600',
                                'hover:bg-amber-50 dark:hover:bg-amber-500/10'
                              )}
                            >
                              <Flag className="h-4 w-4" />
                              {t('actions.flag')}
                            </button>
                            <button
                              onClick={() => handleAction('delete', conversation.id)}
                              className={cn(
                                'flex w-full items-center gap-2 rounded-md px-3 py-2',
                                'text-sm text-red-600',
                                'hover:bg-red-50 dark:hover:bg-red-500/10'
                              )}
                            >
                              <Trash2 className="h-4 w-4" />
                              {t('actions.delete')}
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Detail */}
        <div
          className={cn(
            'rounded-2xl lg:col-span-3',
            'bg-white/80 dark:bg-neutral-800/80',
            'backdrop-blur-xl',
            'border border-neutral-200/50 dark:border-white/[0.08]',
            'overflow-hidden'
          )}
        >
          {!selectedConversation ? (
            <div className="flex h-[600px] flex-col items-center justify-center text-neutral-500">
              <Eye className="mb-3 h-12 w-12 opacity-50" />
              <p>{t('actions.view')}</p>
            </div>
          ) : (
            <div className="flex h-[600px] flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-100 p-4 dark:border-white/[0.08]">
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white">
                    {selectedConversation.title || t('messages.noTitle')}
                  </h3>
                  <p className="text-sm text-neutral-500">
                    {selectedConversation.userName} • {selectedConversation.userEmail}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedConversation(null);
                    setMessages([]);
                  }}
                  className="rounded-lg p-2 hover:bg-neutral-100 lg:hidden dark:hover:bg-white/[0.08]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="text-primary-500 h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  messages.map((message: any) => (
                    <div
                      key={message.id}
                      className={cn(
                        'flex gap-3',
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {message.role === 'assistant' && (
                        <div className="from-primary-500 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br to-violet-600">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div
                        className={cn(
                          'max-w-[80%] rounded-2xl px-4 py-3',
                          message.role === 'user'
                            ? 'bg-primary-500 text-white'
                            : 'bg-neutral-100 text-neutral-900 dark:bg-white/[0.08] dark:text-white'
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        {message.metadata && (
                          <div
                            className={cn(
                              'mt-2 flex flex-wrap items-center gap-2 text-xs',
                              message.role === 'user' ? 'text-white/70' : 'text-neutral-500'
                            )}
                          >
                            {message.metadata.model && (
                              <span className="rounded-full bg-black/10 px-2 py-0.5 dark:bg-white/10">
                                {message.metadata.model}
                              </span>
                            )}
                            {message.metadata.tokens && (
                              <span>
                                {t('messages.tokens', { count: message.metadata.tokens })}
                              </span>
                            )}
                            {message.metadata.toolCalls?.map((tool: any) => (
                              <span
                                key={tool}
                                className="rounded-full bg-violet-500/20 px-2 py-0.5 text-violet-600 dark:text-violet-400"
                              >
                                {tool}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {message.role === 'user' && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-600">
                          <User className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
