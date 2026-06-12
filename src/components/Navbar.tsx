"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Trophy, Calendar, LayoutDashboard, LogOut, LogIn, UserPlus, Users, Star } from "lucide-react";

const WorldCupLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C9.5 2 7.5 4 7.5 6.5c0 1.2.5 2.3 1.3 3.1-.4 1.1-.8 2.4-.8 3.9 0 3 2 4.5 2 4.5V20H8v2h8v-2h-2v-2s2-1.5 2-4.5c0-1.5-.4-2.8-.8-3.9.8-.8 1.3-1.9 1.3-3.1C16.5 4 14.5 2 12 2zm0 2c1.4 0 2.5 1.1 2.5 2.5S13.4 7 12 7 9.5 5.9 9.5 4.5 10.6 4 12 4z" />
  </svg>
);

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <nav className="glass sticky top-0 z-50 py-3 px-3 md:px-6 shadow-2xl mb-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="bg-blue-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform shadow-lg shadow-blue-500/20">
            <WorldCupLogo className="w-6 h-6 text-white drop-shadow-md" />
          </div>
          <span className="hidden sm:inline text-xl font-black tracking-tight text-white group-hover:text-blue-400 transition-colors">
            Dünya Kupası <span className="text-blue-500">2026</span>
          </span>
        </Link>
        
        <div className="flex gap-1 md:gap-2 items-center bg-black/20 p-1 md:p-1.5 rounded-2xl border border-white/5">
          <Link href="/" className={`flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-xl transition-all duration-300 ${pathname === "/" ? "bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]" : "text-gray-400 hover:text-white hover:bg-white/5 font-medium border border-transparent"}`}>
            <Calendar className={`w-4 h-4 md:w-4 md:h-4 ${pathname === "/" ? "text-blue-400" : ""}`} />
            <span className="hidden md:inline">Fikstür</span>
          </Link>
          <Link href="/leaderboard" className={`flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-xl transition-all duration-300 ${pathname === "/leaderboard" ? "bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]" : "text-gray-400 hover:text-white hover:bg-white/5 font-medium border border-transparent"}`}>
            <LayoutDashboard className={`w-4 h-4 md:w-4 md:h-4 ${pathname === "/leaderboard" ? "text-blue-400" : ""}`} />
            <span className="hidden md:inline">Liderlik</span>
          </Link>
          <Link href="/predictions" className={`flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-xl transition-all duration-300 ${pathname === "/predictions" ? "bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]" : "text-gray-400 hover:text-white hover:bg-white/5 font-medium border border-transparent"}`}>
            <Users className={`w-4 h-4 md:w-4 md:h-4 ${pathname === "/predictions" ? "text-blue-400" : ""}`} />
            <span className="hidden md:inline">Tahminler</span>
          </Link>
          <Link href="/extra" className={`flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-xl transition-all duration-300 ${pathname === "/extra" ? "bg-purple-500/20 text-purple-400 font-bold border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]" : "text-gray-400 hover:text-white hover:bg-white/5 font-medium border border-transparent"}`}>
            <Star className={`w-4 h-4 md:w-4 md:h-4 ${pathname === "/extra" ? "text-purple-400 fill-purple-400" : "text-purple-400/70"}`} />
            <span className="hidden lg:inline">Ekstra</span>
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
                className="flex items-center gap-1 md:gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-2 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-semibold transition-all border border-red-500/20 hover:border-red-500 shadow-lg shadow-red-500/5"
              >
                <LogOut className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>Çıkış Yap</span>
              </button>
            </div>
          ) : (
            <div className="flex gap-1 md:gap-2 ml-1 md:ml-2">
              <Link href="/login" className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-xl hover:bg-white/5 text-white text-xs md:text-sm font-semibold transition-all">
                <LogIn className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>Giriş Yap</span>
              </Link>
              <Link href="/register" className="flex items-center gap-1 md:gap-2 bg-blue-600 hover:bg-blue-500 text-white px-2 md:px-5 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-bold transition-all shadow-lg shadow-blue-500/30 border border-blue-400/20">
                <UserPlus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>Kayıt Ol</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
