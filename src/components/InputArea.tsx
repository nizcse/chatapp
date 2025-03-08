"use client";
import { useState } from 'react';
import {
  PaperClipIcon,
  CameraIcon,
  MicrophoneIcon,
  StarIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';

interface InputAreaProps {
  onSendMessage: (text: string) => void;
}

export default function InputArea({ onSendMessage }: InputAreaProps) {
  const [messageText, setMessageText] = useState('');
  
  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage(messageText);
      setMessageText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-4 py-3 border-t border-gray-200 bg-white">
      <div className="flex items-center space-x-2">
        <div className="flex space-x-2">
          <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <PaperClipIcon className="w-5 h-5 text-gray-500" />
          </button>
          <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <CameraIcon className="w-5 h-5 text-gray-500" />
          </button>
          <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <MicrophoneIcon className="w-5 h-5 text-gray-500" />
          </button>
          <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <StarIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Type a message..."
            className="w-full py-2.5 px-4 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button 
            className="absolute right-1 top-1 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
            onClick={handleSend}
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}