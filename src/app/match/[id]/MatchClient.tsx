"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFlagUrl } from "@/lib/teams";
import { updateMatchScoreAction, resetMatchAction } from "@/app/actions/matchActions";
import { useRouter } from "next/navigation";
import { ChevronLeft, Lock, Save, Trophy, AlertCircle, Timer, Zap } from "lucide-react";
import { getPointsBreakdown } from "@/lib/points";

type Match = {
  id: string;
  teamHome: string;
  teamAway: string;
  kickoffTime: Date;
  homeScore: number | null;
  awayScore: number | null;
  homeExtraScore: number | null;
  awayExtraScore: number | null;
  penaltyWinner: string | null;
  status: string;
};

type Prediction = {
  predictedHomeScore: number;
  predictedAwayScore: number;
  predictedHomeExtraScore: number | null;
  predictedAwayExtraScore: number | null;
  penaltyWinner: string | null;
  pointsAwarded: number | null;
};

export default function MatchClient({ 
  initialMatch, 
  initialPrediction,
  isLoggedIn,
  userRole,
  userName
}: { 
  initialMatch: Match; 
  initialPrediction: Prediction | null;
  isLoggedIn: boolean;
  userRole?: string;
  userName?: string;
}) {
  const [match, setMatch] = useState<Match>(initialMatch);
  const [prediction, setPrediction] = useState<Prediction | null>(initialPrediction);
  const [allPredictions, setAllPredictions] = useState<any[]>([]);
  
  const [predHome, setPredHome] = useState(initialPrediction?.predictedHomeScore ?? 0);
  const [predAway, setPredAway] = useState(initialPrediction?.predictedAwayScore ?? 0);
  const [predHomeExtra, setPredHomeExtra] = useState(initialPrediction?.predictedHomeExtraScore ?? 0);
  const [predAwayExtra, setPredAwayExtra] = useState(initialPrediction?.predictedAwayExtraScore ?? 0);
  const [penaltyWinner, setPenaltyWinner] = useState<string | null>(initialPrediction?.penaltyWinner ?? null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const kickoff = new Date(match.kickoffTime);
  const [now, setNow] = useState(new Date());

  const isAdmin = userRole === "ADMIN" || userName === "ADMIN";

  const fetchMatch = async () => {
    const res = await fetch("/api/matches");
    const data = await res.json();
    const currentMatch = data.find((m: Match) => m.id === match.id);
    if (currentMatch) {
      setMatch(currentMatch);
    }
  };

  const fetchAllPredictions = async () => {
    if (isAdmin) {
      const res = await fetch(`/api/admin/matches/${match.id}/predictions?teamHome=${encodeURIComponent(match.teamHome)}&teamAway=${encodeURIComponent(match.teamAway)}`);
      if (res.ok) {
        const data = await res.json();
        setAllPredictions(data);
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchMatch();
      fetchAllPredictions();
      setNow(new Date());
    }, 10000); // 10s refresh for detail view

    fetchAllPredictions(); // Initial fetch
    return () => clearInterval(interval);
  }, [match.id, isAdmin]);

  const diffMins = (kickoff.getTime() - now.getTime()) / 1000 / 60;
  const isLocked = now >= kickoff;
  const isKnockout = kickoff >= new Date("2026-06-28T10:00:00Z");

  useEffect(() => {
    if (predHome !== predAway) {
      setPredHomeExtra(0);
      setPredAwayExtra(0);
      setPenaltyWinner(null);
    }
  }, [predHome, predAway]);

  useEffect(() => {
    if (predHomeExtra !== predAwayExtra) {
      setPenaltyWinner(null);
    }
  }, [predHomeExtra, predAwayExtra]);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    if (!isLoggedIn) {
      setError("You must be logged in to predict.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        matchId: match.id, 
        predictedHomeScore: predHome, 
        predictedAwayScore: predAway,
        predictedHomeExtraScore: predHome === predAway ? predHomeExtra : null,
        predictedAwayExtraScore: predHome === predAway ? predAwayExtra : null,
        penaltyWinner: (predHome === predAway && predHomeExtra === predAwayExtra) ? penaltyWinner : null
      }),
    });

    const data = await res.json();
    setLoading(false);
    
    if (!res.ok) {
      setError(data.error);
    } else {
      setMessage("Prediction saved successfully!");
      setPrediction({
        predictedHomeScore: predHome,
        predictedAwayScore: predAway,
        predictedHomeExtraScore: predHome === predAway ? predHomeExtra : null,
        predictedAwayExtraScore: predHome === predAway ? predAwayExtra : null,
        penaltyWinner: (predHome === predAway && predHomeExtra === predAwayExtra) ? penaltyWinner : null,
        pointsAwarded: null,
      });
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const [adminHome, setAdminHome] = useState(initialMatch.homeScore ?? 0);
  const [adminAway, setAdminAway] = useState(initialMatch.awayScore ?? 0);
  const [adminHomeExtra, setAdminHomeExtra] = useState(initialMatch.homeExtraScore ?? 0);
  const [adminAwayExtra, setAdminAwayExtra] = useState(initialMatch.awayExtraScore ?? 0);
  const [adminPenaltyWinner, setAdminPenaltyWinner] = useState<string | null>(initialMatch.penaltyWinner ?? null);
  const [adminStatus, setAdminStatus] = useState(initialMatch.status);
  const [adminError, setAdminError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (adminHome !== adminAway) {
      setAdminHomeExtra(0);
      setAdminAwayExtra(0);
      setAdminPenaltyWinner(null);
    }
  }, [adminHome, adminAway]);

  useEffect(() => {
    if (adminHomeExtra !== adminAwayExtra) {
      setAdminPenaltyWinner(null);
    }
  }, [adminHomeExtra, adminAwayExtra]);

  // Sync state with server props when they update
  useEffect(() => {
    setMatch(initialMatch);
    setAdminHome(initialMatch.homeScore ?? 0);
    setAdminAway(initialMatch.awayScore ?? 0);
    setAdminHomeExtra(initialMatch.homeExtraScore ?? 0);
    setAdminAwayExtra(initialMatch.awayExtraScore ?? 0);
    setAdminPenaltyWinner(initialMatch.penaltyWinner ?? null);
    setAdminStatus(initialMatch.status);
  }, [initialMatch]);

  const router = useRouter();
  const handleAdminUpdate = async (newStatus?: string) => {
    setAdminError("");
    setIsSaving(true);
    const s = newStatus || adminStatus;
    try {
      const res = await updateMatchScoreAction(
        match.id,
        adminHome,
        adminAway,
        s,
        match.teamHome,
        match.teamAway,
        adminHome === adminAway ? adminHomeExtra : null,
        adminHome === adminAway ? adminAwayExtra : null,
        (adminHome === adminAway && adminHomeExtra === adminAwayExtra) ? adminPenaltyWinner : null
      );

      if (res.success) {
        await Promise.all([
          fetchMatch(),
          fetchAllPredictions()
        ]);
        router.refresh();
      } else {
        setAdminError(res.error || "Güncelleme başarısız.");
      }
    } catch (err) {
      setAdminError("Bağlantı hatası.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdminReset = async () => {
    if (!confirm("Maçı sıfırlamak istediğinize emin misiniz? Puanlar geri alınacak.")) return;
    
    setAdminError("");
    setIsSaving(true);
    try {
      const res = await resetMatchAction(match.id, match.teamHome, match.teamAway);
      if (res.success) {
        await Promise.all([
          fetchMatch(),
          fetchAllPredictions()
        ]);
        router.refresh();
      } else {
        setAdminError(res.error || "Sıfırlama başarısız.");
      }
    } catch (err) {
      setAdminError("Bağlantı hatası.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Animated Background */}
      <div className="bg-animate">
        <div className="bg-blob bg-blob-1"></div>
        <div className="bg-blob bg-blob-2"></div>
        <div className="bg-blob bg-blob-3"></div>
      </div>

      <div className="container max-w-4xl mx-auto py-8 px-4 relative z-10">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white mb-10 transition-colors font-medium group fade-in-up">
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Fikstüre Dön
        </Link>
        
        {/* Match Header Card */}
        <div className="glass-dark rounded-[2.5rem] md:rounded-[3rem] p-1 shadow-2xl border border-white/5 relative overflow-hidden mb-8 md:mb-12 fade-in-up">
          <div className="bg-gray-900/50 rounded-[2.3rem] md:rounded-[2.8rem] p-6 md:p-10">
            <div className="flex flex-col items-center mb-8 md:mb-12 gap-4">
              {match.status === "LIVE" && (
                <div className="bg-red-500/10 text-red-500 font-black px-3 md:px-4 py-1 md:py-1.5 rounded-full border border-red-500/20 flex items-center gap-2 animate-pulse text-[9px] md:text-xs tracking-widest uppercase">
                  <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-red-500"></div>
                  CANLI MAÇ
                </div>
              )}
              {match.status === "FINISHED" && (
                <div className="bg-gray-500/10 text-gray-400 font-black px-3 md:px-4 py-1 md:py-1.5 rounded-full border border-white/10 text-[9px] md:text-xs tracking-widest uppercase">
                  MAÇ BİTTİ
                </div>
              )}

              <div className="text-center text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center justify-center gap-2 md:gap-3">
                <Timer className="w-3.5 md:w-4 h-3.5 md:h-4" />
                {kickoff.toLocaleString('tr-TR', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}
              </div>
            </div>

            <div className="flex flex-row justify-between items-center mb-4 md:mb-10 gap-2 md:gap-4">
              {/* Home Team */}
              <div className="flex flex-col items-center justify-center w-1/3 gap-4 md:gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 blur-[30px] md:blur-[40px] rounded-full"></div>
                  <div className="relative w-16 h-16 md:w-40 md:h-40 bg-gray-800 rounded-full p-1 md:p-1.5 border-2 border-white/10 overflow-hidden shadow-2xl">
                    <img src={getFlagUrl(match.teamHome)} alt={match.teamHome} className="w-full h-full object-cover rounded-full" />
                  </div>
                </div>
                <span className="hidden md:block text-xl md:text-2xl font-black text-white text-center">{match.teamHome}</span>
              </div>
              
              {/* Score / VS */}
              <div className="w-1/3 flex flex-col items-center justify-center">
                <div className="text-4xl md:text-7xl font-black tabular-nums tracking-tighter text-white drop-shadow-2xl">
                  {(match.status === "SCHEDULED" && match.homeScore === null) ? (
                    <span className="text-gray-800">VS</span>
                  ) : (
                    <div className="flex items-center gap-2 md:gap-4">
                      <span className={(match.homeScore ?? 0) > (match.awayScore ?? 0) ? "text-blue-400" : ""}>{match.homeScore ?? 0}</span>
                      <span className="text-white/10">-</span>
                      <span className={(match.awayScore ?? 0) > (match.homeScore ?? 0) ? "text-blue-400" : ""}>{match.awayScore ?? 0}</span>
                    </div>
                  )}
                </div>
                {match.status === "LIVE" && <div className="text-red-500 text-[10px] md:text-xs font-black mt-4 uppercase tracking-widest animate-pulse">Şu An Oynanıyor</div>}
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center justify-center w-1/3 gap-4 md:gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 blur-[30px] md:blur-[40px] rounded-full"></div>
                  <div className="relative w-16 h-16 md:w-40 md:h-40 bg-gray-800 rounded-full p-1 md:p-1.5 border-2 border-white/10 overflow-hidden shadow-2xl">
                    <img src={getFlagUrl(match.teamAway)} alt={match.teamAway} className="w-full h-full object-cover rounded-full" />
                  </div>
                </div>
                <span className="hidden md:block text-xl md:text-2xl font-black text-white text-center">{match.teamAway}</span>
              </div>
            </div>

            {/* User Prediction Info (Visible explicitly) */}
            {prediction && (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2 text-center flex-col">
                  <span className="text-[10px] md:text-xs font-black text-blue-400 uppercase tracking-widest">
                    Senin Tahminin: {prediction.predictedHomeScore} - {prediction.predictedAwayScore}
                    {prediction.predictedHomeExtraScore !== null && prediction.predictedAwayExtraScore !== null && (
                      <>
                        {" | Uzatma: "}{prediction.predictedHomeExtraScore} - {prediction.predictedAwayExtraScore}
                      </>
                    )}
                    {prediction.penaltyWinner && (
                      <>
                        {" | Penaltı: "}{prediction.penaltyWinner}
                      </>
                    )}
                  </span>
                </div>
                {prediction.pointsAwarded !== null && (
                  <div className="mt-1">
                    <span className="text-2xl font-black text-green-400">+{prediction.pointsAwarded} PUAN</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Admin Panel */}
        {isAdmin && (
          <div className="max-w-2xl mx-auto mb-8 md:mb-12 fade-in-up delay-1">
            <div className="glass-dark rounded-[2.5rem] p-6 md:p-10 border border-red-500/20 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-8 justify-center text-red-500">
                <Lock className="w-6 h-6" />
                <h3 className="text-xl md:text-2xl font-black tracking-tight">YÖNETİCİ PANELİ</h3>
              </div>

              {adminError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-8 flex items-center gap-3 justify-center">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-bold">{adminError}</p>
                </div>
              )}
              
              <div className="flex flex-col gap-8">
                <div className="flex justify-center gap-4 md:gap-8 items-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest text-center truncate w-20">{match.teamHome}</span>
                    <input 
                      type="number" 
                      value={adminHome}
                      onChange={(e) => setAdminHome(parseInt(e.target.value) || 0)}
                      className="w-14 h-14 md:w-16 md:h-16 text-center text-xl md:text-2xl font-black bg-white/5 border border-white/10 rounded-2xl focus:border-red-500 outline-none text-white"
                    />
                  </div>
                  <span className="text-xl text-gray-700 mt-6">-</span>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest text-center truncate w-20">{match.teamAway}</span>
                    <input 
                      type="number" 
                      value={adminAway}
                      onChange={(e) => setAdminAway(parseInt(e.target.value) || 0)}
                      className="w-14 h-14 md:w-16 md:h-16 text-center text-xl md:text-2xl font-black bg-white/5 border border-white/10 rounded-2xl focus:border-red-500 outline-none text-white"
                    />
                  </div>
                </div>

                {/* Admin Extra Time & Penalty Score */}
                {isKnockout && adminHome === adminAway && (
                  <div className="flex flex-col items-center w-full p-6 bg-red-500/5 border border-red-500/10 rounded-[2rem] fade-in-up">
                    <span className="text-[10px] font-black text-red-400 mb-4 tracking-widest uppercase">Uzatma Süresi (Admin)</span>
                    <div className="flex justify-center gap-4 items-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[9px] font-bold text-gray-500">{match.teamHome}</span>
                        <input 
                          type="number" 
                          value={adminHomeExtra}
                          onChange={(e) => setAdminHomeExtra(parseInt(e.target.value) || 0)}
                          className="w-12 h-12 text-center text-lg font-black bg-white/5 border border-white/10 rounded-xl focus:border-red-500 outline-none text-white"
                        />
                      </div>
                      <span className="text-gray-700 mt-4">-</span>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[9px] font-bold text-gray-500">{match.teamAway}</span>
                        <input 
                          type="number" 
                          value={adminAwayExtra}
                          onChange={(e) => setAdminAwayExtra(parseInt(e.target.value) || 0)}
                          className="w-12 h-12 text-center text-lg font-black bg-white/5 border border-white/10 rounded-xl focus:border-red-500 outline-none text-white"
                        />
                      </div>
                    </div>

                    {/* Admin Penalty Winner Selector */}
                    {adminHomeExtra === adminAwayExtra && (
                      <div className="flex flex-col items-center w-full mt-4 pt-4 border-t border-white/5 fade-in-up">
                        <span className="text-[10px] font-black text-red-400 mb-3 tracking-widest uppercase">Penaltı Kazananı (Admin)</span>
                        <div className="flex gap-3 justify-center w-full">
                          {[match.teamHome, match.teamAway].map((team) => (
                            <button
                              key={team}
                              type="button"
                              onClick={() => setAdminPenaltyWinner(team)}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${
                                adminPenaltyWinner === team
                                  ? "bg-red-500 text-white shadow-lg"
                                  : "bg-white/5 text-gray-500 border border-white/10 hover:text-white"
                              }`}
                            >
                              {team}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col items-center gap-6">
                  <div className="flex justify-center gap-2 md:gap-3 flex-wrap">
                    {["SCHEDULED", "LIVE", "FINISHED"].map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setAdminStatus(s);
                          handleAdminUpdate(s);
                        }}
                        className={`px-3 md:px-4 py-2 rounded-xl text-[9px] md:text-[10px] font-black transition-all border ${
                          adminStatus === s 
                            ? "bg-red-500 text-white border-red-500" 
                            : "bg-white/5 text-gray-500 border-white/10"
                        }`}
                      >
                        {s === "SCHEDULED" ? "GELECEK" : s === "LIVE" ? "CANLI" : "BİTTİ"}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => handleAdminUpdate()}
                    disabled={isSaving}
                    className={`w-full py-4 rounded-2xl font-black text-white transition-all active:scale-95 shadow-xl ${
                      isSaving ? "bg-gray-600 cursor-not-allowed" : "bg-red-600 hover:bg-red-500 shadow-red-500/20"
                    }`}
                  >
                    {isSaving ? "KAYDEDİLİYOR..." : "SKORLARI KAYDET"}
                  </button>

                  <button
                    onClick={handleAdminReset}
                    disabled={isSaving}
                    className={`w-full py-3 rounded-2xl font-black transition-all active:scale-95 border border-red-500/30 ${
                      isSaving ? "text-gray-600 border-gray-800 cursor-not-allowed" : "text-red-500 hover:bg-red-500/10"
                    }`}
                  >
                    {isSaving ? "LÜTFEN BEKLEYİN..." : "MAÇI SIFIRLA (PUANLARI SİL)"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Prediction Section */}
        <div className="max-w-2xl mx-auto fade-in-up delay-2">
          <div className="glass rounded-[2.5rem] p-6 md:p-10 border border-white/5 relative overflow-hidden shadow-2xl">
            <div className="flex items-center gap-3 mb-8 justify-center">
              <Zap className="w-5 md:w-6 h-5 md:h-6 text-blue-400 fill-blue-400/20" />
              <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">Maç Tahmini</h3>
            </div>
            
            {!isLoggedIn ? (
              <div className="text-center py-6">
                <p className="text-gray-400 mb-6 font-medium">Tahmin yarışmasına katılmak için giriş yapın.</p>
                <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black text-sm tracking-widest transition-all shadow-xl shadow-blue-500/20 inline-block">GİRİŞ YAP</Link>
              </div>
            ) : (isLoggedIn && (userRole === "ADMIN" || userName === "ADMIN")) ? (
              <div className="text-center py-6">
                <p className="text-blue-400 mb-2 font-black tracking-widest uppercase text-xs">YÖNETİCİ GİRİŞİ</p>
                <p className="text-gray-400 font-medium text-sm">Yöneticiler tahmin yapamaz. Lütfen yukarıdaki panelden skorları güncelleyin.</p>
              </div>
            ) : (
              <div className="relative z-10">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-8 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-bold">{error}</p>
                  </div>
                )}
                {message && (
                  <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-2xl mb-8 flex items-center gap-3">
                    <Trophy className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-bold">{message}</p>
                  </div>
                )}
                
                <form onSubmit={handlePredict} className="flex flex-col items-center">
                  <div className="flex gap-4 md:gap-10 items-center justify-center mb-10">
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center w-20 truncate md:w-auto">{match.teamHome}</span>
                      <input 
                        type="number" 
                        min="0"
                        value={predHome}
                        onChange={(e) => setPredHome(parseInt(e.target.value) || 0)}
                        disabled={isLocked}
                        className="w-16 h-16 md:w-24 md:h-24 text-center text-3xl md:text-5xl font-black bg-white/5 border-2 border-white/10 rounded-2xl md:rounded-3xl focus:border-blue-500 focus:bg-white/10 outline-none disabled:opacity-30 transition-all text-white tabular-nums"
                      />
                    </div>
                    <div className="h-0.5 w-4 md:w-6 bg-white/10 mt-6 md:mt-10"></div>
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center w-20 truncate md:w-auto">{match.teamAway}</span>
                      <input 
                        type="number" 
                        min="0"
                        value={predAway}
                        onChange={(e) => setPredAway(parseInt(e.target.value) || 0)}
                        disabled={isLocked}
                        className="w-16 h-16 md:w-24 md:h-24 text-center text-3xl md:text-5xl font-black bg-white/5 border-2 border-white/10 rounded-2xl md:rounded-3xl focus:border-blue-500 focus:bg-white/10 outline-none disabled:opacity-30 transition-all text-white tabular-nums"
                      />
                    </div>
                  </div>

                  {/* Extra Time prediction */}
                  {isKnockout && predHome === predAway && (
                    <div className="flex flex-col items-center w-full mb-10 p-6 bg-white/5 border border-white/10 rounded-[2rem] fade-in-up">
                      <h4 className="text-xs md:text-sm font-black text-blue-400 mb-4 tracking-widest uppercase">Uzatma Süresi Tahmini</h4>
                      <div className="flex gap-4 md:gap-8 items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{match.teamHome}</span>
                          <input 
                            type="number" 
                            min="0"
                            value={predHomeExtra}
                            onChange={(e) => setPredHomeExtra(parseInt(e.target.value) || 0)}
                            disabled={isLocked}
                            className="w-12 h-12 md:w-16 md:h-16 text-center text-xl md:text-2xl font-black bg-white/5 border border-white/10 rounded-xl focus:border-blue-500 focus:bg-white/10 outline-none disabled:opacity-30 transition-all text-white"
                          />
                        </div>
                        <div className="h-0.5 w-3 bg-white/10 mt-6"></div>
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{match.teamAway}</span>
                          <input 
                            type="number" 
                            min="0"
                            value={predAwayExtra}
                            onChange={(e) => setPredAwayExtra(parseInt(e.target.value) || 0)}
                            disabled={isLocked}
                            className="w-12 h-12 md:w-16 md:h-16 text-center text-xl md:text-2xl font-black bg-white/5 border border-white/10 rounded-xl focus:border-blue-500 focus:bg-white/10 outline-none disabled:opacity-30 transition-all text-white"
                          />
                        </div>
                      </div>

                      {/* Penalty prediction */}
                      {predHomeExtra === predAwayExtra && (
                        <div className="flex flex-col items-center w-full mt-6 pt-6 border-t border-white/5 fade-in-up">
                          <h4 className="text-[10px] font-black text-orange-400 mb-4 tracking-widest uppercase">Penaltı Kazananı Tahmini</h4>
                          <div className="flex gap-4 justify-center w-full">
                            {[match.teamHome, match.teamAway].map((team) => (
                              <button
                                key={team}
                                type="button"
                                disabled={isLocked}
                                onClick={() => setPenaltyWinner(team)}
                                className={`px-4 py-2.5 rounded-xl text-[10px] font-black transition-all ${
                                  penaltyWinner === team
                                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                                    : "bg-white/5 text-gray-400 border border-white/10 hover:text-white"
                                }`}
                              >
                                {team}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {isLocked ? (
                    <div className="text-center w-full">
                      <div className="bg-white/5 border border-white/10 text-gray-400 px-8 py-4 rounded-2xl font-bold inline-flex items-center gap-3 mb-6">
                        <Lock className="w-5 h-5 text-gray-500" />
                        TAHMİNLER KAPANDI
                      </div>
                    </div>
                  ) : (
                    <button 
                      type="submit"
                      disabled={loading}
                      className="group w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-black py-4 px-12 rounded-2xl transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center gap-3 hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                          <span>{prediction ? "TAHMİNİ GÜNCELLE" : "TAHMİNİ KAYDET"}</span>
                        </>
                      )}
                    </button>
                  )}
                  {!isLocked && diffMins > 0 && (
                    <div className="flex items-center gap-2 mt-8 text-gray-500">
                      <Timer className="w-4 h-4" />
                      <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest">
                        {diffMins > 60 
                          ? `Maçın başlamasına ${Math.floor(diffMins / 60)} saat ${Math.floor(diffMins % 60)} dakika kaldı` 
                          : `Maçın başlamasına ${Math.max(1, Math.floor(diffMins))} dakika kaldı`
                        }
                      </p>
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Admin View All Predictions */}
        {isAdmin && (
          <div className="max-w-2xl mx-auto mt-12 pb-20 fade-in-up delay-3">
            <div className="flex items-center gap-3 mb-6 justify-center text-gray-400">
              <Trophy className="w-5 h-5" />
              <h3 className="text-lg md:text-xl font-black tracking-tight uppercase">Tüm Kullanıcı Tahminleri</h3>
            </div>
            <div className="glass-dark rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5 text-gray-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest border-b border-white/5">
                      <th className="px-4 md:px-6 py-4">Kullanıcı</th>
                      <th className="px-4 md:px-6 py-4 text-center">Tahmin</th>
                      <th className="px-4 md:px-6 py-4 text-center">Puan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allPredictions.map((p, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 md:px-6 py-4 font-bold text-white text-sm md:text-base truncate max-w-[100px] md:max-w-none">{p.user.username}</td>
                        <td className="px-4 md:px-6 py-4 text-center font-black text-blue-400 text-sm md:text-base whitespace-nowrap">
                          <div>{p.predictedHomeScore} - {p.predictedAwayScore}</div>
                          {p.predictedHomeExtraScore !== null && p.predictedAwayExtraScore !== null && (
                            <div className="text-[10px] text-gray-500 font-bold mt-0.5">
                              Uzatma: {p.predictedHomeExtraScore} - {p.predictedAwayExtraScore}
                            </div>
                          )}
                          {p.penaltyWinner && (
                            <div className="text-[10px] text-orange-400 font-bold mt-0.5">
                              Penaltı: {p.penaltyWinner}
                            </div>
                          )}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-center">
                          {(() => {
                            const bd = getPointsBreakdown(match, p);
                            if (p.pointsAwarded === null) return <span className="text-gray-600 text-xs">-</span>;
                            
                            return (
                              <div className="flex flex-col items-center gap-0.5">
                                <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-black ${p.pointsAwarded > 0 ? 'bg-blue-500/10 text-blue-400' : p.pointsAwarded < 0 ? 'bg-red-500/10 text-red-400' : 'bg-gray-500/10 text-gray-500'}`}>
                                  {p.pointsAwarded > 0 ? `+${p.pointsAwarded}` : p.pointsAwarded}
                                </span>
                                {isKnockout && (
                                  <div className="text-[9px] text-gray-500 font-bold whitespace-nowrap mt-1">
                                    90dk: {bd.score90Mins >= 0 ? `+${bd.score90Mins}` : bd.score90Mins}p
                                    {p.predictedHomeScore === p.predictedAwayScore && (
                                      <>
                                        {" | Uz: "}{bd.extraTimeGo + bd.extraTimeOutcome >= 0 ? `+${bd.extraTimeGo + bd.extraTimeOutcome}` : bd.extraTimeGo + bd.extraTimeOutcome}p
                                        {p.predictedHomeExtraScore === p.predictedAwayExtraScore && (
                                          <>
                                            {" | Pen: "}{bd.penaltyGo + bd.penaltyWinner >= 0 ? `+${bd.penaltyGo + bd.penaltyWinner}` : bd.penaltyGo + bd.penaltyWinner}p
                                          </>
                                        )}
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
