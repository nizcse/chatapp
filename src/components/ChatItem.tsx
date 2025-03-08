import { Chat } from '../lib/types';

interface ChatItemProps {
  chat: Chat;
  onSelect: (chat: Chat) => void;
}

export default function ChatItem({ chat, onSelect }: ChatItemProps) {
  return (
    <li
      className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
      onClick={() => onSelect(chat)}
    >
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={chat.avatar}
              alt={chat.name}
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
            {chat.active && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="font-medium text-gray-900 truncate">{chat.name}</p>
              <p className="text-xs text-gray-500">{chat.timestamp}</p>
            </div>
            <p className="text-sm text-gray-500 truncate">{chat.status}</p>
            {chat.phone && (
              <p className="text-xs text-gray-400 mt-0.5">{chat.phone}</p>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
