"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Trophy, Star, Target, Zap, Lock, Save, Loader2, AlertCircle } from "lucide-react";
import { teamFlags } from "@/lib/teams";

export default function ExtraPredictionsPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locked, setLocked] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const [predictions, setPredictions] = useState({
    winnerTeam: "",
    bestPlayer: "",
    topScorer: "",
    topAssister: ""
  });
  const [allPredictions, setAllPredictions] = useState<any[]>([]);

  const teams = Object.keys(teamFlags).sort();
  const LOCK_TIME = new Date("2026-06-11T19:00:00Z");
  const isAdmin = session?.user?.name === "ADMIN" || (session?.user as any)?.role === "ADMIN";

  useEffect(() => {
    const checkLock = () => {
      if (new Date() >= LOCK_TIME) {
        setLocked(true);
      }
    };
    checkLock();
    
    if (status === "authenticated") {
      // User's own predictions
      fetch("/api/extra")
        .then(async res => {
          const text = await res.text();
          if (!text) return {};
          try { return JSON.parse(text); } catch (e) { return {}; }
        })
        .then((data: any) => {
          if (data && !data.error) {
            setPredictions({
              winnerTeam: data.winnerTeam || "",
              bestPlayer: data.bestPlayer || "",
              topScorer: data.topScorer || "",
              topAssister: data.topAssister || ""
            });
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Fetch error:", err);
          setLoading(false);
        });

      // Admin fetch all
      if (isAdmin) {
        fetch("/api/admin/extra")
          .then(async res => {
            const text = await res.text();
            if (!text) return [];
            try { return JSON.parse(text); } catch (e) { return []; }
          })
          .then(data => {
            if (Array.isArray(data)) {
              setAllPredictions(data);
            }
          })
          .catch(err => console.error("Admin fetch error:", err));
      }
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;
    
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/extra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(predictions)
      });
      
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        let errorData: any = { error: "Bir hata oluştu." };
        try {
          errorData = await res.json();
        } catch (e) {}
        setError(errorData.error || "Bir hata oluştu.");
      }
    } catch (err) {
      setError("Bağlantı hatası oluştu.");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="glass-dark rounded-[2.5rem] p-12 max-w-lg mx-auto border border-white/5 shadow-2xl">
          <Lock className="w-16 h-16 text-gray-600 mx-auto mb-6 opacity-50" />
          <h2 className="text-3xl font-black text-white mb-4">Giriş Yapmalısın</h2>
          <p className="text-gray-400 mb-8">Ekstra tahminleri yapabilmek için lütfen önce giriş yap.</p>
          <a href="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black tracking-widest transition-all shadow-xl shadow-blue-500/20 inline-block">GİRİŞ YAP</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center mb-12">
        <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mb-4 border border-purple-500/30 shadow-xl shadow-purple-500/10">
          <Star className="w-8 h-8 text-purple-400" />
        </div>
        <h1 className="text-5xl font-black text-center text-white mb-2 tracking-tight">
          Ekstra <span className="text-gradient">Tahminler</span>
        </h1>
        <p className="text-gray-400 text-center max-w-md">
          Turnuva başlamadan önce büyük tahminlerini yap. İlk maç başladığı an kilitlenecektir.
        </p>
        
        {locked && (
          <div className="mt-6 flex items-center gap-2 bg-red-500/10 text-red-500 px-6 py-2 rounded-full border border-red-500/20 text-xs font-black tracking-widest uppercase">
            <Lock className="w-4 h-4" /> TAHMİNLER KİLİTLENDİ
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Winner Team */}
            <div className="glass-dark rounded-[2rem] p-8 border border-white/5 relative group hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                  <Trophy className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white">Şampiyon</h3>
              </div>
              <select
                disabled={locked}
                value={predictions.winnerTeam}
                onChange={(e) => setPredictions({...predictions, winnerTeam: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-purple-500 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" className="bg-gray-900">Takım Seçin</option>
                {teams.map(team => (
                  <option key={team} value={team} className="bg-gray-900">{team}</option>
                ))}
              </select>
            </div>

            {/* Best Player */}
            <div className="glass-dark rounded-[2rem] p-8 border border-white/5 relative group hover:border-blue-500/30 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                  <Star className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white">En İyi Oyuncu</h3>
              </div>
              <input
                disabled={locked}
                type="text"
                placeholder="Oyuncu adı yazın"
                value={predictions.bestPlayer}
                onChange={(e) => setPredictions({...predictions, bestPlayer: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Top Scorer */}
            <div className="glass-dark rounded-[2rem] p-8 border border-white/5 relative group hover:border-green-500/30 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white">Gol Kralı</h3>
              </div>
              <input
                disabled={locked}
                type="text"
                placeholder="Oyuncu adı yazın"
                value={predictions.topScorer}
                onChange={(e) => setPredictions({...predictions, topScorer: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-green-500 transition-all placeholder:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Top Assister */}
            <div className="glass-dark rounded-[2rem] p-8 border border-white/5 relative group hover:border-yellow-500/30 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-yellow-500/20 rounded-xl text-yellow-400">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white">Asist Kralı</h3>
              </div>
              <input
                disabled={locked}
                type="text"
                placeholder="Oyuncu adı yazın"
                value={predictions.topAssister}
                onChange={(e) => setPredictions({...predictions, topAssister: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-yellow-500 transition-all placeholder:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 pt-4">
            {!locked && (
              <button
                type="submit"
                disabled={saving}
                className="bg-white text-black px-12 py-5 rounded-[1.5rem] font-black tracking-widest hover:scale-105 transition-all shadow-2xl flex items-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
              >
                {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                TAHMİNLERİ KAYDET
              </button>
            )}

            {success && (
              <p className="text-green-500 font-bold flex items-center gap-2 animate-bounce">
                <Check className="w-5 h-5" /> Tahminlerin başarıyla kaydedildi!
              </p>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                <p className="font-bold">{error}</p>
              </div>
            )}
          </div>
        </form>

        {isAdmin && (
          <div className="mt-24">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-red-500/20 rounded-xl text-red-400">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">Kullanıcı <span className="text-red-500">Tahminleri</span></h2>
            </div>
            
            <div className="glass-dark rounded-[2rem] overflow-hidden border border-white/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5 text-gray-400 text-xs font-black uppercase tracking-widest border-b border-white/5">
                      <th className="px-6 py-4">Kullanıcı</th>
                      <th className="px-6 py-4">Şampiyon</th>
                      <th className="px-6 py-4">En İyi Oyuncu</th>
                      <th className="px-6 py-4">Gol Kralı</th>
                      <th className="px-6 py-4">Asist Kralı</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allPredictions.length > 0 ? allPredictions.map((pred, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-bold text-white">{pred.user.username}</td>
                        <td className="px-6 py-4 text-purple-400 font-bold">{pred.winnerTeam || "-"}</td>
                        <td className="px-6 py-4 text-blue-400 font-medium">{pred.bestPlayer || "-"}</td>
                        <td className="px-6 py-4 text-green-400 font-medium">{pred.topScorer || "-"}</td>
                        <td className="px-6 py-4 text-yellow-400 font-medium">{pred.topAssister || "-"}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-bold italic">
                          Henüz hiçbir kullanıcı ekstra tahmin yapmadı.
                        </td>
                      </tr>
                    )}
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

function Users(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function Check(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
