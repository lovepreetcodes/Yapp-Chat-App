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
 <div className="min-h-screen flex items-center justify-center bg-[#D9DBD5] relative px-4 sm:px-6 py-6">
  {/* Background blur effect */}
  <div className="absolute w-full h-full bg-cover bg-center" style={{ backgroundImage: 'url("/blurry_bg.png")', filter: 'blur(8px)' }}></div>

  {/* Login Box */}
  <div className="bg-white/80 backdrop-blur-md text-black w-full max-w-sm sm:max-w-md shadow-2xl p-6 sm:p-10 rounded-2xl z-10 flex flex-col items-center">
    
    {/* Title */}
    <div className="flex items-center gap-3">
          <img
            src="/whatsapp-logo.png"
            alt="Yapp logo"
            className="w-10 h-10"
          />
          <h2 className="text-3xl font-bold tracking-wide">Yapp</h2>
        </div>

    <form className="space-y-6 w-full">
      {/* Username */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Username / Phone</label>
        <input
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          placeholder="Enter your username or number"
          className="w-full bg-gray-100/60 text-black px-4 py-3 rounded-xl border border-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#55a630] transition-all duration-150 text-sm sm:text-base"
        />
      </div>

      {/* Password */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <input
          onChange={(e) => setpassword(e.target.value)}
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          className="w-full bg-gray-100/60 text-black px-4 py-3 pr-12 rounded-xl border border-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#55a630] transition-all duration-150 text-sm sm:text-base"
        />
       <span>
 <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 top-8 right-4 flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          {showPassword ? "Hide" : "Show"}
        </button>

       </span>
      </div>

      {/* Login Button */}
      <button
        onClick={submit}
        type="submit"
        className="w-full bg-[#55a630] text-white py-3 rounded-xl font-semibold hover:bg-[#2b9348] transition duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
      >
        Log In
      </button>
    </form>

    {/* Signup Link */}
    <p className="text-center text-sm text-gray-600 mt-6">
      Don’t have an account?
      <a onClick={Register} href="#" className="text-[#55a630] hover:underline ml-1">Sign up</a>
    </p>
  </div>
</div>



  )
}
export default Login