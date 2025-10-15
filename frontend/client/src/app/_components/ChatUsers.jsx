import { useChatReceiverStore } from "../zustand/useChatReceiver";
import { useUsersStore } from "../zustand/useUserStore";
import { userAuthStore } from "../zustand/useAuthStore";
import { useChatMsgsStore } from "../zustand/useChatMsgsStore";
import React, { useState, useEffect } from "react";
import axios from "axios";

function ChatUsers() {
  const [search, setSearchTerm] = useState("");
  const { updateChatReceive, chatReceive } = useChatReceiverStore();
  const { users } = useUsersStore();
  const { authName } = userAuthStore();
  const [selectedUser, setSelectedUser] = useState(null);
  const { updateChatMsgs } = useChatMsgsStore();

  function setChatReceiver(user) {
    updateChatReceive(user.username);
    setSelectedUser(user.username);
  }

  useEffect(() => {
    const getMsgs = async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_CHAT_API}/msgs`, {
        params: { sender: authName, receiver: chatReceive },
        withCredentials: true,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.length !== 0) {
        updateChatMsgs(res.data);
      } else {
        updateChatMsgs([]);
      }
    };
    if (chatReceive) getMsgs();
  }, [chatReceive]);

  return (
    <div className="w-1/3 sm:w-[350px] bg-black/40 backdrop-blur-xl text-white p-3 border-r border-white/10 sm:h-full overflow-y-auto z-20 custom-scrollbar">
      {/* Top Section - User Profile */}
      <div className="flex items-center justify-between px-4 py-3 mb-6">
        <div className="flex items-center gap-3">
          <img src="/user.png" alt="User avatar" className="w-12 h-12 rounded-full" />
          <div>
            <p className="text-white font-medium text-lg">{authName}</p>
            <p className="text-sm text-[#d7263d] flex items-center gap-1">
              <span className="h-2.5 w-2.5 bg-[#d7263d] rounded-full animate-pulse"></span>
              Online
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative px-4 mb-4">
        <input
          type="text"
          placeholder="Search chat or contact..."
          value={search}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/30 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
        />
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-7 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
        </svg>
      </div>

      {/* User List */}
      <div className="space-y-1">
        {users
          .filter(
            (user) =>
              user.username !== authName &&
              user.username.toLowerCase().includes(search.toLowerCase())
          )
          .map((user, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 cursor-pointer transition px-4 py-3 rounded-xl ${
                selectedUser === user.username
                  ? "bg-white/20 backdrop-blur-md"
                  : "hover:bg-white/10"
              }`}
              onClick={() => setChatReceiver(user)}
            >
              <img src="/user.png" alt="avatar" className="w-12 h-12 rounded-full" />
              <div className="flex-1">
                <p className="font-medium text-white">{user.username}</p>
                <p className="text-sm text-gray-400">
                  {user.lastMessage || 'Start a conversation'}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-gray-400">{user.lastMessageTime || '14:49'}</span>
                {user.unreadCount && (
                  <span className="bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {user.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default ChatUsers;
