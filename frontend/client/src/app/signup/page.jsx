
  "use client"
import axios from "axios";
import { useState } from "react";
import React from 'react'
import { useRouter } from 'next/navigation'
import { userAuthStore } from "../zustand/useAuthStore";
import toast from 'react-hot-toast';


const Auth = () => {
   
  

const { authName, updateAuthName } = userAuthStore()
   const [username, setUsername] = useState('');
   const [password, setPassword] = useState('');
   const [name,setName] = useState('')
  const router = useRouter()
   const signUpFunc = async (event) => {
     
       event.preventDefault();

      console.log("control has reached")
       try {
           const res = await axios.post(`${process.env.NEXT_PUBLIC_AUTH_API}/auth/signup`, {
               username: username,
               password: password,
               
           },
           {
               withCredentials: true
           })

           console.log("data uploaded")
           if(res.data.message === "Username already exists") {
              toast.warn("Account already Exist");
              
           }
      
           else{
            updateAuthName(username)
            toast.success(`Account Created succesfully`)
            router.replace('/chat')
           } 
           
       } catch (error) {
           console.log("Error in signup function : ", error.message);
       }
   }
const login = ()=>{
  router.replace("/login")
}
 return (
 <div className="min-h-screen flex items-center justify-center bg-black relative px-4">
  {/* Background gradient blobs */}
 

  <div className="absolute w-80 h-80 bg-[#bb3e03] opacity-20 blur-3xl rounded-full top-10 left-10"></div>
  <div className="absolute w-96 h-96 bg-[#bb3e03] opacity-10 blur-2xl rounded-full bottom-0 right-0"></div>
 
  {/* Signup Box */}
  <div className="bg-zinc-900/90 backdrop-blur-lg text-white w-full max-w-md p-10 rounded-2xl shadow-2xl border border-zinc-800 z-10">
   
    <form className="space-y-6">
      {/* Avatar Upload (Static for now) */}
      <div className="flex flex-col items-center gap-2">
        
        <h2 className="text-3xl font-bold mb-8 text-center tracking-wide">Create Account</h2>
      </div>

      {/* Username / Phone */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Username / Phone</label>
        <input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username or number"
          className="w-full bg-zinc-800/60 text-white px-4 py-3 rounded-xl border border-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#bb3e03] transition-all duration-150"
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Enter your password"
          className="w-full bg-zinc-800/60 text-white px-4 py-3 rounded-xl border border-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#bb3e03] transition-all duration-150"
        />
      </div>

      
      {/* Sign Up Button */}
      <button
        onClick={signUpFunc}
        type="submit"
        className="w-full bg-[#bb3e03] text-white py-3 rounded-xl font-semibold hover:bg-[#e76f51] transition duration-200 shadow-md hover:shadow-lg"
      >
        Sign Up
      </button>
    </form>

    {/* Already have an account */}
    <p className="text-center text-sm text-zinc-400 mt-6">
      Already have an account?
      <a onClick={login} href="#" className="text-[#bb3e03] hover:underline ml-1">Log in</a>
    </p>
  </div>
</div>


)
}
export default Auth