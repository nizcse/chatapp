"use client";
import { useEffect, useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Chat, mapDbChatToChat, } from '@/lib/types';
import ChatList from './ChatList';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

interface SidebarProps {
    onSelectChat: (chat: Chat) => void;
    userData: {user:User};
}

export default function Sidebar({ onSelectChat, userData }: SidebarProps) {
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const supabase = createClient();

    const fetchChats = async () => {
        if (!userData?.user?.id) return;
        if (!userData?.user?.email) return;
    
        setLoading(true);
    
        // Fetch user data
        const { data: udata, error: userError } = await supabase
            .from('users')
            .select('uid')
            .eq('email', userData?.user?.email.toLowerCase());
    
        if (userError || !udata || udata.length === 0) {
            console.error('Error fetching user data:', userError?.message || 'No user found');
            setLoading(false);
            return;
        }
    
        const userId = udata[0]?.uid;
    
        // Fetch chats where the user is a participant
        const { data: participantData, error: participantError } = await supabase
            .from('chat_participants')
            .select('chat_id')
            .eq('user_id', userId);
    
        if (participantError) {
            console.log('Error fetching chat participants:', participantError);
            setLoading(false);
            return;
        }
    
        if (!participantData || participantData.length === 0) {
            setLoading(false);
            return;
        }
    
        const chatIds = participantData.map(item => item.chat_id);
    
        // Fetch the actual chats
        const { data: chatData, error: chatError } = await supabase
            .from('chats')
            .select('*')
            .in('id', chatIds)
            .order('last_message_at', { ascending: false });
    
        if (chatError) {
            console.error('Error fetching chats:', chatError);
        } else {
            if (chatData.length > 0 && chatData[0]?.id !== chats[0]?.id) {
                setChats(chatData.map(mapDbChatToChat));
            }
        }
    
        setLoading(false);
    };
    

    useEffect(() => {
        fetchChats();

        // Set up realtime subscription for new messages (to update last_message_at)
        const subscription = supabase
            .channel('public:chats')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'chats'
            }, () => {
                fetchChats(); // Refresh chats when any chat is updated
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [userData]);

    const createNewChat = async () => {
        if (!userData?.user?.id) {
            console.error('User data not available');
            return;
        }
        if (!userData?.user?.email) {
            console.error('User data not available');
            return;
        }
    
        try {
            // Fetch user data
            const { data: udata, error: userError } = await supabase
                .from('users')
                .select('uid')
                .eq('email', userData.user.email.toLowerCase());
    
            if (userError || !udata || udata.length === 0) {
                console.error('Error fetching user data:', userError?.message || 'No user found');
                return;
            }
    
            const userId = udata[0]?.uid;
    
            // Create a new chat
            const { data: chatData, error: chatError } = await supabase
                .from('chats')
                .insert({
                    name: `New Chat ${new Date().toLocaleTimeString()}`,
                    status: 'New Conversation',
                    avatar_url: 'https://picsum.photos/536/354',
                })
                .select()
                .single();
    
            if (chatError) {
                console.log('Error creating chat:', chatError.message);
                return;
            }
    
            console.log('Chat created successfully:', chatData);
    
            // Add the current user as a participant
            const { data: participantData, error: participantError } = await supabase
                .from('chat_participants')
                .insert({
                    chat_id: chatData.id,
                    user_id: userId,
                })
                .select();
    
            if (participantError) {
                console.error('Error adding participant:', participantError);
                return;
            }
    
            console.log('Participant added successfully:', participantData);
    
            // Refresh chat list
            const { data: refreshedChatData, error: refreshedChatError } = await supabase
                .from('chats')
                .select('*')
                .in(
                    'id',
                    (
                        await supabase
                            .from('chat_participants')
                            .select('chat_id')
                            .eq('user_id', userId)
                    ).data?.map(item => item.chat_id) || []
                )
                .order('last_message_at', { ascending: false });
    
            if (refreshedChatError) {
                console.error('Error refreshing chats:', refreshedChatError);
                return;
            }
    
            if (refreshedChatData) {
                setChats(refreshedChatData.map(mapDbChatToChat));
            }
    
            // Select the new chat
            const newChat = mapDbChatToChat(chatData);
            onSelectChat(newChat);
        } catch (error) {
            console.error('Unexpected error:', error);
        }
    };
    
    const filteredChats = searchQuery
        ? chats.filter(chat =>
            chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            chat.status.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : chats;

    return (
        <div className="h-full flex flex-col bg-white border-r border-gray-200 w-80">
            {/* Header section - fixed */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                        P
                    </div>
                    <span className="ml-3 text-indigo-600 font-bold text-lg">Periskope</span>
                </div>

                <div className="mt-3 flex space-x-3">
                    <button
                        className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors"
                        onClick={createNewChat}
                    >
                        New Chat
                    </button>
                    <button className="text-gray-600 text-sm hover:text-indigo-600 transition-colors duration-200">
                        Filter
                    </button>
                </div>

                <div className="mt-3 relative">
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        className="w-full p-2.5 pl-10 pr-4 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    {searchQuery && (
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            Filtered
                        </span>
                    )}
                </div>
            </div>

            {/* Chat list - scrollable */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : chats.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-center p-4 h-32">
                        <div>
                            <p className="text-gray-500 mb-2">No conversations yet</p>
                            <button
                                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors"
                                onClick={createNewChat}
                            >
                                Start a new chat
                            </button>
                        </div>
                    </div>
                ) : (
                    <ChatList chats={filteredChats} onSelect={onSelectChat} />
                )}
            </div>
        </div>
    );
}