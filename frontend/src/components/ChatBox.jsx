import { useState, useRef, useEffect } from "react";
import axios from "axios";

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm here to help with questions about our website, products, and services. How can I assist you today?",
      sender: "agent",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    // Add user message
    const newUserMessage = { text: message, sender: "user" };
    setMessages([...messages, newUserMessage]);

    // Clear input and set loading
    setMessage("");
    setIsLoading(true);

    try {
      // Call backend API
      const response = await axios.post(
        "http://localhost:8000/api/chat/message",
        {
          messages: messages.concat(newUserMessage),
        }
      );

      // Add response from API
      setMessages((prev) => [...prev, response.data]);
    } catch (error) {
      console.error("Error getting chat response:", error);
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, I encountered an error processing your question about our website. Please try again later.",
          sender: "agent",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-3 right-3 z-50">
      {/* Chat toggle button */}
      <button
        onClick={toggleChat}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg focus:outline-none"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
      </button>

      {/* Chat box */}
      {isOpen && (
        <div className="absolute bottom-12 right-0 w-72 bg-white rounded-lg shadow-xl overflow-hidden flex flex-col transition-all duration-300 ease-in-out transform h-[350px]">
          {/* Header */}
          <div className="bg-blue-600 text-white p-2 flex justify-between items-center">
            <h3 className="font-medium text-sm">Website Support Chat</h3>
            <button
              onClick={toggleChat}
              className="text-white focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Messages - fixed height with scrollbar */}
          <div className="flex-1 p-3 overflow-y-auto h-[250px] space-y-2 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs p-2 text-sm rounded-lg ${
                    msg.sender === "user"
                      ? "bg-blue-100 text-blue-900"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-2 rounded-lg text-gray-800">
                  <span className="flex items-center">
                    <span className="animate-pulse mr-1">●</span>
                    <span className="animate-pulse mx-1 delay-75">●</span>
                    <span className="animate-pulse ml-1 delay-150">●</span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} /> {/* Empty div for scroll reference */}
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="border-t p-2 flex">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 border rounded-l-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !message.trim()}
              className={`${
                isLoading || !message.trim()
                  ? "bg-blue-400"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white px-3 py-1 rounded-r-lg focus:outline-none transition-colors`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
