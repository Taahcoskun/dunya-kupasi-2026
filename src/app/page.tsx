"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getFlagUrl } from "@/lib/teams";
import { Timer, Trophy, ArrowRight, Circle } from "lucide-react";

type Match = {
  id: string;
  teamHome: string;
  teamAway: string;
  kickoffTime: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
};

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [filter, setFilter] = useState<"ALL" | "SCHEDULED" | "LIVE" | "FINISHED">("ALL");
  const router = useRouter();

  const fetchMatches = async () => {
    const res = await fetch("/api/matches");
    const data = await res.json();
    setMatches(data);
  };

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const [activeTab, setActiveTab] = useState<"TODAY" | "WEEK1" | "WEEK2" | "WEEK3" | "ALL">("ALL");
  const filteredByTab = matches.filter(m => {
    if (activeTab === "TODAY") {
      const d = new Date(m.kickoffTime);
      return d >= todayStart && d <= todayEnd;
    }
    if (activeTab === "WEEK1") {
      const d = new Date(m.kickoffTime);
      // Round 1 matches (June 11 - June 18 morning)
      return d >= new Date("2026-06-11") && d <= new Date("2026-06-18T10:00:00Z");
    }
    if (activeTab === "WEEK2") {
      const d = new Date(m.kickoffTime);
      // Round 2 matches (June 18 afternoon - June 24 morning)
      return d >= new Date("2026-06-18T11:00:00Z") && d <= new Date("2026-06-24T12:00:00Z");
    }
    if (activeTab === "WEEK3") {
      const d = new Date(m.kickoffTime);
      // Round 3 matches (June 24 afternoon - June 28)
      return d >= new Date("2026-06-24T13:00:00Z") && d <= new Date("2026-06-29");
    }
    return true;
  });

  const finalMatches = filteredByTab.filter((m) => filter === "ALL" || m.status === filter);

  const filterLabels = {
    "ALL": "HEPSİ",
    "SCHEDULED": "GELECEK",
    "LIVE": "CANLI",
    "FINISHED": "BİTEN"
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center mb-12">
        <h1 className="text-5xl font-black text-center text-white mb-4 tracking-tight">
          Geyiğin Nirvanası Grubu <span className="text-gradient">Dünya Kupası Özel</span>
        </h1>
        <p className="text-gray-400 text-center max-w-lg">
          Onursal Kral 1.Mehmet tarafından yapılmıştır.
        </p>
      </div>

      {/* Weekly Tabs */}
      <div className="flex justify-center mb-8">
        <div className="flex gap-4 p-1 bg-white/5 rounded-2xl border border-white/10">
          {[
            { id: "TODAY", label: "BUGÜN" },
            { id: "WEEK1", label: "1. HAFTA" },
            { id: "WEEK2", label: "2. HAFTA" },
            { id: "WEEK3", label: "3. HAFTA" },
            { id: "ALL", label: "TÜMÜ" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${
                activeTab === tab.id 
                  ? "bg-white/10 text-white shadow-xl" 
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center mb-12">
        <div className="bg-white/5 p-1.5 rounded-2xl flex gap-1 border border-white/10 glass shadow-xl">
          {["ALL", "SCHEDULED", "LIVE", "FINISHED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                filter === f 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {filterLabels[f as keyof typeof filterLabels]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {finalMatches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
        {finalMatches.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-24 glass rounded-[2rem] border border-white/5 mt-8">
            <Trophy className="w-12 h-12 text-gray-700 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Bu kategoride maç bulunamadı.</p>
            <button onClick={() => {setFilter("ALL"); setActiveTab("ALL")}} className="text-blue-500 hover:underline mt-2 font-bold">Tüm maçları göster</button>
          </div>
        )}
      </div>
    </div>
  );
}

function MatchCard({ match }: { match: Match }) {
  return (
    <Link href={`/match/${match.id}`} className="group">
      <div className="glass-dark rounded-[2rem] p-1 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10 border border-white/5 group-hover:border-blue-500/30">
        <div className="bg-gray-900/50 rounded-[1.8rem] p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
              <Timer className="w-3.5 h-3.5" />
              {new Date(match.kickoffTime).toLocaleDateString('tr-TR', { weekday: 'short', month: 'short', day: 'numeric' })}
              <span className="text-white/20">•</span>
              {new Date(match.kickoffTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </div>
            
            {match.status === "LIVE" && (
              <div className="bg-red-500/10 text-red-500 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-red-500/20 animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                CANLI
              </div>
            )}
            {match.status === "FINISHED" && (
              <div className="bg-gray-500/10 text-gray-400 text-[10px] font-black px-2.5 py-1 rounded-full border border-white/10">
                BİTTİ
              </div>
            )}
            {match.status === "SCHEDULED" && (
              <div className="bg-blue-500/10 text-blue-400 text-[10px] font-black px-2.5 py-1 rounded-full border border-blue-500/10">
                GELECEK
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center px-2 mb-8">
            <div className="flex flex-col items-center w-28 gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full group-hover:bg-blue-500/40 transition-all"></div>
                <div className="relative w-20 h-20 bg-gray-800 rounded-full p-1 border-2 border-white/10 group-hover:border-blue-500/50 transition-all overflow-hidden shadow-2xl">
                  <img 
                    src={getFlagUrl(match.teamHome)} 
                    alt={match.teamHome} 
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
              <span className="font-bold text-sm text-center line-clamp-1 group-hover:text-blue-400 transition-colors">{match.teamHome}</span>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <div className="text-4xl font-black tabular-nums tracking-tighter text-white">
                {(match.status === "SCHEDULED" && match.homeScore === null) ? (
                  <span className="text-gray-700 text-2xl uppercase">vs</span>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className={(match.homeScore ?? 0) > (match.awayScore ?? 0) ? "text-blue-400" : ""}>{match.homeScore ?? 0}</span>
                    <span className="text-white/10">-</span>
                    <span className={(match.awayScore ?? 0) > (match.homeScore ?? 0) ? "text-blue-400" : ""}>{match.awayScore ?? 0}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center w-28 gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full group-hover:bg-blue-500/40 transition-all"></div>
                <div className="relative w-20 h-20 bg-gray-800 rounded-full p-1 border-2 border-white/10 group-hover:border-blue-500/50 transition-all overflow-hidden shadow-2xl">
                  <img 
                    src={getFlagUrl(match.teamAway)} 
                    alt={match.teamAway} 
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
              <span className="font-bold text-sm text-center line-clamp-1 group-hover:text-blue-400 transition-colors">{match.teamAway}</span>
            </div>
          </div>
          
          <div className="mt-auto pt-6 flex justify-center">
            <div className="flex items-center gap-2 text-blue-400 group-hover:text-white group-hover:bg-blue-600 px-6 py-2 rounded-full text-[10px] font-black transition-all border border-blue-500/20 group-hover:border-blue-600 shadow-lg shadow-blue-500/5 tracking-widest">
              DETAY & TAHMİN
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
