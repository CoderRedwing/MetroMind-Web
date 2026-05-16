import { useState, useCallback } from 'react';
import { metroApi } from '../services/api.js';

export function useChat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "🚇 Hey! I'm MetroMind, your DMRC guide. Tell me where you're going — like \"I'm at Anand Vihar and want to reach Preet Vihar\" — and I'll plan the best route for you!",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (text, context = null) => {
    const userMsg = { role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);

    try {
      const apiMessages = updated
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role, content: m.content }));

      const { reply, stationSuggestions } = await metroApi.chat(apiMessages, context);

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: reply, suggestions: stationSuggestions },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Connection error. Please make sure the server is running.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [messages]);

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "🚇 Hey! I'm MetroMind. Tell me your start and end location and I'll find the best route!",
      },
    ]);
  };

  return { messages, loading, sendMessage, clearChat };
}
