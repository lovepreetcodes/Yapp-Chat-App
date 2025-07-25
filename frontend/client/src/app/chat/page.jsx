'use client';

import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { Smile } from 'lucide-react';
import Picker from 'emoji-picker-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

// Zustand stores
import { userAuthStore } from '../zustand/useAuthStore';
import { useChatReceiverStore } from '../zustand/useChatReceiver';
import { useUsersStore } from '../zustand/useUserStore';
import { useChatMsgsStore } from '../zustand/useChatMsgsStore';

// UI components
import ChatUsers from '../_components/ChatUsers';

const Chat = () => {
  const { authName } = userAuthStore();
  const { chatReceive } = useChatReceiverStore();
  const { updateUsers } = useUsersStore();
  const { chatMsgs, updateChatMsgs } = useChatMsgsStore();
  const messagesEndRef = useRef(null);
const chatReceiveRef = useRef(chatReceive);

  const [status, setStatus] = useState(null);
  const [msg, setMsg] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [socket, setSocket] = useState(null);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      if (data.message === "Logged out successfully") {
        router.replace('/login');
        toast.success("Successfully logged out");
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const getUserData = async () => {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_AUTH_API}/users`, {
      withCredentials: true,
    });
    updateUsers(res.data);
  };

  useEffect(() => {
  const newSocket = io(process.env.NEXT_PUBLIC_CHAT_API, {
    query: { username: authName },
  });
  setSocket(newSocket);

  // ✅ Message receiver
  newSocket.on('chat msg', (msgrecv) => {
    updateChatMsgs((prevMsgs) => [...prevMsgs, msgrecv]);
    if (msgrecv.sender !== authName) {
      toast.success(` ${msgrecv.sender} "${msgrecv.text}"`);
      const audio = new Audio('/ding.mp3');
      audio.play();
    }
  });

  // ✅ Typing listener
  newSocket.on('user_typing', ({ sender }) => {
    if (sender === chatReceiveRef.current) {
      setIsTyping(true);
    }
  });

  newSocket.on('user_stopped_typing', ({ sender }) => {
    if (sender === chatReceiveRef.current) {
      setIsTyping(false);
    }
  });

  getUserData(); // Fetch users

  return () => {
    newSocket.disconnect(); // Clean up
  };
}, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMsgs]);
useEffect(() => {
  chatReceiveRef.current = chatReceive;
}, [chatReceive]);
  
const handleTyping = (e) => {
  setMsg(e.target.value);

  if (socket && chatReceive) {
    socket.emit("typing", { sender: authName, receiver: chatReceive });

    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => {
      socket.emit("stop_typing", { sender: authName, receiver: chatReceive });
    }, 1500);

    setTypingTimeout(timeout);
  }
};
  const sendMsg = (e) => {
    e.preventDefault();
    const msgToBeSent = {
      text: msg,
      sender: authName,
      receiver: chatReceive,
      time: dayjs().format('h:mm A'),
    };

    if (socket) {
      socket.emit('chat msg', msgToBeSent);
      updateChatMsgs((prevMsgs) => [...prevMsgs, msgToBeSent]);
      setMsg('');
    }
  };

  return (
  <div className="flex justify-center items-center min-h-screen bg-[#1e1e1e] px-2 sm:px-0">
  <div className="flex flex-col sm:flex-row w-full sm:w-[90%] max-w-6xl h-[95vh] sm:h-[90%] border border-[#333] shadow-[0_4px_50px_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden">

    {/* Sidebar */}
    <div className="w-full sm:w-1/5 bg-[#2D2C35] p-3 border-[#2D2C35] sm:border-r shadow-[6px_0_15px_rgba(0,0,0,0.4)] z-10">
      <ChatUsers />
    </div>

    {/* Chat Section */}
    <div className="w-full flex-1 flex flex-col bg-[#2A2B33ff] max-h-full">

      {/* Header */}
      <div className="flex items-center justify-between shadow-[2px_0_15px_rgba(0,0,0,0.4)] p-3 sm:p-4 border-b border-[#212529] bg-[#2C2A30] shadow-2xl">
        <div className="flex items-center gap-3 overflow-hidden">
          <img src="/user.png" alt="avatar" className="w-10 h-10 rounded-full shrink-0" />
          <p className="text-white font-semibold text-base sm:text-lg truncate">{chatReceive}</p>
        </div>
        <img
          onClick={handleLogout}
          src="/logout.png"
          alt="logout"
          className="w-7 h-7 sm:w-8 sm:h-8 cursor-pointer mr-2 sm:mr-5"
        />
      </div>

      {/* Messages */}
      <div className="flex-1 px-3 py-4 sm:py-6 overflow-y-auto space-y-3 custom-scrollbar">
        {chatMsgs.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === authName ? 'justify-end' : 'justify-start'}`}>
            <div className="flex items-end gap-1">
              <div className={`max-w-[85%] sm:max-w-sm px-4 py-2 text-sm shadow ${
                msg.sender === authName
                  ? 'bg-[#A43224ff] text-white rounded-l-lg rounded-tr-lg'
                  : 'bg-[#202027] text-white-200 rounded-r-lg rounded-tl-lg'
              }`}>
                {msg.text}
              </div>
              {msg.sentByCurrUser && (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
              <span className="text-xs text-gray-400 mt-1 block text-right">{msg.time}</span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start ml-6 mb-2">
            <div className="flex space-x-2">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="h-auto min-h-[70px] mt-2 px-2 sm:mb-6 sm:ml-5 sm:mr-5 flex items-center bg-[#1f1f1f] shadow-[0_8px_24px_rgba(0,0,0,0.2)] border border-[#2a2a2a] rounded-xl">
        <form onSubmit={sendMsg} className="flex w-full items-center gap-2 sm:gap-3 py-2 px-2 flex-wrap sm:flex-nowrap">
          {/* Add Button */}
          <button type="button" className="p-2 rounded-full hover:bg-[#2d2d2d] transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Input */}
          <input
            type="text"
            value={msg}
            onChange={handleTyping}
            placeholder="Message..."
            required
            className="flex-1 px-4 py-2 sm:py-3 text-sm text-white bg-[#1f1f1f] placeholder-gray-400 rounded-lg border border-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#444] transition-all min-w-[120px]"
          />

          {/* Emoji Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="hover:text-white transition"
            >
              <img
                src="https://img.icons8.com/?size=30&id=676&format=png&color=FFFFFF"
                alt="emoji"
                className="w-6 h-6 mt-1"
              />
            </button>

            {showEmojiPicker && (
              <div className="absolute bottom-12 right-0 z-50 max-w-[250px] sm:max-w-none">
                <Picker
                  theme="dark"
                  onEmojiClick={(emojiData) =>
                    setMsg((prev) => prev + emojiData.emoji)
                  }
                />
              </div>
            )}
          </div>

          {/* Send Button */}
          <button type="submit" className="p-3 bg-[#A43224] hover:bg-[#e76f51] rounded-full shadow-lg transition">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
              <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  </div>
</div>
  )}
export default Chat;
