'use client';

import React, { useState, useEffect,useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { Smile } from 'lucide-react';
import Picker from 'emoji-picker-react';
import toast from 'react-hot-toast';
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


  const [msg, setMsg] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [socket, setSocket] = useState(null);

const handleLogout = async () => {
  try {
    await fetch("http://localhost:5000/logout", {
      method: "POST",
      credentials: "include", // Send the cookie
    });

    window.location.href = "/login"; // or use navigate("/login")
  } catch (err) {
    console.error("Logout failed:", err);
  }
};



  // Fetch users list from backend
  const getUserData = async () => {
    const res = await axios.get('http://localhost:5000/users', {
      withCredentials: true,
    });
    updateUsers(res.data);
  };

  // Set up socket connection and listener
  useEffect(() => {
    const newSocket = io('http://localhost:8080', {
      query: { username: authName },
    });
    setSocket(newSocket);

    // Listener for receiving a message from server
    newSocket.on('chat msg', (msgrecv) => {
      // ✅ Append new message without overwriting old ones
      updateChatMsgs((prevMsgs) => [...prevMsgs, msgrecv]);
      if (msgrecv.sender !== authName) {
      toast.success(` ${msgrecv.sender} "${msgrecv.text}"`);

      // ✅ Play sound
      const audio = new Audio('/ding.mp3');
      audio.play();}
    });

    // Fetch users on mount
    getUserData();

    return () => newSocket.close(); // Cleanup
  }, []);
  
  useEffect(() => {
    // Scroll to the bottom whenever chatMsgs changes
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMsgs]);

  // Emit message to server and update local UI
  const sendMsg = (e) => {
    e.preventDefault();
    const msgToBeSent = {
      text: msg,
      sender: authName,
      receiver: chatReceive,
    };

    if (socket) {
      socket.emit('chat msg', msgToBeSent);
      // ✅ Append sent message locally
      updateChatMsgs((prevMsgs) => [...prevMsgs, msgToBeSent]);
      setMsg('');
    }
  };

  return (
<div className="flex h-screen items-center  justify-center bg-[#e76f51] font-sans shadow-[0_4px_50px_rgba(0,0,0,0.3)]">
  <div className="flex w-[90%] max-w-6xl h-[90%] border border-[#333] shadow-[0_4px_50px_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden">

    {/* Sidebar – User List */}
    <ChatUsers />

    {/* Main Chat Area */}
    
    <div className="  w-full flex-1 flex flex-col bg-[#2A2B33ff]">

      {/* Chat Header */}
      
      <div className="flex items-center justify-between shadow-[2px_0_15px_rgba(0,0,0,0.4)] p-4 border-b border-[#212529] bg-[#2C2A30] shadow-2xl">
        <div className="flex items-center justify-between gap-3  ">
          <img
            src="/user.png"
            alt="avatar"
            className="w-10 h-10 rounded-full "
          />
          
          <div className="text-white ">
            <p className="font-semibold text-lg  flex items-center ">
              {chatReceive}
        
            </p>
          </div>
       
        </div>
 <img onClick={handleLogout}
            src="/logout.png"
            alt="avatar"
            className="w-10 h-10 cursor-pointer
"
          />
      
      </div>

      {/* Messages */}
       <div className="flex-1 px-3 py-6 overflow-y-auto space-y-3 custom-scrollbar">
      {chatMsgs.map((msg, index) => (
        <div
          key={index}
          className={`flex ${msg.sender === authName ? 'justify-end' : 'justify-start'}`}
        >
          <div className="flex items-end gap-1">
            <div
              className={`max-w-sm px-6 py-2 text-sm shadow ${
                msg.sender === authName
                  ? 'bg-[#A43224ff] text-white rounded-l-lg rounded-tr-lg'
                  : 'bg-[#202027] text-white-200 rounded-r-lg rounded-tl-lg'
              }`}
            >
              {msg.text}
            </div>
            {msg.sentByCurrUser && (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
          </div>
        </div>
      ))}

      {/* 🔽 Auto-scroll target div */}
      <div ref={messagesEndRef} />
    </div>

      {/* Typing Box */}
{/* Typing Box */}
<div className="h-[70px] mb-6 ml-5 mr-5 flex items-center px-2 py-2 bg-[#24272B] shadow-[0_12px_30px_rgba(0,0,0,0.3)]  border-t border-[#24272B]">
  <form onSubmit={sendMsg} className="flex w-full items-center gap-4">

    {/* Input Box with Elevated Look */}
    <input
      type="text"
      value={msg}
      onChange={(e) => setMsg(e.target.value)}
      placeholder="Message..."
      required
      className="flex-1 px-4 py-3 text-sm text-white bg-[#24272B] placeholder-white/60  focus:outline-none focus:ring-0 transition-shadow"
    />

    {/* Emoji Picker */}
    <div className="flex items-center gap-4 text-gray-400 relative">
      <div className="relative">
        
        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="hover:text-white transition"
        >
          <img src="https://img.icons8.com/?size=30&id=676&format=png&color=FFFFFF" alt="" srcset="" className='mt-2' />
        </button>

        {showEmojiPicker && (
          <div className="absolute bottom-10 right-0 z-50">
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

    {/* Send Button */}
    <button
      type="submit"
      className="p-3 bg-[#A43224] hover:bg-[#e76f51] rounded-full shadow-lg transition"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
        <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
      </svg>
    </button>

  </form>
</div>
</div>
</div></div>
  )
}

export default Chat;
