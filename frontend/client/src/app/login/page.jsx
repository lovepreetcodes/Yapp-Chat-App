'use client';
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { userAuthStore } from "../zustand/useAuthStore";

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { authName, updateAuthName } = userAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const Register = () => {
    router.replace('/signup');
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_AUTH_API}/auth/login`,
        { username: username.trim(), password: password.trim() },
        { withCredentials: true }
      );

      localStorage.setItem("token", res.data.token);

      if (res.data?.message === "Login Successful") {
        toast.success(`Welcome ${username}`);
        updateAuthName(username);
        router.replace('/chat');
      } else {
        console.log(res.data?.message || "Unexpected response");
      }
    } catch (error) {
      if (error.response) {
        toast.error("Invalid credentials");
      } else {
        console.log("Login error:", error.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative px-4 sm:px-6 py-6 font-sans">
      
      {/* Background Gradient & Grain */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-[#d7263d]/30 to-red-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-tl from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/gplay.png')] opacity-5"></div>
      </div>

      {/* Glassmorphic Login Card */}
      <div className="bg-black/40 backdrop-blur-xl text-white w-full max-w-sm shadow-2xl p-8 rounded-2xl z-10 border border-white/10">
        
        {/* Logo & Title */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <img src="/whatsapp-logo.png" alt="Yapp logo" className="w-10 h-10" />
          <h2 className="text-3xl font-bold tracking-wider">Yapp</h2>
        </div>

        <form className="space-y-6 w-full" onSubmit={submit}>
          
          {/* Username Input */}
          <div>
            <label className="sr-only">Username / Phone</label>
            <input
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              type="text"
              placeholder="Username / Phone"
              className="w-full bg-white/5 text-white px-4 py-3 rounded-lg border border-transparent placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#d7263d] transition-all duration-200"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <label className="sr-only">Password</label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full bg-white/5 text-white px-4 py-3 pr-12 rounded-lg border border-transparent placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#d7263d] transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-[#d7263d] transition-colors"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.563 3.029m0 0l-2.187-2.187" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#d7263d] to-red-600 text-white py-3 rounded-lg font-semibold transform hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-[#d7263d]/50"
          >
            Log In
          </button>
        </form>

        {/* Signup Link */}
        <p className="text-center text-sm text-gray-400 mt-8">
          Don’t have an account?
          <a onClick={Register} href="#" className="text-[#d7263d] hover:underline ml-1 font-semibold">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
