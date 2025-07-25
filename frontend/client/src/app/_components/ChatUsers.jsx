import { useChatReceiverStore } from "../zustand/useChatReceiver";
import { useUsersStore } from "../zustand/useUserStore";
import { userAuthStore } from "../zustand/useAuthStore";
import { useChatMsgsStore } from "../zustand/useChatMsgsStore";
import React, { useState,useEffect } from "react";
import axios from "axios";

function ChatUsers() {
  const [search,setSearchTerm] = useState('')
  const { updateChatReceive ,chatReceive} = useChatReceiverStore();
  const { users } = useUsersStore();
  const {authName} = userAuthStore()
  const [selectedUser, setSelectedUser] = useState(null);
    const { updateChatMsgs} = useChatMsgsStore();
  const [lastmsg,updateLastMsg] = useState('')
  function setChatReceiver(user) {
    updateChatReceive(user.username);
    setSelectedUser(user.username); // ✅ using username instead of user.id
  }
  function findUser(e){
    e.preventDefault()



  }
 useEffect(() => {
       const getMsgs = async () => {
           const res = await axios.get(`${process.env.NEXT_PUBLIC_CHAT_API}/msgs`, {
  params: {
    sender: authName,
    receiver: chatReceive,
  },
  withCredentials: true, // ✅ This now works
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`, // ✅ If your backend expects JWT
  },
});
           if (res.data.length !== 0) {
               updateChatMsgs(res.data);
               updateLastMsg(res.data.name)
           } else {
               updateChatMsgs([]);
           }
       }
       if(chatReceive) {
           getMsgs();
       }
   }, [chatReceive])
  return (
<div className="w-1/5 bg-[#2D2C35] p-3 border-[#2D2C35] shadow-[6px_0_15px_rgba(0,0,0,0.4)] z-10">
  <div className="flex items-center shadow-[6px_0_15px_rgba(0,0,0,0.6)] mb-3 justify-between px-4 py-3 border-[#202027]">
    {/* Avatar + Name + Online */}
    <div className="flex items-center gap-3 border-white ">
      <img
        src="/user.png"
        alt="User avatar"
        className="w-10 h-10 rounded-full"
      />
      <div>
        <p className="text-white font-medium">{authName}</p>
        <p className="text-xs text-zinc-400">Online</p>
      </div>
    </div>

    {/* Green Dot on Far Right */}
    <span className="h-2.5 w-2.5 bg-green-500 rounded-full animate-pulse"></span>
  </div>
 <div className="relative w-full max-w-xs mb-4">
  <input
    type="text"
    placeholder="Search users..."
    value={search}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#1f1f1f] text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#444] transition-all duration-200"
  />
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
    />
  </svg>
</div>


  {users
    .filter((user) => user.username !== authName &&
  user.username.toLowerCase().includes(search.toLowerCase()))
    .map((user, index) => (
      <div
        key={index}
        className="flex items-center  gap-3 mb-3 rounded cursor-pointer transition"
        style={{
          backgroundColor:
            selectedUser === user.username ? "#202027" : "transparent",
          padding: "12px",
          borderRadius: "8px",
        }}
        onClick={() => setChatReceiver(user)}
      >
        <img
          src="/user.png"
          alt="avatar"
          className="w-10 h-10 rounded-full"
        />
        <div className="text-white">
          <p className="font-medium">{user.username}</p>
          <p className="text-xs text-gray-400">{user.name}</p>
        </div>
      </div>
    ))}
</div>

  )}

export default ChatUsers;
