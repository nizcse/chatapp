import { MessageType } from '../lib/types';

interface MessageProps {
  message: MessageType;
}

export default function Message({ message }: MessageProps) {
  const isPeriskope = message.sender === 'Periskope';
  return (
    <div className={`flex ${isPeriskope ? 'justify-end' : 'justify-start'}`}>
      {!isPeriskope && (
        <div className="flex-shrink-0 mr-3">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm">
            {message.sender.charAt(0)}
          </div>
        </div>
      )}
      
      <div 
        className={`rounded-2xl shadow-sm px-4 py-3 max-w-sm ${
          isPeriskope 
            ? 'bg-indigo-600 text-white rounded-br-none' 
            : 'bg-white text-gray-700 rounded-bl-none'
        }`}
      >
        <div className="text-sm">{message.text}</div>
        <div className={`text-xs mt-1 ${isPeriskope ? 'text-indigo-200' : 'text-gray-500'}`}>
          {message.timestamp}
        </div>
        {message.via && (
          <div className={`text-xs ${isPeriskope ? 'text-indigo-200' : 'text-gray-400'}`}>
            via {message.via}
          </div>
        )}
      </div>
      
      {isPeriskope && (
        <div className="flex-shrink-0 ml-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm">
            P
          </div>
        </div>
      )}
    </div>
  );
}
