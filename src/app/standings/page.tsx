"use client";

import { useEffect, useState } from "react";
import { getFlagUrl } from "@/lib/teams";
import { Trophy, Users, Edit2, Check, X, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

type Team = {
  id: string;
  name: string;
  group: string;
  played: number;
  goalDiff: number;
  points: number;
};

export default function StandingsPage() {
  const { data: session } = useSession();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ played: 0, goalDiff: 0, points: 0 });
  const [updating, setUpdating] = useState(false);

  const isAdmin = session?.user?.name === "ADMIN" || (session?.user as any)?.role === "ADMIN";

  const fetchTeams = async () => {
    try {
      const res = await fetch("/api/teams");
      const data = await res.json();
      setTeams(data);
    } catch (error) {
      console.error("Failed to fetch teams", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleEdit = (team: Team) => {
    setEditingId(team.id);
    setEditValues({
      played: team.played,
      goalDiff: team.goalDiff,
      points: team.points
    });
  };

  const handleSave = async (id: string) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...editValues })
      });
      if (res.ok) {
        await fetchTeams();
        setEditingId(null);
      }
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setUpdating(false);
    }
  };

  const groups = Array.from(new Set(teams.map(t => t.group))).sort();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
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
          <h1 className="text-3xl md:text-5xl font-black text-center text-white mb-2 tracking-tight leading-tight">
            Puan <span className="text-gradient">Durumu</span>
          </h1>
          <p className="text-gray-400 text-center font-medium opacity-80">
            Dünya Kupası 2026 resmi grupları ve sıralamaları.
          </p>
          {isAdmin && (
            <div className="mt-4 bg-red-500/10 text-red-500 px-4 py-1 rounded-full text-[10px] font-black border border-red-500/20 tracking-widest uppercase">
              YÖNETİCİ MODU: DÜZENLEME AKTİF
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 fade-in-up delay-1">
          {groups.map((groupName) => (
            <div key={groupName} className="glass-dark rounded-[2rem] p-1 border border-white/5 shadow-2xl">
              <div className="bg-gray-900/50 rounded-[1.8rem] p-6 h-full">
                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                  <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                  {groupName.replace("Group", "Grup")}
                </h3>
                
                <div className="space-y-4">
                  <div className="flex text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">
                    <span className="flex-1">Takım</span>
                    <div className="flex gap-3 w-24 justify-end">
                      <span>O</span>
                      <span>AV</span>
                      <span>P</span>
                    </div>
                    {isAdmin && <span className="w-6 ml-2"></span>}
                  </div>
                  
                  {teams.filter(t => t.group === groupName).map((team, idx) => (
                    <div key={team.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group">
                      <span className="text-xs font-bold text-gray-600 w-4">{idx + 1}</span>
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 group-hover:border-blue-500/30 transition-colors">
                        <img src={getFlagUrl(team.name)} alt={team.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="flex-1 text-sm font-bold text-white truncate">{team.name}</span>
                      
                      {editingId === team.id ? (
                        <div className="flex gap-1 w-24 justify-end items-center">
                          <input 
                            type="number" 
                            value={editValues.played}
                            onChange={(e) => setEditValues({...editValues, played: parseInt(e.target.value)})}
                            className="w-7 bg-gray-800 border border-blue-500/50 rounded text-[10px] text-center text-white p-0.5"
                          />
                          <input 
                            type="number" 
                            value={editValues.goalDiff}
                            onChange={(e) => setEditValues({...editValues, goalDiff: parseInt(e.target.value)})}
                            className="w-7 bg-gray-800 border border-blue-500/50 rounded text-[10px] text-center text-white p-0.5"
                          />
                          <input 
                            type="number" 
                            value={editValues.points}
                            onChange={(e) => setEditValues({...editValues, points: parseInt(e.target.value)})}
                            className="w-7 bg-gray-800 border border-blue-500/50 rounded text-[10px] text-center text-white p-0.5"
                          />
                        </div>
                      ) : (
                        <div className="flex gap-3 w-24 justify-end text-sm font-bold">
                          <span className="text-gray-500 w-6 text-center tabular-nums">{team.played}</span>
                          <span className="text-gray-500 w-6 text-center tabular-nums">{team.goalDiff}</span>
                          <span className="text-blue-400 w-6 text-center tabular-nums">{team.points}</span>
                        </div>
                      )}

                      {isAdmin && (
                        <div className="flex gap-1 ml-2">
                          {editingId === team.id ? (
                            <>
                              <button onClick={() => handleSave(team.id)} disabled={updating} className="text-green-500 hover:text-green-400">
                                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                              </button>
                              <button onClick={() => setEditingId(null)} className="text-red-500 hover:text-red-400">
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button onClick={() => handleEdit(team)} className="text-gray-600 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
