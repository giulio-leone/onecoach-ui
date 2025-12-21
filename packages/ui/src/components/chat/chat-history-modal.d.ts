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
export declare function ChatHistoryModal({ isOpen, onClose, conversations, activeId, onSelect, onDelete, onRename, onNewChat, onDeleteSelected, isLoading }: ChatHistoryModalProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=chat-history-modal.d.ts.map