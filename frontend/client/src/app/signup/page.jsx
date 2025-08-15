
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
 <div className="min-h-screen flex items-center justify-center bg-[#D9DBD5] relative px-4 sm:px-6 py-6">
  {/* Background gradient blobs */}
  <div className="absolute w-60 h-60 sm:w-80 sm:h-80 bg-[#128C7E] opacity-20 blur-3xl rounded-full top-10 left-10"></div>
  <div className="absolute w-72 h-72 sm:w-96 sm:h-96 bg-[#075E54] opacity-10 blur-2xl rounded-full bottom-0 right-0"></div>

  {/* Signup Box */}
  <div className="bg-white/80 backdrop-blur-md text-black w-full max-w-sm sm:max-w-md p-6 sm:p-10 rounded-2xl shadow-2xl z-10">
    <form className="space-y-6">
      {/* Header with App Name and Icon */}
      <div className="flex flex-col items-center gap-2 mb-6">
        <div className="flex items-center gap-3">
          <img
            src="/whatsapp-logo.png"
            alt="Yapp logo"
            className="w-10 h-10"
          />
          <h2 className="text-3xl font-bold tracking-wide">Yapp</h2>
        </div>
        <p className="text-gray-500 text-sm">Create your new account</p>
      </div>

      {/* Username / Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Username / Phone</label>
        <input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username or number"
          className="w-full bg-gray-100/60 text-black px-4 py-3 rounded-xl border border-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#73a942] transition-all duration-150 text-sm sm:text-base"
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Enter your password"
          className="w-full bg-gray-100/60 text-black px-4 py-3 rounded-xl border border-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#73a942] transition-all duration-150 text-sm sm:text-base"
        />
      </div>

      {/* Sign Up Button */}
      <button
        onClick={signUpFunc}
        type="submit"
        className="w-full bg-[#55a630] text-white py-3 rounded-xl font-semibold hover:bg-[#2b9348] transition duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
      >
        Sign Up
      </button>
    </form>

    {/* Already have an account */}
    <p className="text-center text-sm text-gray-600 mt-6">
      Already have an account?
      <a onClick={login} href="#" className="text-[#55a630] hover:underline ml-1">Log in</a>
    </p>
  </div>
</div>


)
}
export default Auth