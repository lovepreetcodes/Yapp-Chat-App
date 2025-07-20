import { create } from "zustand";
export  const useChatReceiverStore = create((set) =>({
chatReceive : '',
updateChatReceive:(chatReceive)=> set({chatReceive:chatReceive})
}))