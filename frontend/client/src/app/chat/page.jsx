'use client';

import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { Smile } from 'lucide-react';
import Picker from 'emoji-picker-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import GifPicker from '../_components/GifPicker'; // update path if needed

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
const [showGifPicker, setShowGifPicker] = useState(false);


  const [status, setStatus] = useState(null);
  const [msg, setMsg] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [socket, setSocket] = useState(null);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const router = useRouter();
useEffect(() => {
  if (!authName) {
    toast.error("Connection Lost");
    router.replace('/login');
  }
}, [authName]);

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
    withCredentials:true,
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
<div className="flex h-screen items-center justify-center bg-[#D9DBD5] font-sans">
  <div className="flex w-[90%] max-w-6xl h-[90%] bg-white shadow-xl rounded-2xl overflow-hidden">
    <ChatUsers />

    <div className="w-full flex-1 flex flex-col">
      {chatReceive && chatReceive !== authName ? (
        <>
          {/* ✅ Top Bar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#F0F2F5] shadow-sm">
            <div className="flex items-center gap-3">
              <img src="/user.png" alt="avatar" className="w-10 h-10 rounded-full" />
              <div className="text-black">
                <p className="font-semibold text-lg flex items-center">{chatReceive}</p>
                <p className="text-xs text-gray-500">last seen recently</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-gray-500">
              <svg onClick={handleLogout} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 cursor-pointer text-gray-500 hover:text-gray-700 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
          </div>
          
          {/* ✅ Messages */}
          <div className="flex-1 px-8 py-6 overflow-y-auto space-y-4 custom-scrollbar bg-[url('/whatsapp_bg.png')] bg-cover">
            {chatMsgs.map((msg, index) => (
              <div key={index} className={`flex flex-col ${msg.sender === authName ? 'items-end' : 'items-start'} animate-fade-in`}>
                <div className={`max-w-[70%] px-3 py-2 text-sm shadow-sm relative transition-transform duration-200 ease-in-out ${
                  msg.sender === authName
                    ? 'bg-[#73a942] text-white rounded-tr-xl rounded-tl-xl rounded-bl-xl ml-auto hover:scale-105'
                    : 'bg-white text-black rounded-tl-xl rounded-tr-xl rounded-br-xl mr-auto hover:scale-105'
                }`}>
                  {msg.isGif || msg.text.includes("giphy.com/media") ? (
                    <img
                      src={msg.text}
                      alt="GIF"
                      className="max-w-xs rounded-md"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <p>{msg.text}</p>
                  )}
                </div>
                <div className="mt-1">
                  <span className="text-xs text-gray-500">{msg.time}</span>
                </div>
              </div>
            ))}

            {/* ✅ Typing Indicator */}
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

          {/* ✅ Typing Box */}
          <div className="p-4 bg-[#F0F2F5] border-t border-gray-200">
            <form onSubmit={sendMsg} className="relative flex items-center gap-2 bg-white rounded-full px-4 py-3">
              <button type="button" onClick={() => setShowGifPicker((prev) => !prev)} className="hover:text-gray-700 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <input
                type="text"
                value={msg}
                onChange={handleTyping}
                placeholder="Type a message"
                required
                className="flex-1 bg-transparent placeholder-gray-500 focus:outline-none text-black"
              />
              <div className="flex items-center gap-2 text-gray-500">
                <button type="button" onClick={() => setShowEmojiPicker((prev) => !prev)} className="hover:text-gray-700 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <button type="submit">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-500 hover:text-gray-700">
                    <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
                  </svg>
                </button>
              </div>
              {showGifPicker && (
                  <div className="absolute bottom-16 left-12 z-50">
                      <GifPicker
                          onGifSelect={(gifUrl) => {
                              const gifMsg = {
                                  text: gifUrl,
                                  sender: authName,
                                  receiver: chatReceive,
                                  time: dayjs().format('h:mm A'),
                                  isGif: true,
                              };
                              socket.emit('chat msg', gifMsg);
                              updateChatMsgs((prev) => [...prev, gifMsg]);
                              setShowGifPicker(false);
                          }}
                      />
                  </div>
              )}
              {showEmojiPicker && (
                  <div className="absolute bottom-16 right-4 z-50">
                      <Picker
                          theme="light"
                          onEmojiClick={(emojiData) =>
                              setMsg((prev) => prev + emojiData.emoji)
                          }
                      />
                  </div>
              )}
            </form>
          </div>
        </>
      ) : (
        <div className="w-full flex-1 flex flex-col items-center justify-center bg-[#F0F2F5] text-center px-6">
          <img
            src="https://img.icons8.com/?size=100&id=aCfAk9QBX2mZ&format=png&color=D1D5DB"
            alt="Start chatting"
            className="w-24 h-24 mb-6 animate-float"
          />
          <h2 className="text-black text-2xl font-semibold mb-2">No Conversation Selected</h2>
          <p className="text-gray-500 text-sm">Click on a user from the left to start chatting 💬</p>
        </div>
      )}
    </div>
  </div>
</div>  );
};
export default Chat;
