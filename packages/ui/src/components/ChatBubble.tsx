import type { ReactNode } from 'react';

interface ChatBubbleProps {
  position: 'start' | 'end';
  pending?: boolean;
  timestamp?: string;
  children: ReactNode;
}

export function ChatBubble({ position, pending = false, timestamp, children }: ChatBubbleProps) {
  const isOwn = position === 'end';

  return (
    <div className={`flex flex-col max-w-[85%] ${isOwn ? 'self-end' : 'self-start'}`}>
      <div
        className={`chat-bubble text-[0.8125rem] leading-[1.4] break-words ${
          isOwn
            ? 'bg-primary text-primary-content rounded-br-sm'
            : 'bg-base-200 text-base-content rounded-bl-sm'
        } ${pending ? 'opacity-60' : ''}`}
      >
        {children}
      </div>
      {timestamp && (
        <time
          className={`text-[0.625rem] text-base-content/35 mt-0.5 ${isOwn ? 'text-right' : ''}`}
        >
          {timestamp}
        </time>
      )}
    </div>
  );
}
