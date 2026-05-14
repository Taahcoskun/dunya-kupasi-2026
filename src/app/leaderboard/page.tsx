"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, User } from "lucide-react";

type UserType = {
  id: string;
  username: string;
  totalPoints: number;
  week1Points: number;
  week2Points: number;
  week3Points: number;
  exactHits: number;
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
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex flex-col items-center mb-12">
        <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/30 shadow-xl shadow-blue-500/10">
          <Trophy className="w-8 h-8 text-blue-400" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-center text-white mb-2 tracking-tight leading-tight">
          Genel <span className="text-gradient">Sıralama</span>
        </h1>
        <p className="text-gray-400 text-center">
          Dünya Kupası 2026'nın en iyi tahmincileri.
        </p>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="glass-dark rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden w-full">
          <div className="overflow-x-auto w-full scrollbar-hide">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="p-4 md:p-6 text-gray-400 font-bold uppercase text-xs tracking-widest w-16 md:w-24 text-center whitespace-nowrap">Sıra</th>
                  <th className="p-4 md:p-6 text-gray-400 font-bold uppercase text-xs tracking-widest whitespace-nowrap">Kullanıcı</th>
                  <th className="p-4 md:p-6 text-gray-400 font-bold uppercase text-xs tracking-widest text-center whitespace-nowrap hidden sm:table-cell">1. Hafta</th>
                  <th className="p-4 md:p-6 text-gray-400 font-bold uppercase text-xs tracking-widest text-center whitespace-nowrap hidden sm:table-cell">2. Hafta</th>
                  <th className="p-4 md:p-6 text-gray-400 font-bold uppercase text-xs tracking-widest text-center whitespace-nowrap hidden sm:table-cell">3. Hafta</th>
                  <th className="p-4 md:p-6 text-gray-400 font-bold uppercase text-xs tracking-widest text-center whitespace-nowrap">Tahmin</th>
                  <th className="p-4 md:p-6 text-gray-400 font-bold uppercase text-xs tracking-widest text-center whitespace-nowrap">Birebir Skor</th>
                  <th className="p-4 md:p-6 text-gray-400 font-bold uppercase text-xs tracking-widest text-right w-24 md:w-32 whitespace-nowrap">Toplam</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr 
                    key={user.id} 
                    className={`border-b border-white/5 hover:bg-white/5 transition-all duration-300 group ${
                      idx === 0 ? "bg-yellow-500/5" : idx === 1 ? "bg-gray-400/5" : idx === 2 ? "bg-orange-500/5" : ""
                    }`}
                  >
                    <td className="p-4 md:p-6 text-center">
                      <div className="flex justify-center">
                        {idx === 0 && (
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30 shadow-lg shadow-yellow-500/10">
                            <Medal className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
                          </div>
                        )}
                        {idx === 1 && (
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gray-400/20 flex items-center justify-center border border-gray-400/30">
                            <Medal className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                          </div>
                        )}
                        {idx === 2 && (
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                            <Medal className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                          </div>
                        )}
                        {idx > 2 && <span className="text-gray-500 font-black text-base md:text-lg">{idx + 1}</span>}
                      </div>
                    </td>
                    <td className="p-4 md:p-6">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-gray-400 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-all">
                          <User className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <span className="font-bold text-sm md:text-base text-white group-hover:text-blue-400 transition-colors">
                          {user.username}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 md:p-6 text-center hidden sm:table-cell">
                      <span className="font-semibold text-gray-300 tabular-nums">
                        {user.week1Points}
                      </span>
                    </td>
                    <td className="p-4 md:p-6 text-center hidden sm:table-cell">
                      <span className="font-semibold text-gray-300 tabular-nums">
                        {user.week2Points}
                      </span>
                    </td>
                    <td className="p-4 md:p-6 text-center hidden sm:table-cell">
                      <span className="font-semibold text-gray-300 tabular-nums">
                        {user.week3Points}
                      </span>
                    </td>
                    <td className="p-4 md:p-6 text-center">
                      <span className="font-semibold text-gray-300 tabular-nums">
                        {user.totalPlayed}
                      </span>
                    </td>
                    <td className="p-4 md:p-6 text-center">
                      <div className="inline-flex items-center justify-center bg-green-500/10 px-3 py-1 rounded-md border border-green-500/20">
                        <span className="font-bold text-green-400 tabular-nums">
                          {user.exactHits}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 md:p-6 text-right">
                      <span className="font-black text-lg md:text-xl text-blue-400 tabular-nums">
                        {user.totalPoints}
                      </span>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-12 md:p-24 text-center text-gray-500">
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
  );
}
