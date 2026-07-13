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
  userPrediction?: {
    predictedHomeScore: number;
    predictedAwayScore: number;
    pointsAwarded: number | null;
  } | null;
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

  const [activeTab, setActiveTab] = useState<"TODAY" | "WEEK1" | "WEEK2" | "WEEK3" | "ROUND32" | "ROUND16" | "QUARTERFINALS" | "SEMIFINALS" | "ALL">("SEMIFINALS");
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
      // Round 3 matches (June 24 afternoon - June 28 morning)
      return d >= new Date("2026-06-24T13:00:00Z") && d <= new Date("2026-06-28T10:00:00Z");
    }
    if (activeTab === "ROUND32") {
      const d = new Date(m.kickoffTime);
      // Round of 32 matches (June 28 afternoon - July 4 morning)
      return d >= new Date("2026-06-28T10:00:00Z") && d <= new Date("2026-07-04T10:00:00Z");
    }
    if (activeTab === "ROUND16") {
      const d = new Date(m.kickoffTime);
      // Round of 16 matches (July 4 afternoon - July 8)
      return d >= new Date("2026-07-04T10:00:00Z") && d <= new Date("2026-07-08");
    }
    if (activeTab === "QUARTERFINALS") {
      const d = new Date(m.kickoffTime);
      // Quarter Finals matches (July 9 - July 12)
      return d >= new Date("2026-07-09T00:00:00Z") && d <= new Date("2026-07-12T23:59:59Z");
    }
    if (activeTab === "SEMIFINALS") {
      const d = new Date(m.kickoffTime);
      // Semi Finals matches (July 14 - July 15)
      return d >= new Date("2026-07-13T00:00:00Z") && d <= new Date("2026-07-15T23:59:59Z");
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
    <div className="relative min-h-screen">
      {/* Animated Background */}
      <div className="bg-animate">
        <div className="bg-blob bg-blob-1"></div>
        <div className="bg-blob bg-blob-2"></div>
        <div className="bg-blob bg-blob-3"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="flex flex-col items-center mb-12 fade-in-up">
          <h1 className="text-3xl md:text-6xl font-black text-center text-white mb-6 tracking-tight leading-tight">
            Geyiğin Nirvanası Grubu <br className="hidden md:block" />
            <span className="text-gradient">Dünya Kupası Özel</span>
          </h1>
          <div className="h-1 w-24 bg-blue-600 rounded-full mb-6"></div>
          <p className="text-gray-400 text-center max-w-lg font-medium italic opacity-80">
            Onursal Kral 1.Mehmet tarafından yapılmıştır.
          </p>
        </div>

        {/* Weekly Tabs */}
        <div className="flex justify-center mb-8 w-full fade-in-up delay-1">
          <div className="flex gap-2 md:gap-4 p-1.5 bg-black/40 rounded-2xl border border-white/5 overflow-x-auto w-full md:w-auto scrollbar-hide backdrop-blur-md">
            {[
              { id: "TODAY", label: "BUGÜN" },
              { id: "SEMIFINALS", label: "YARI FİNAL" },
              { id: "QUARTERFINALS", label: "ÇEYREK FİNAL" },
              { id: "ROUND16", label: "SON 16" },
              { id: "ROUND32", label: "SON 32" },
              { id: "WEEK1", label: "1. HAFTA" },
              { id: "WEEK2", label: "2. HAFTA" },
              { id: "WEEK3", label: "3. HAFTA" },
              { id: "ALL", label: "TÜMÜ" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 md:px-8 py-2 md:py-3 rounded-xl text-xs md:text-sm font-black transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]" 
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex justify-center mb-12 w-full fade-in-up delay-2">
          <div className="bg-black/40 p-1.5 rounded-2xl flex gap-1 border border-white/5 backdrop-blur-md shadow-2xl overflow-x-auto w-full md:w-auto scrollbar-hide">
            {["ALL", "SCHEDULED", "LIVE", "FINISHED"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-black transition-all duration-300 whitespace-nowrap border border-transparent ${
                  filter === f 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 border-blue-400/20 scale-105" 
                    : "text-gray-500 hover:text-white hover:bg-white/5"
                }`}
              >
                {filterLabels[f as keyof typeof filterLabels]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 fade-in-up delay-3">
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
    </div>
  );
}

function MatchCard({ match }: { match: Match }) {
  return (
    <Link href={`/match/${match.id}`} className="group relative">
      <div className="glass-dark rounded-[2rem] p-1 transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_20px_50px_rgba(59,130,246,0.15)] border border-white/5 group-hover:border-blue-500/30 overflow-hidden">
        <div className="bg-gray-900/50 rounded-[1.8rem] p-5 md:p-6 h-full flex flex-col relative z-10 transition-all duration-500 group-hover:bg-gray-900/20">
          
          {/* Prediction Overlay on Hover (Desktop Only) */}
          {match.userPrediction && (
            <div className="absolute inset-0 hidden md:flex flex-col items-center justify-center bg-blue-600/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 rounded-[1.8rem] p-6 text-white translate-y-4 group-hover:translate-y-0">
              <Trophy className="w-10 h-10 mb-3 text-white drop-shadow-lg" />
              <p className="text-xs font-black tracking-widest uppercase mb-1 opacity-80">Senin Tahminin</p>
              <div className="text-4xl font-black mb-4 tabular-nums">
                {match.userPrediction.predictedHomeScore} - {match.userPrediction.predictedAwayScore}
              </div>
              <div className="h-px w-12 bg-white/30 mb-4"></div>
              {match.status === "FINISHED" ? (
                <div className="flex flex-col items-center">
                  <p className="text-[10px] font-black tracking-[0.2em] uppercase opacity-70 mb-1">Kazanılan Puan</p>
                  <span className="text-2xl font-black bg-white text-blue-600 px-4 py-1 rounded-full shadow-lg">
                    {match.userPrediction.pointsAwarded ?? 0} PUAN
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full border border-white/10">
                  <Timer className="w-4 h-4 text-white" />
                  <span className="text-[10px] font-bold tracking-wider">MAÇ SONUCU BEKLENİYOR</span>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center mb-6 md:mb-8">
            <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">
              <Timer className="w-3.5 h-3.5" />
              {new Date(match.kickoffTime).toLocaleDateString('tr-TR', { weekday: 'short', month: 'short', day: 'numeric' })}
              <span className="text-white/20">•</span>
              {new Date(match.kickoffTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </div>
            
            {match.status === "LIVE" && (
              <div className="bg-red-500/10 text-red-500 text-[9px] md:text-[10px] font-black px-2 md:px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-red-500/20 animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                CANLI
              </div>
            )}
            {match.status === "FINISHED" && (
              <div className="bg-gray-500/10 text-gray-400 text-[9px] md:text-[10px] font-black px-2 md:px-2.5 py-1 rounded-full border border-white/10">
                BİTTİ
              </div>
            )}
            {match.status === "SCHEDULED" && (
              <div className="bg-blue-500/10 text-blue-400 text-[9px] md:text-[10px] font-black px-2 md:px-2.5 py-1 rounded-full border border-blue-500/10">
                GELECEK
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center px-1 md:px-2 mb-6 md:mb-8">
            <div className="flex flex-col items-center w-20 md:w-28 gap-2 md:gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full group-hover:bg-blue-500/40 transition-all"></div>
                <div className="relative w-14 h-14 md:w-20 md:h-20 bg-gray-800 rounded-full p-1 border-2 border-white/10 group-hover:border-blue-500/50 transition-all overflow-hidden shadow-2xl">
                  <img 
                    src={getFlagUrl(match.teamHome)} 
                    alt={match.teamHome} 
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
              <span className="font-bold text-[10px] md:text-sm text-center line-clamp-2 group-hover:text-blue-400 transition-colors leading-tight">{match.teamHome}</span>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <div className="text-2xl md:text-4xl font-black tabular-nums tracking-tighter text-white">
                {(match.status === "SCHEDULED" && match.homeScore === null) ? (
                  <span className="text-gray-700 text-xl md:text-2xl uppercase">vs</span>
                ) : (
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className={(match.homeScore ?? 0) > (match.awayScore ?? 0) ? "text-blue-400" : ""}>{match.homeScore ?? 0}</span>
                    <span className="text-white/10">-</span>
                    <span className={(match.awayScore ?? 0) > (match.homeScore ?? 0) ? "text-blue-400" : ""}>{match.awayScore ?? 0}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center w-20 md:w-28 gap-2 md:gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full group-hover:bg-blue-500/40 transition-all"></div>
                <div className="relative w-14 h-14 md:w-20 md:h-20 bg-gray-800 rounded-full p-1 border-2 border-white/10 group-hover:border-blue-500/50 transition-all overflow-hidden shadow-2xl">
                  <img 
                    src={getFlagUrl(match.teamAway)} 
                    alt={match.teamAway} 
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
              <span className="font-bold text-[10px] md:text-sm text-center line-clamp-2 group-hover:text-blue-400 transition-colors leading-tight">{match.teamAway}</span>
            </div>
          </div>
          
          {/* Prediction Info (Mobile Only) */}
          {match.userPrediction && (
            <div className="md:hidden mt-2 mb-4 p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Tahmin</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-white">{match.userPrediction.predictedHomeScore} - {match.userPrediction.predictedAwayScore}</span>
                {match.status === "FINISHED" && (
                  <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                    +{match.userPrediction.pointsAwarded ?? 0} Puan
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="mt-auto pt-4 md:pt-6 flex justify-center">
            <div className="flex items-center gap-2 text-blue-400 group-hover:text-white group-hover:bg-blue-600 px-5 md:px-6 py-2 rounded-full text-[9px] md:text-[10px] font-black transition-all border border-blue-500/20 group-hover:border-blue-600 shadow-lg shadow-blue-500/5 tracking-widest">
              DETAY & TAHMİN
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
