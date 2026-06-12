"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Trophy, Users, Lock, Timer, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { getFlagUrl } from "@/lib/teams";
import Link from "next/link";

type Prediction = {
  id: string;
  username: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  pointsAwarded: number | null;
};

type LiveMatch = {
  id: string;
  teamHome: string;
  teamAway: string;
  kickoffTime: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  predictions: Prediction[];
};

export default function LivePredictionsPage() {
  const { data: session, status } = useSession();
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchLivePredictions = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch("/api/predictions/live");
      if (res.ok) {
        const data = await res.json();
        // Sort matches: live first, then latest kickoff time first (descending)
        const sorted = data.sort((a: LiveMatch, b: LiveMatch) => {
          if (a.status === "LIVE" && b.status !== "LIVE") return -1;
          if (b.status === "LIVE" && a.status !== "LIVE") return 1;
          return new Date(b.kickoffTime).getTime() - new Date(a.kickoffTime).getTime();
        });
        setMatches(sorted);
        setError("");
      } else {
        const errData = await res.json();
        setError(errData.error || "Tahminler yüklenirken hata oluştu.");
      }
    } catch (err) {
      setError("Bağlantı hatası oluştu.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchLivePredictions();
      // Poll every 20 seconds for live score / prediction updates
      const interval = setInterval(() => fetchLivePredictions(false), 20000);
      return () => clearInterval(interval);
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-gray-400 font-bold animate-pulse">Tahminler Yükleniyor...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="glass-dark rounded-[2.5rem] p-12 max-w-lg mx-auto border border-white/5 shadow-2xl">
          <Lock className="w-16 h-16 text-gray-600 mx-auto mb-6 opacity-50" />
          <h2 className="text-3xl font-black text-white mb-4">Giriş Yapmalısın</h2>
          <p className="text-gray-400 mb-8">
            Diğer kullanıcıların tahminlerini görebilmek için lütfen önce giriş yap.
          </p>
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black tracking-widest transition-all shadow-xl shadow-blue-500/20 inline-block"
          >
            GİRİŞ YAP
          </Link>
        </div>
      </div>
    );
  }

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
          <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/30 shadow-xl shadow-blue-500/10">
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-5xl font-black text-center text-white mb-2 tracking-tight">
            Tüm <span className="text-gradient">Tahminler</span>
          </h1>
          <p className="text-gray-400 text-center max-w-md mb-6">
            Maçlar başladıktan (veya kilitlendikten) sonra tüm oyuncuların tahminleri burada listelenir.
          </p>

          <button
            onClick={() => fetchLivePredictions(true)}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 px-5 py-2.5 rounded-full border border-white/10 text-xs font-black tracking-widest uppercase transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            YENİLE
          </button>
        </div>

        {error && (
          <div className="max-w-md mx-auto bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-center gap-3 mb-8">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="font-bold">{error}</p>
          </div>
        )}

        <div className="max-w-4xl mx-auto space-y-12">
          {matches.length === 0 ? (
            <div className="text-center py-24 glass rounded-[2.5rem] border border-white/5">
              <Trophy className="w-16 h-16 text-gray-700 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-white mb-2">Henüz Başlayan Maç Yok</h3>
              <p className="text-gray-500 max-w-sm mx-auto text-sm">
                Tahminlerin paylaşılması için en az bir maçın başlama saatine 10 dakikadan az kalmış veya oynanmış olması gerekmektedir.
              </p>
            </div>
          ) : (
            matches.map((match, idx) => {
              // Sort match predictions by points (descending) then username (ascending)
              const sortedPredictions = [...match.predictions].sort((a, b) => {
                const pointsA = a.pointsAwarded ?? -1;
                const pointsB = b.pointsAwarded ?? -1;
                if (pointsB !== pointsA) return pointsB - pointsA;
                return a.username.localeCompare(b.username);
              });

              return (
                <div
                  key={match.id}
                  className="glass-dark rounded-[2.5rem] p-1 border border-white/5 overflow-hidden shadow-2xl fade-in-up"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="bg-gray-900/50 rounded-[2.3rem] p-6 md:p-8">
                    {/* Match Card Header */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-8 gap-4 border-b border-white/5 pb-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                        <Timer className="w-4 h-4" />
                        {new Date(match.kickoffTime).toLocaleString("tr-TR", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </div>

                      <div className="flex items-center gap-4">
                        {match.status === "LIVE" && (
                          <div className="bg-red-500/10 text-red-500 text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 border border-red-500/20 animate-pulse">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                            CANLI
                          </div>
                        )}
                        {match.status === "FINISHED" && (
                          <div className="bg-gray-500/10 text-gray-400 text-[10px] font-black px-3 py-1 rounded-full border border-white/10">
                            BİTTİ
                          </div>
                        )}
                        {match.status === "SCHEDULED" && (
                          <div className="bg-blue-500/10 text-blue-400 text-[10px] font-black px-3 py-1 rounded-full border border-blue-500/10">
                            KİLİTLİ
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Match Teams & Score Row */}
                    <div className="flex justify-between items-center px-4 md:px-12 mb-8 gap-4">
                      {/* Home */}
                      <div className="flex items-center gap-3 w-1/3 justify-end">
                        <span className="font-bold text-sm md:text-lg text-white text-right truncate">
                          {match.teamHome}
                        </span>
                        <div className="relative shrink-0 w-10 h-10 md:w-14 md:h-14 bg-gray-800 rounded-full p-0.5 border border-white/10 overflow-hidden shadow-lg">
                          <img
                            src={getFlagUrl(match.teamHome)}
                            alt={match.teamHome}
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                      </div>

                      {/* Score display */}
                      <div className="text-center w-1/3">
                        <div className="text-2xl md:text-4xl font-black tabular-nums tracking-tighter text-white">
                          {match.homeScore !== null && match.awayScore !== null ? (
                            <div className="flex items-center justify-center gap-2 md:gap-3">
                              <span className={match.homeScore > match.awayScore ? "text-blue-400" : ""}>
                                {match.homeScore}
                              </span>
                              <span className="text-white/10">-</span>
                              <span className={match.awayScore > match.homeScore ? "text-blue-400" : ""}>
                                {match.awayScore}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-700 text-lg uppercase tracking-widest font-black">
                              VS
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Away */}
                      <div className="flex items-center gap-3 w-1/3 justify-start">
                        <div className="relative shrink-0 w-10 h-10 md:w-14 md:h-14 bg-gray-800 rounded-full p-0.5 border border-white/10 overflow-hidden shadow-lg">
                          <img
                            src={getFlagUrl(match.teamAway)}
                            alt={match.teamAway}
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                        <span className="font-bold text-sm md:text-lg text-white text-left truncate">
                          {match.teamAway}
                        </span>
                      </div>
                    </div>

                    {/* Predictions List */}
                    <div className="glass-dark rounded-2xl overflow-hidden border border-white/5">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-white/5 text-gray-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest border-b border-white/5">
                              <th className="px-6 py-4">Kullanıcı</th>
                              <th className="px-6 py-4 text-center">Tahmin</th>
                              <th className="px-6 py-4 text-center">Durum / Kazanılan Puan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {sortedPredictions.length > 0 ? (
                              sortedPredictions.map((pred) => {
                                const isUserPrediction = pred.username === session?.user?.name;

                                return (
                                  <tr
                                    key={pred.id}
                                    className={`hover:bg-white/5 transition-colors ${
                                      isUserPrediction ? "bg-blue-600/5 font-semibold" : ""
                                    }`}
                                  >
                                    <td className="px-6 py-4 text-white text-sm md:text-base flex items-center gap-2">
                                      <span className="truncate">{pred.username}</span>
                                      {isUserPrediction && (
                                        <span className="bg-blue-500/20 text-blue-400 text-[8px] font-black px-2 py-0.5 rounded-full border border-blue-500/30 uppercase tracking-widest">
                                          Sen
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 text-center font-black text-blue-400 text-sm md:text-base whitespace-nowrap">
                                      {pred.predictedHomeScore} - {pred.predictedAwayScore}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                      {pred.pointsAwarded !== null ? (
                                        pred.pointsAwarded === 4 ? (
                                          <span className="px-3 py-1 rounded-full text-[10px] font-black bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.15)] uppercase tracking-wider">
                                            +4 Puan (Tam Skor)
                                          </span>
                                        ) : pred.pointsAwarded > 0 ? (
                                          <span className="px-3 py-1 rounded-full text-[10px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                                            +{pred.pointsAwarded} Puan (Sonuç)
                                          </span>
                                        ) : (
                                          <span className="px-3 py-1 rounded-full text-[10px] font-black bg-white/5 text-gray-500 border border-white/5 uppercase tracking-wider">
                                            0 Puan
                                          </span>
                                        )
                                      ) : (
                                        <span className="px-3 py-1 rounded-full text-[10px] font-black bg-white/5 text-gray-400 border border-white/5 uppercase tracking-wider animate-pulse">
                                          Bekleniyor
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td
                                  colSpan={3}
                                  className="px-6 py-8 text-center text-gray-500 font-bold italic text-sm"
                                >
                                  Bu maç için hiç tahmin yapılmamış.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
