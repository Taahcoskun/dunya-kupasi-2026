"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFlagUrl } from "@/lib/teams";
import { updateMatchScoreAction } from "@/app/actions/matchActions";
import { useRouter } from "next/navigation";
import { ChevronLeft, Lock, Save, Trophy, AlertCircle, Timer, Zap } from "lucide-react";

type Match = {
  id: string;
  teamHome: string;
  teamAway: string;
  kickoffTime: Date;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
};

type Prediction = {
  predictedHomeScore: number;
  predictedAwayScore: number;
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
  const isLocked = diffMins < 10;

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
        predictedAwayScore: predAway 
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
        pointsAwarded: null,
      });
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const [adminHome, setAdminHome] = useState(initialMatch.homeScore ?? 0);
  const [adminAway, setAdminAway] = useState(initialMatch.awayScore ?? 0);
  const [adminStatus, setAdminStatus] = useState(initialMatch.status);
  const [adminError, setAdminError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Sync state with server props when they update
  useEffect(() => {
    setMatch(initialMatch);
    setAdminHome(initialMatch.homeScore ?? 0);
    setAdminAway(initialMatch.awayScore ?? 0);
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
        match.teamAway
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

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white mb-10 transition-colors font-medium group">
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Fikstüre Dön
      </Link>
      
      <div className="glass-dark rounded-[3rem] p-1 shadow-2xl border border-white/5 relative overflow-hidden mb-12">
        <div className="bg-gray-900/50 rounded-[2.8rem] p-10">
          {match.status === "LIVE" && (
            <div className="absolute top-8 right-8 bg-red-500/10 text-red-500 font-black px-4 py-1.5 rounded-full border border-red-500/20 flex items-center gap-2 animate-pulse text-xs tracking-widest">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              CANLI MAÇ
            </div>
          )}
          {match.status === "FINISHED" && (
            <div className="absolute top-8 right-8 bg-gray-500/10 text-gray-400 font-black px-4 py-1.5 rounded-full border border-white/10 text-xs tracking-widest">
              MAÇ BİTTİ
            </div>
          )}

          <div className="text-center text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-12 flex items-center justify-center gap-3">
            <Timer className="w-4 h-4" />
            {kickoff.toLocaleString('tr-TR', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}
          </div>

          <div className="flex justify-between items-center mb-10 gap-4">
            <div className="flex flex-col items-center w-1/3 gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-[40px] rounded-full"></div>
                <div className="relative w-32 h-32 md:w-40 md:h-40 bg-gray-800 rounded-full p-1.5 border-2 border-white/10 overflow-hidden shadow-2xl">
                  <img src={getFlagUrl(match.teamHome)} alt={match.teamHome} className="w-full h-full object-cover rounded-full" />
                </div>
              </div>
              <span className="text-xl md:text-2xl font-black text-white text-center">{match.teamHome}</span>
            </div>
            
            <div className="w-1/3 flex flex-col items-center justify-center">
              <div className="text-5xl md:text-7xl font-black tabular-nums tracking-tighter text-white drop-shadow-2xl">
                {(match.status === "SCHEDULED" && match.homeScore === null) ? (
                  <span className="text-gray-800">VS</span>
                ) : (
                  <div className="flex items-center gap-4">
                    <span className={(match.homeScore ?? 0) > (match.awayScore ?? 0) ? "text-blue-400" : ""}>{match.homeScore ?? 0}</span>
                    <span className="text-white/10">-</span>
                    <span className={(match.awayScore ?? 0) > (match.homeScore ?? 0) ? "text-blue-400" : ""}>{match.awayScore ?? 0}</span>
                  </div>
                )}
              </div>
              {match.status === "LIVE" && <div className="text-red-500 text-xs font-black mt-4 uppercase tracking-widest animate-pulse">Şu An Oynanıyor</div>}
            </div>

            <div className="flex flex-col items-center w-1/3 gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-[40px] rounded-full"></div>
                <div className="relative w-32 h-32 md:w-40 md:h-40 bg-gray-800 rounded-full p-1.5 border-2 border-white/10 overflow-hidden shadow-2xl">
                  <img src={getFlagUrl(match.teamAway)} alt={match.teamAway} className="w-full h-full object-cover rounded-full" />
                </div>
              </div>
              <span className="text-xl md:text-2xl font-black text-white text-center">{match.teamAway}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Panel */}
      {isAdmin && (
        <div className="max-w-2xl mx-auto mb-12">
          <div className="glass-dark rounded-[2.5rem] p-10 border border-red-500/20 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8 justify-center text-red-500">
              <Lock className="w-6 h-6" />
              <h3 className="text-2xl font-black tracking-tight">YÖNETİCİ PANELİ</h3>
            </div>

            {adminError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-8 flex items-center gap-3 justify-center">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-bold">{adminError}</p>
              </div>
            )}
            
            <div className="flex flex-col gap-8">
              <div className="flex justify-center gap-8 items-center">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{match.teamHome}</span>
                  <input 
                    type="number" 
                    value={adminHome}
                    onChange={(e) => setAdminHome(parseInt(e.target.value) || 0)}
                    className="w-16 h-16 text-center text-2xl font-black bg-white/5 border border-white/10 rounded-2xl focus:border-red-500 outline-none"
                  />
                </div>
                <span className="text-2xl text-gray-700">-</span>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{match.teamAway}</span>
                  <input 
                    type="number" 
                    value={adminAway}
                    onChange={(e) => setAdminAway(parseInt(e.target.value) || 0)}
                    className="w-16 h-16 text-center text-2xl font-black bg-white/5 border border-white/10 rounded-2xl focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center gap-6">
                <div className="flex justify-center gap-3">
                  {["SCHEDULED", "LIVE", "FINISHED"].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setAdminStatus(s);
                        handleAdminUpdate(s);
                      }}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border ${
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prediction Section */}
      <div className="max-w-2xl mx-auto">
        <div className="glass rounded-[2.5rem] p-10 border border-white/5 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <Zap className="w-6 h-6 text-blue-400 fill-blue-400/20" />
            <h3 className="text-2xl font-black text-white tracking-tight">Maç Tahmini</h3>
          </div>
          
          {!isLoggedIn ? (
            <div className="text-center py-6">
              <p className="text-gray-400 mb-6 font-medium">Tahmin yarışmasına katılmak için giriş yapın.</p>
              <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black text-sm tracking-widest transition-all shadow-xl shadow-blue-500/20 inline-block">GİRİŞ YAP</Link>
            </div>
          ) : (isLoggedIn && (userRole === "ADMIN" || userName === "ADMIN")) ? (
            <div className="text-center py-6">
              <p className="text-blue-400 mb-2 font-black tracking-widest uppercase text-xs">YÖNETİCİ GİRİŞİ</p>
              <p className="text-gray-400 font-medium">Yöneticiler tahmin yapamaz. Lütfen yukarıdaki panelden skorları güncelleyin.</p>
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
                <div className="flex gap-10 items-center justify-center mb-10">
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{match.teamHome}</span>
                    <input 
                      type="number" 
                      min="0"
                      value={predHome}
                      onChange={(e) => setPredHome(parseInt(e.target.value) || 0)}
                      disabled={isLocked}
                      className="w-24 h-24 text-center text-5xl font-black bg-white/5 border-2 border-white/10 rounded-3xl focus:border-blue-500 focus:bg-white/10 outline-none disabled:opacity-30 transition-all text-white tabular-nums"
                    />
                  </div>
                  <div className="h-0.5 w-6 bg-white/10 mt-8"></div>
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{match.teamAway}</span>
                    <input 
                      type="number" 
                      min="0"
                      value={predAway}
                      onChange={(e) => setPredAway(parseInt(e.target.value) || 0)}
                      disabled={isLocked}
                      className="w-24 h-24 text-center text-5xl font-black bg-white/5 border-2 border-white/10 rounded-3xl focus:border-blue-500 focus:bg-white/10 outline-none disabled:opacity-30 transition-all text-white tabular-nums"
                    />
                  </div>
                </div>

                {isLocked ? (
                  <div className="text-center w-full">
                    <div className="bg-white/5 border border-white/10 text-gray-400 px-8 py-4 rounded-2xl font-bold inline-flex items-center gap-3 mb-6">
                      <Lock className="w-5 h-5 text-gray-500" />
                      TAHMİNLER KAPANDI
                    </div>
                    {prediction && prediction.pointsAwarded !== null && (
                      <div className="bg-blue-600/20 border border-blue-500/30 rounded-3xl p-6 text-center animate-bounce-subtle">
                        <span className="block text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Toplam Kazanılan</span>
                        <span className="text-4xl font-black text-blue-400">{prediction.pointsAwarded} PUAN</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <button 
                    type="submit"
                    disabled={loading}
                    className="group bg-blue-600 hover:bg-blue-500 text-white font-black py-4 px-12 rounded-2xl transition-all shadow-xl shadow-blue-500/30 flex items-center gap-3 hover:scale-105 active:scale-95 disabled:opacity-50"
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
                    <p className="text-xs font-bold uppercase tracking-widest">
                      {Math.floor(diffMins - 10)} dakika içinde kapanacak
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
        <div className="max-w-2xl mx-auto mt-12 pb-20">
          <div className="flex items-center gap-3 mb-6 justify-center text-gray-400">
            <Trophy className="w-5 h-5" />
            <h3 className="text-xl font-black tracking-tight uppercase">Tüm Kullanıcı Tahminleri</h3>
          </div>
          <div className="glass-dark rounded-[2rem] overflow-hidden border border-white/5">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-gray-500 text-[10px] font-black uppercase tracking-widest border-b border-white/5">
                  <th className="px-6 py-4">Kullanıcı</th>
                  <th className="px-6 py-4 text-center">Tahmin</th>
                  <th className="px-6 py-4 text-center">Puan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {allPredictions.map((p, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{p.user.username}</td>
                    <td className="px-6 py-4 text-center font-black text-blue-400">
                      {p.predictedHomeScore} - {p.predictedAwayScore}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {p.pointsAwarded !== null ? (
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${p.pointsAwarded > 0 ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-500/10 text-gray-500'}`}>
                          {p.pointsAwarded > 0 ? `+${p.pointsAwarded}` : '0 Puan'}
                        </span>
                      ) : (
                        <span className="text-gray-600 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
