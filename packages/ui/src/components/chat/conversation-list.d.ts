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
export declare function ConversationList({ conversations, activeId, onSelect, onNewChat, onDelete, onDeleteSelected, onDeleteAll, isDeleting, }: ConversationListProps): import("react/jsx-runtime").JSX.Element;
export {};
