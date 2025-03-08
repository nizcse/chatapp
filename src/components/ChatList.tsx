import { Chat } from '../lib/types';
import ChatItem from './ChatItem';

interface ChatListProps {
  chats: Chat[];
  onSelect: (chat: Chat) => void;
}

export default function ChatList({ chats, onSelect }: ChatListProps) {
  return (
    <ul className="flex-1 overflow-y-auto">
      {chats.map((chat) => (
        <ChatItem key={chat.id} chat={chat} onSelect={onSelect} />
      ))}
    </ul>
  );
}