
import {create} from 'zustand';

export const useChatMsgsStore = create( (set) => ({
   chatMsgs: [],
  updateChatMsgs: (updater) =>
    set((state) => ({
      chatMsgs: typeof updater === 'function' ? updater(state.chatMsgs) : updater,
    })),
}));
