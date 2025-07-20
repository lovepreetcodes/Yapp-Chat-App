import { create } from "zustand";

export const userAuthStore = create((set)=>({
authName: '',
updateAuthName: (name)=> set({authName:name})
}))