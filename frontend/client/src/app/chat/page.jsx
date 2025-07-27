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
 <div className="flex h-screen items-center justify-center bg-[#e76f51] font-sans shadow-[0_4px_50px_rgba(0,0,0,0.3)]">
  <div className="flex w-[90%] max-w-6xl h-[90%] border border-[#333] shadow-[0_4px_50px_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden">
    
    <ChatUsers />

    <div className="w-full flex-1 flex flex-col bg-[#2A2B33ff]">

      {chatReceive ? (
        <>
          {/* ✅ Top Bar (avatar + username + logout) */}
          <div className="flex items-center justify-between shadow-[2px_0_15px_rgba(0,0,0,0.4)] p-4 border-b border-[#212529] bg-[#2C2A30] shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <img src="/user.png" alt="avatar" className="w-10 h-10 rounded-full" />
              <div className="text-white">
                <p className="font-semibold text-lg flex items-center">{chatReceive}</p>
              </div>
            </div>
            <img onClick={handleLogout} src="/logout.png" alt="logout" className="w-8 h-8 mr-5 cursor-pointer" />
          </div>
{/* ✅ Messages */}
<div className="flex-1 px-3 py-6 overflow-y-auto space-y-3 custom-scrollbar">
  {chatMsgs.map((msg, index) => (
    <div key={index} className={`flex ${msg.sender === authName ? 'justify-end' : 'justify-start'}`}>
      <div className="flex items-end gap-1">
        
        {/* ✅ Conditionally render GIF or Text */}
        <div className={`max-w-sm px-2 py-2 text-sm shadow ${
          msg.sender === authName
            ? 'bg-[#A43224ff] text-white rounded-l-lg rounded-tr-lg'
            : 'bg-[#202027] text-white rounded-r-lg rounded-tl-lg'
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

        {/* ✅ Sent status icon */}
        {msg.sentByCurrUser && (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        )}

        {/* ✅ Timestamp */}
        <span className="text-xs text-gray-400 mt-1 block text-right">{msg.time}</span>
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
          <div className="h-[70px] mb-6 ml-5 mr-5 flex items-center px-3 py-2 bg-[#1f1f1f] shadow-[0_8px_24px_rgba(0,0,0,0.2)] border border-[#2a2a2a] rounded-xl">
            <form onSubmit={sendMsg} className="flex w-full items-center gap-3">
              <button
  type="button"
  onClick={() => setShowGifPicker((prev) => !prev)}
  className="p-2 rounded-full hover:bg-[#2d2d2d] transition"
>
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
</button>
{showGifPicker && (
  <div className="relative">
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


              <input
                type="text"
                value={msg}
                onChange={handleTyping}
                placeholder="Message..."
                required
                className="flex-1 px-4 py-3 text-sm text-white bg-[#1f1f1f] placeholder-gray-400 rounded-lg border border-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#444] transition-all"
              />

              <div className="flex items-center gap-3 text-gray-400 relative">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    className="hover:text-white transition"
                  >
                    <img
                      src="https://img.icons8.com/?size=30&id=676&format=png&color=FFFFFF"
                      alt="emoji"
                      className="mt-1"
                    />
                  </button>

                  {showEmojiPicker && (
                    <div className="absolute bottom-12 right-0 z-50">
                      <Picker
                        theme="dark"
                        onEmojiClick={(emojiData) =>
                          setMsg((prev) => prev + emojiData.emoji)
                        }
                      />
                    </div>
                  )}

                </div>
              </div>

              <button type="submit" className="p-4 bg-[#A43224] hover:bg-[#e76f51] rounded-full shadow-lg transition">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                  <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
                </svg>
                
              </button>
            </form>
          </div>
        </>
      ) : (
 <div className="w-full flex-1 flex flex-col items-center justify-center bg-[#2A2B33ff] text-center px-6">
  <img
    src="https://img.icons8.com/?size=100&id=aCfAk9QBX2mZ&format=png&color=FFFFFF"
    alt="Start chatting"
    className="w-24 h-24 mb-6 animate-float"
  />
  <h2 className="text-white text-2xl font-semibold mb-2">No Conversation Selected</h2>
  <p className="text-gray-400 text-sm">Click on a user from the left to start chatting 💬</p>
</div>


      )}
    </div>
  </div>
</div>

  );
};
export default Chat;
