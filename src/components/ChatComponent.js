import React, { useState, useCallback, useRef, useEffect } from 'react';
import '../styles/ChatComponent.css';
import ReactMarkdown from 'react-markdown';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/chat';

const ChatComponent = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const deleteChat = useCallback(async () => {
    if (conversationId) {
      try {
        const response = await fetch(`${API_URL}/conversation/${conversationId}`, {
          method: 'DELETE',
          credentials: 'include', 
        });
        if (!response.ok) {
          throw new Error('Failed to delete conversation');
        }
        setMessages([]);
        setError(null);
        setConversationId(null);
      } catch (err) {
        console.error('Error deleting conversation:', err);
        setError('Failed to delete conversation. Please try again.');
      }
    } else {
      setMessages([]);
      setError(null);
    }
  }, [conversationId]);


  const sendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setError(null);

    const newMessage = { text: input, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    try {
      console.log('Sending request to:', API_URL);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input, conversationId }),
      });

      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: data.reply, sender: 'bot' },
      ]);
      setConversationId(data.conversationId);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`An error occurred while fetching the response. Please try again. (${err.message})`);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  }, [input, conversationId]);

  useEffect(() => {
    const cleanup = async () => {
      if (conversationId) {
        try {
          await fetch(`${API_URL}/conversation/${conversationId}`, {
            method: 'DELETE',
            credentials: 'include',
          });
        } catch (err) {
          console.error('Error during cleanup:', err);
        }
      }
    };

    const handleBeforeUnload = (event) => {
      cleanup();
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanup();
    };
  }, [conversationId]);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Industrial Startup Chatbot</h2>
        <button onClick={deleteChat} className="delete-chat-btn">Delete Chat</button>
      </div>
      <div className="messages-container">
        <i align='left'><text  >To be tested by E-cell's finest is an honour!</text></i>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.sender}`}
          >
            {message.sender === 'bot' ? (
              <ReactMarkdown>{message.text}</ReactMarkdown>
            ) : (
              message.text
            )}
          </div>
        ))}
        {isLoading && <div className="loading">Loading...</div>}
        {error && <div className="error">{error}</div>}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about industrial startups..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatComponent;