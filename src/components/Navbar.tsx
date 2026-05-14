"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Trophy, Calendar, LayoutDashboard, LogOut, LogIn, UserPlus, Users, Star } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="glass sticky top-0 z-50 py-3 px-6 shadow-2xl mb-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-blue-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform shadow-lg shadow-blue-500/20">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <span className="hidden sm:inline text-xl font-black tracking-tight text-white group-hover:text-blue-400 transition-colors">
            Dünya Kupası <span className="text-blue-500">2026</span>
          </span>
        </Link>
        
        <div className="flex gap-1 md:gap-2 items-center">
          <Link href="/" className="flex items-center gap-2 px-2 md:px-4 py-2 rounded-xl hover:bg-white/5 transition-all text-gray-300 hover:text-white font-medium">
            <Calendar className="w-5 h-5 md:w-4 md:h-4" />
            <span className="hidden md:inline">Fikstür</span>
          </Link>
          <Link href="/standings" className="flex items-center gap-2 px-2 md:px-4 py-2 rounded-xl hover:bg-white/5 transition-all text-gray-300 hover:text-white font-medium">
            <Users className="w-5 h-5 md:w-4 md:h-4" />
            <span className="hidden md:inline">Puan Durumu</span>
          </Link>
          <Link href="/leaderboard" className="flex items-center gap-2 px-2 md:px-4 py-2 rounded-xl hover:bg-white/5 transition-all text-gray-300 hover:text-white font-medium">
            <LayoutDashboard className="w-5 h-5 md:w-4 md:h-4" />
            <span className="hidden md:inline">Liderlik Tablosu</span>
          </Link>
          <Link href="/extra" className="flex items-center gap-2 px-2 md:px-4 py-2 rounded-xl hover:bg-white/5 transition-all text-gray-300 hover:text-white font-medium">
            <Star className="w-5 h-5 md:w-4 md:h-4 text-purple-400" />
            <span className="hidden lg:inline">Ekstra Tahminler</span>
          </Link>
          
          <div className="hidden sm:block h-6 w-px bg-white/10 mx-1 md:mx-2" />

          {session ? (
            <div className="flex gap-2 items-center ml-1 md:ml-2">
              <div className="hidden lg:flex flex-col items-end mr-1">
                <span className="text-xs text-gray-400 font-medium">Tekrar hoş geldin,</span>
                <span className="text-sm font-bold text-white leading-tight">{session.user?.name}</span>
              </div>
              <button 
                onClick={() => signOut()}
                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-3 md:px-4 py-2 rounded-xl text-sm font-semibold transition-all border border-red-500/20 hover:border-red-500 shadow-lg shadow-red-500/5"
              >
                <LogOut className="w-5 h-5 md:w-4 md:h-4" />
                <span className="hidden md:inline">Çıkış Yap</span>
              </button>
            </div>
          ) : (
            <div className="flex gap-2 ml-1 md:ml-2">
              <Link href="/login" className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl hover:bg-white/5 text-white text-sm font-semibold transition-all">
                <LogIn className="w-5 h-5 md:w-4 md:h-4" />
                <span className="hidden md:inline">Giriş Yap</span>
              </Link>
              <Link href="/register" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 md:px-5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/30 border border-blue-400/20">
                <UserPlus className="w-5 h-5 md:w-4 md:h-4" />
                <span className="hidden md:inline">Kayıt Ol</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
