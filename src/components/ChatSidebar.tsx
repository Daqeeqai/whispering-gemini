
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "./ui/button";

interface ChatHistoryItem {
  id: string;
  title: string;
  timestamp: Date;
}

interface ChatSidebarProps {
  chats: ChatHistoryItem[];
  activeChat: string | null;
  onChatSelect: (chatId: string) => void;
  onChatDelete: (chatId: string) => void;
}

export function ChatSidebar({
  chats,
  activeChat,
  onChatSelect,
  onChatDelete,
}: ChatSidebarProps) {
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);

  return (
    <div className="w-64 h-screen bg-secondary border-r border-border p-4">
      <div className="space-y-2">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`relative p-3 rounded-lg cursor-pointer transition-all ${
              activeChat === chat.id
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent"
            }`}
            onClick={() => onChatSelect(chat.id)}
            onMouseEnter={() => setHoveredChat(chat.id)}
            onMouseLeave={() => setHoveredChat(null)}
          >
            <div className="truncate">{chat.title}</div>
            {hoveredChat === chat.id && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={(e) => {
                  e.stopPropagation();
                  onChatDelete(chat.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
