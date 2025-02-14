
import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
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
  onNewChat: () => void;
}

export function ChatSidebar({
  chats,
  activeChat,
  onChatSelect,
  onChatDelete,
  onNewChat,
}: ChatSidebarProps) {
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);

  return (
    <div className="w-72 h-screen bg-black/10 backdrop-blur-xl border-r border-white/10 p-4 flex flex-col gap-4">
      <Button
        onClick={onNewChat}
        className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 transition-all duration-300"
      >
        <Plus className="h-4 w-4 mr-2" />
        New Chat
      </Button>
      
      <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`relative p-3 rounded-lg cursor-pointer transition-all duration-300 backdrop-blur-sm ${
              activeChat === chat.id
                ? "bg-white/10 text-white shadow-lg shadow-purple-500/20"
                : "hover:bg-white/5 text-white/80"
            }`}
            onClick={() => onChatSelect(chat.id)}
            onMouseEnter={() => setHoveredChat(chat.id)}
            onMouseLeave={() => setHoveredChat(null)}
          >
            <div className="truncate pr-8">{chat.title}</div>
            {hoveredChat === chat.id && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white hover:bg-red-500/20"
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
