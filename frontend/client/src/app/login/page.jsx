'use client';
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { use, useReducer } from 'react'
import { useState } from 'react'
import toast from 'react-hot-toast';
import { userAuthStore } from "../zustand/useAuthStore";
function Login() {
  
const [username,setUsername] = useState('')
const [password,setpassword] = useState('')
const {authName,updateAuthName} =  userAuthStore()
const [showPassword, setShowPassword] = useState(false);
 const router = useRouter()
const Register = ()=>{
  router.replace('/signup')
}
const submit = async(event)=>{
  event.preventDefault();
try {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_AUTH_API}/auth/login`, {
      username: username.trim(),
      password: password.trim(),
    },  { withCredentials: true  }
    );
localStorage.setItem("token", res.data.token);
if (res.data?.message === "Login Successful") {
   toast.success(`Welcome ${username}`);
  updateAuthName(username)
  router.replace('/chat')
  // redirect or do something
} else {
  console.log(res.data?.message || "Unexpected response");
  
}

  } catch (error) {
    if (error.response) {
     toast.error("Invalid credentials"); // 404 or 401 message
    } else {
      console.log("Login error:", error.message);
    }
  }

       
   }


  return (
    
<div className="min-h-screen flex items-center justify-center bg-black relative px-4 sm:px-6 py-6">
  {/* Background gradient blobs */}
  <div className="absolute w-60 h-60 sm:w-80 sm:h-80 bg-orange-700 opacity-20 blur-3xl rounded-full top-10 left-10"></div>
  <div className="absolute w-72 h-72 sm:w-96 sm:h-96 bg-orange-500 opacity-10 blur-2xl rounded-full bottom-0 right-0"></div>

  {/* Login Box (with logo inside) */}
  <div className="bg-zinc-900/90 backdrop-blur-lg text-white w-full max-w-sm sm:max-w-md shadow-2xl p-6 sm:p-10 rounded-2xl border border-zinc-800 z-10 flex flex-col items-center">
    
    {/* Logo (smaller, centered at top) */}
    <div className="mb-6">
      <img
        src="/sign.png"
        alt="Whispr Logo"
        className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-md"
      />
    </div>

    <form className="space-y-6 w-full">
      {/* Username */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">Username / Phone</label>
        <input
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          placeholder="Enter your username or number"
          className="w-full bg-zinc-800/60 text-white px-4 py-3 rounded-xl border border-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#bb3e03] transition-all duration-150 text-sm sm:text-base"
        />
      </div>

      {/* Password */}
      <div className="relative">
        <input
          onChange={(e) => setpassword(e.target.value)}
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          className="w-full bg-zinc-800/60 text-white px-4 py-3 pr-12 rounded-xl border border-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#bb3e03] transition-all duration-150 text-sm sm:text-base"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-3 flex items-center text-xs sm:text-sm text-zinc-400 hover:text-white"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      {/* Login Button */}
      <button
        onClick={submit}
        type="submit"
        className="w-full bg-[#bb3e03] text-white py-3 rounded-xl font-semibold hover:bg-[#e76f51] transition duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
      >
        Log In
      </button>
    </form>

    {/* Signup Link */}
    <p className="text-center text-sm text-zinc-400 mt-6">
      Don’t have an account?
      <a onClick={Register} href="#" className="text-[#bb3e03] hover:underline ml-1">Sign up</a>
    </p>
  </div>
</div>



  )
}
export default Login