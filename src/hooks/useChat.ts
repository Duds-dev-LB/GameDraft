import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage } from '@/types';
import { validateChatMessage } from '@/utils/validators';

interface UseChatResult {
  messages: ChatMessage[];
  inputValue: string;
  setInputValue: (val: string) => void;
  handleSend: () => Promise<void>;
  isOpen: boolean;
  toggleChat: () => void;
  unreadCount: number;
}

export function useChat(messages: ChatMessage[], sendMessage: (msg: string) => Promise<void>): UseChatResult {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const prevMessagesLength = useRef(messages.length);

  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      if (!isOpen) {
        setUnreadCount(prev => prev + (messages.length - prevMessagesLength.current));
      }
    }
    prevMessagesLength.current = messages.length;
  }, [messages.length, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (validateChatMessage(trimmed)) {
      try {
        await sendMessage(trimmed);
        setInputValue('');
      } catch (error) {
        console.error('Failed to send message', error);
      }
    }
  }, [inputValue, sendMessage]);

  return {
    messages,
    inputValue,
    setInputValue,
    handleSend,
    isOpen,
    toggleChat,
    unreadCount
  };
}
