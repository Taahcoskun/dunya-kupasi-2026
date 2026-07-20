"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, User } from "lucide-react";

type UserType = {
  id: string;
  username: string;
  totalPoints: number;
  groupPoints: number;
  round32Points: number;
  round16Points: number;
  quarterFinalsPoints: number;
  semiFinalsPoints: number;
  finalPoints: number;
  extraPoints: number;
  exactHits: number;
  onePoints: number;
  totalPlayed: number;
};

export default function LeaderboardPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 60000); // 1 minute refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Animated Background */}
      <div className="bg-animate">
        <div className="bg-blob bg-blob-1"></div>
        <div className="bg-blob bg-blob-2"></div>
        <div className="bg-blob bg-blob-3"></div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl relative z-10">
        <div className="flex flex-col items-center mb-12 fade-in-up">
          <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/30 shadow-xl shadow-blue-500/10">
            <Trophy className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-center text-white mb-2 tracking-tight leading-tight">
            Genel <span className="text-gradient">Sıralama</span>
          </h1>
          <p className="text-gray-400 text-center font-medium opacity-80">
            Dünya Kupası 2026'nın en iyi tahmincileri.
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-24 fade-in-up delay-1">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="glass-dark rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden w-full fade-in-up delay-1">
            <div className="overflow-x-auto w-full scrollbar-hide">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 divide-x divide-white/10">
                    <th className="px-1 py-2 md:px-2 md:py-3 text-gray-400 font-bold uppercase text-[9px] md:text-xs tracking-wider md:tracking-widest w-8 md:w-16 text-center whitespace-nowrap">Sıra</th>
                    <th className="px-1 py-2 md:px-2 md:py-3 text-gray-400 font-bold uppercase text-[9px] md:text-xs tracking-wider md:tracking-widest whitespace-nowrap">Kullanıcı</th>
                    <th className="px-1 py-2 md:px-2 md:py-3 text-gray-400 font-bold uppercase text-[9px] md:text-xs tracking-wider md:tracking-widest text-center whitespace-nowrap">
                      <span className="hidden sm:inline">Tahmin</span>
                      <span className="sm:hidden">Tah</span>
                    </th>
                    <th className="px-1 py-2 md:px-2 md:py-3 text-gray-400 font-bold uppercase text-[9px] md:text-xs tracking-wider md:tracking-widest text-center whitespace-nowrap">
                      4P
                    </th>
                    <th className="px-1 py-2 md:px-2 md:py-3 text-gray-400 font-bold uppercase text-[9px] md:text-xs tracking-wider md:tracking-widest text-center whitespace-nowrap">
                      1P
                    </th>
                    <th className="px-1 py-2 md:px-2 md:py-3 text-gray-400 font-bold uppercase text-[9px] md:text-xs tracking-wider md:tracking-widest text-center whitespace-nowrap">
                      Grup
                    </th>
                    <th className="px-1 py-2 md:px-2 md:py-3 text-gray-400 font-bold uppercase text-[9px] md:text-xs tracking-wider md:tracking-widest text-center whitespace-nowrap">
                      <span className="hidden sm:inline">Son 16</span>
                      <span className="sm:hidden">S16</span>
                    </th>
                    <th className="px-1 py-2 md:px-2 md:py-3 text-gray-400 font-bold uppercase text-[9px] md:text-xs tracking-wider md:tracking-widest text-center whitespace-nowrap">
                      <span className="hidden sm:inline">Son 32</span>
                      <span className="sm:hidden">S32</span>
                    </th>
                    <th className="px-1 py-2 md:px-2 md:py-3 text-gray-400 font-bold uppercase text-[9px] md:text-xs tracking-wider md:tracking-widest text-center whitespace-nowrap">
                      <span className="hidden sm:inline">Çeyrek F.</span>
                      <span className="sm:hidden">ÇF</span>
                    </th>
                    <th className="px-1 py-2 md:px-2 md:py-3 text-gray-400 font-bold uppercase text-[9px] md:text-xs tracking-wider md:tracking-widest text-center whitespace-nowrap">
                      <span className="hidden sm:inline">Yarı F.</span>
                      <span className="sm:hidden">YF</span>
                    </th>
                    <th className="px-1 py-2 md:px-2 md:py-3 text-gray-400 font-bold uppercase text-[9px] md:text-xs tracking-wider md:tracking-widest text-center whitespace-nowrap">
                      <span className="hidden sm:inline">Final</span>
                      <span className="sm:hidden">F</span>
                    </th>
                    <th className="px-1 py-2 md:px-2 md:py-3 text-gray-400 font-bold uppercase text-[9px] md:text-xs tracking-wider md:tracking-widest text-center whitespace-nowrap">
                      Ekstra
                    </th>
                    <th className="px-1 py-2 md:px-2 md:py-3 text-gray-400 font-bold uppercase text-[9px] md:text-xs tracking-wider md:tracking-widest text-right w-16 md:w-32 whitespace-nowrap">
                      <span className="hidden sm:inline">Toplam</span>
                      <span className="sm:hidden">Top</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <tr 
                      key={user.id} 
                      className={`border-b border-white/5 divide-x divide-white/5 hover:bg-white/5 transition-all duration-300 group ${
                        idx === 0 ? "bg-yellow-500/5" : idx === 1 ? "bg-gray-400/5" : idx === 2 ? "bg-orange-500/5" : ""
                      }`}
                    >
                      <td className="px-1 py-2 md:px-2 md:py-3 text-center">
                        <div className="flex justify-center">
                          {idx === 0 && (
                            <div className="w-6 h-6 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30 shadow-lg shadow-yellow-500/10">
                              <Medal className="w-3.5 h-3.5 md:w-5 md:h-5 text-yellow-500" />
                            </div>
                          )}
                          {idx === 1 && (
                            <div className="w-6 h-6 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gray-400/20 flex items-center justify-center border border-gray-400/30">
                              <Medal className="w-3.5 h-3.5 md:w-5 md:h-5 text-gray-400" />
                            </div>
                          )}
                          {idx === 2 && (
                            <div className="w-6 h-6 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                              <Medal className="w-3.5 h-3.5 md:w-5 md:h-5 text-orange-500" />
                            </div>
                          )}
                          {idx > 2 && <span className="text-gray-500 font-black text-[10px] md:text-sm">{idx + 1}</span>}
                        </div>
                      </td>
                      <td className="px-1 py-2 md:px-2 md:py-3">
                        <div className="flex items-center gap-1.5 md:gap-3">
                          <div className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-gray-400 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-all shrink-0">
                            <User className="w-3 h-3 md:w-5 md:h-5" />
                          </div>
                          <span className="font-bold text-xs md:text-sm text-white group-hover:text-blue-400 transition-colors truncate max-w-[65px] sm:max-w-[100px] md:max-w-none">
                            {user.username}
                          </span>
                        </div>
                      </td>
                      <td className="px-1 py-2 md:px-2 md:py-3 text-center">
                        <span className="font-semibold text-gray-300 tabular-nums text-xs md:text-sm">
                          {user.totalPlayed}
                        </span>
                      </td>
                      <td className="px-1 py-2 md:px-2 md:py-3 text-center">
                        <div className="inline-flex items-center justify-center bg-green-500/10 px-1.5 md:px-3 py-0.5 md:py-1 rounded-md border border-green-500/20">
                          <span className="font-bold text-green-400 tabular-nums text-[10px] md:text-sm">
                            {user.exactHits}
                          </span>
                        </div>
                      </td>
                      <td className="px-1 py-2 md:px-2 md:py-3 text-center">
                        <div className="inline-flex items-center justify-center bg-blue-500/10 px-1.5 md:px-3 py-0.5 md:py-1 rounded-md border border-blue-500/20">
                          <span className="font-bold text-blue-400 tabular-nums text-[10px] md:text-sm">
                            {user.onePoints}
                          </span>
                        </div>
                      </td>
                      <td className="px-1 py-2 md:px-2 md:py-3 text-center">
                        <span className="font-semibold text-gray-300 tabular-nums text-xs md:text-sm">
                          {user.groupPoints}
                        </span>
                      </td>
                      <td className="px-1 py-2 md:px-2 md:py-3 text-center">
                        <span className="font-semibold text-gray-300 tabular-nums text-xs md:text-sm">
                          {user.round16Points}
                        </span>
                      </td>
                      <td className="px-1 py-2 md:px-2 md:py-3 text-center">
                        <span className="font-semibold text-gray-300 tabular-nums text-xs md:text-sm">
                          {user.round32Points}
                        </span>
                      </td>
                      <td className="px-1 py-2 md:px-2 md:py-3 text-center">
                        <span className="font-semibold text-gray-300 tabular-nums text-xs md:text-sm">
                          {user.quarterFinalsPoints}
                        </span>
                      </td>
                      <td className="px-1 py-2 md:px-2 md:py-3 text-center">
                        <span className="font-semibold text-gray-300 tabular-nums text-xs md:text-sm">
                          {user.semiFinalsPoints}
                        </span>
                      </td>
                      <td className="px-1 py-2 md:px-2 md:py-3 text-center">
                        <span className="font-semibold text-gray-300 tabular-nums text-xs md:text-sm">
                          {user.finalPoints}
                        </span>
                      </td>
                      <td className="px-1 py-2 md:px-2 md:py-3 text-center">
                        <span className="font-semibold text-pink-400 tabular-nums text-xs md:text-sm">
                          {user.extraPoints}
                        </span>
                      </td>
                      <td className="px-1 py-2 md:px-2 md:py-3 text-right">
                        <span className="font-black text-sm md:text-xl text-blue-400 tabular-nums">
                          {user.totalPoints}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={13} className="p-12 md:p-24 text-center text-gray-500">
                        <User className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-sm md:text-lg font-medium">Henüz tahminci bulunmuyor.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
