// 1. First, let's modify the types.ts to include database types
export interface Chat {
  id: string;
  name: string;
  avatar: string;
  status: string;
  timestamp: string;
  active: boolean;
  phone?: string;
  created_at?: string;
  last_message_at?: string;
}

export interface MessageType {
  id?: string;
  chat_id: string;
  sender: string;
  sender_id: string;
  text: string;
  timestamp: string;
  created_at?: string;
  via?: string;
  read?: boolean;
}

// Supabase tables types
export interface DbChat {
  id: string;
  name: string;
  avatar_url: string;
  status: string;
  active: boolean;
  phone: string | null;
  created_at: string;
  last_message_at: string;
}

export interface DbMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  via: string | null;
  read: boolean;
}

// Mappers to convert between DB and UI formats
export const mapDbChatToChat = (dbChat: DbChat): Chat => ({
  id: dbChat.id,
  name: dbChat.name,
  avatar: dbChat.avatar_url,
  status: dbChat.status,
  timestamp: new Date(dbChat.last_message_at).toLocaleDateString(),
  active: dbChat.active,
  phone: dbChat.phone || undefined,
  created_at: dbChat.created_at,
  last_message_at: dbChat.last_message_at
});

export const mapDbMessageToMessage = (dbMessage: DbMessage): MessageType => ({
  id: dbMessage.id,
  chat_id: dbMessage.chat_id,
  sender: dbMessage.sender_name,
  sender_id: dbMessage.sender_id,
  text: dbMessage.content,
  timestamp: new Date(dbMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  created_at: dbMessage.created_at,
  via: dbMessage.via || undefined,
  read: dbMessage.read
});