"use client"
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';
import { Chat } from '@/lib/types';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

export default function Chatpage({ data }:{
    data:{user: User}
}) {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Setup Supabase authentication listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_OUT') {
          // Redirect to login if user signs out
          window.location.href = '/login';
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar with fixed height and independent scrolling */}
      <div className="w-80 h-screen overflow-hidden">
        <Sidebar onSelectChat={setSelectedChat} userData={data} />
      </div>
      
      {/* Chat window with fixed height and independent scrolling */}
      <div className="flex-1 h-screen overflow-hidden">
        <ChatWindow chat={selectedChat} userData={data} />
      </div>
    </div>
  );
}