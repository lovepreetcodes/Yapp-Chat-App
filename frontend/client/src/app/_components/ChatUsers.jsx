import { useChatReceiverStore } from "../zustand/useChatReceiver";
import { useUsersStore } from "../zustand/useUserStore";
import { userAuthStore } from "../zustand/useAuthStore";
import { useChatMsgsStore } from "../zustand/useChatMsgsStore";
import React, { useState,useEffect } from "react";
import axios from "axios";

function ChatUsers() {
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
 useEffect(() => {
       const getMsgs = async () => {
           const res = await axios.get('http://localhost:8080/msgs',
               {
                   params: {
                       'sender': authName,
                       'receiver': chatReceive
                   }
               },
               {
                   withCredentials: true
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
<h1 className="m-2">Chats</h1>
  {users
    .filter((user) => user.username !== authName)
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
