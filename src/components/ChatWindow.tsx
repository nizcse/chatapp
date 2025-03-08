"use client";
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Chat, DbMessage, MessageType, mapDbMessageToMessage } from '@/lib/types';
import InputArea from './InputArea';
import { RealtimePostgresInsertPayload, User } from '@supabase/supabase-js';

interface ChatWindowProps {
  chat: Chat | null;
  userData: {user: User};
}

export default function ChatWindow({ chat, userData }: ChatWindowProps) {
  const [emailToAdd, setEmailToAdd] = useState('');
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const addUserByEmail = async () => {
    if (!chat || !emailToAdd.trim()) return;

    try {
        const trimmedEmail = emailToAdd.trim();
        console.log('Searching for user with email:', trimmedEmail);

        const { data: userResults, error: userQueryError } = await supabase
            .from('users')
            .select('uid')
            .eq(('email').toLowerCase(), (trimmedEmail).toLowerCase());

        console.log('Full userResults:', userResults);
        console.log('User query error:', userQueryError);

        if (userQueryError || !userResults || userResults.length === 0) {
            console.error('User not found:', userQueryError);
            alert('User not found with that email.');
            return;
        }

        const userId = userResults[0].uid;
        console.log('Found user ID:', userId);
        console.log("type of userId:", typeof(userId));

        // Check for duplicate participant
        const { data: existingParticipant, error: duplicateError } = await supabase
            .from('chat_participants')
            .select('*')
            .eq('chat_id', chat.id)
            .eq('user_id', userId);

        console.log('Duplicate check results:', existingParticipant);
        console.log('Duplicate check error:', duplicateError);
        if(duplicateError){
            console.error('Duplicate check error details:', duplicateError);
        }

        if (duplicateError) {
            console.error('Error checking for duplicate participant:', duplicateError);
            alert('Error checking for duplicate participant.');
            return;
        }

        if (existingParticipant && existingParticipant.length > 0) {
            alert('User is already a participant in this chat.');
            return;
        }

        console.log('Inserting participant:', {
            chat_id: chat.id,
            user_id: userId,
        });

        const { error: participantError } = await supabase
            .from('chat_participants')
            .insert({
                chat_id: chat.id,
                user_id: userId,
            });

        console.log('Participant insert error:', participantError);

        if (participantError) {
            console.error('Error adding participant:', participantError);
            alert('Error adding participant: ' + participantError.message);
            return;
        }

        alert('User added to chat successfully.');
        setEmailToAdd(''); // Clear input
    } catch (error) {
        console.error('Unexpected error:', error);
        alert('An unexpected error occurred.');
    }
};

  useEffect(() => {
    if (!chat) return;

    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chat.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(data.map(mapDbMessageToMessage));
      }
      setLoading(false);
    };

    fetchMessages();

    // Set up realtime subscription
    const subscription = supabase
      .channel(`chat:${chat.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `chat_id=eq.${chat.id}`
      }, (payload:RealtimePostgresInsertPayload<DbMessage>) => {
        const newMessage = mapDbMessageToMessage(payload?.new);
        setMessages(prev => [...prev, newMessage]);
      })
      .subscribe();

    // Mark messages as read
    const markAsRead = async () => {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('chat_id', chat.id)
        .neq('sender_id', userData?.user?.id);
    };

    markAsRead();

    return () => {
      subscription.unsubscribe();
    };
  }, [chat, userData]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!chat || !text.trim() || !userData?.user) return;

    const newMessage = {
      chat_id: chat.id,
      sender_id: userData.user.id,
      sender_name: userData?.user?.email?.split('@')[0], // Use username or first part of email
      content: text,
      read: false
    };

    const { error } = await supabase
      .from('messages')
      .insert(newMessage);

    if (error) {
      console.error('Error sending message:', error);
    }

    // Update last_message_at in chat
    await supabase
      .from('chats')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', chat.id);
  };

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 text-center">
          <p className="mb-2">Select a conversation</p>
          <p className="text-sm">or start a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header section */}
      <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="flex items-center">
          <img
            src={chat.avatar}
            alt={chat.name}
            className="w-10 h-10 rounded-full object-cover border border-gray-200"
          />
          <div className="ml-3">
            <h2 className="font-semibold text-gray-900">{chat.name}</h2>
            <p className="text-sm text-gray-500">
              {chat.active ? 'Active now' : `Last active: ${chat.timestamp}`}
            </p>
          </div>
        </div>
        {chat && (
          <div className="flex items-center">
            <input
              type="email"
              placeholder="Enter email to add"
              value={emailToAdd}
              onChange={(e) => setEmailToAdd(e.target.value)}
              className="border rounded p-2 mr-2"
            />
            <button
              onClick={addUserByEmail}
              className="bg-indigo-600 text-white p-2 rounded"
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* Messages area - will scroll */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>No messages yet</p>
            <p className="text-sm mt-1">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`max-w-[70%] mb-4 ${
                message.sender_id === userData?.user?.id
                  ? 'ml-auto bg-indigo-600 text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg'
                  : 'mr-auto bg-white text-gray-800 rounded-tr-lg rounded-tl-lg rounded-br-lg border border-gray-200'
              } p-3 shadow-sm`}
            >
              <p className="text-sm">{message.text}</p>
              <div
                className={`flex items-center mt-1 text-xs ${
                  message.sender_id === userData?.user?.id ? 'text-indigo-200' : 'text-gray-500'
                }`}
              >
                <span>{message.timestamp}</span>
                {message.via && (
                  <span className="ml-2">· {message.via}</span>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area - fixed at bottom */}
      <div className="sticky bottom-0 w-full bg-white border-t border-gray-200">
        <InputArea onSendMessage={sendMessage} />
      </div>
    </div>
  );
}