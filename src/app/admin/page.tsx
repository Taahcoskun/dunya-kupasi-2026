"use client";

import { useEffect, useState } from "react";

type Match = {
  id: string;
  teamHome: string;
  teamAway: string;
  kickoffTime: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
};

export default function AdminPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    const res = await fetch("/api/matches");
    const data = await res.json();
    setMatches(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleUpdate = async (id: string, homeScore: string, awayScore: string, status: string) => {
    await fetch("/api/admin/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, homeScore, awayScore, status }),
    });
    fetchMatches();
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold text-blue-400 mb-8">Admin Dashboard</h1>
      <div className="space-y-4">
        {matches.map((match) => (
          <div key={match.id} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
            <div className="w-1/3">
              <div className="font-bold">{match.teamHome} vs {match.teamAway}</div>
              <div className="text-sm text-gray-400">{new Date(match.kickoffTime).toLocaleString()}</div>
            </div>
            <form
              className="flex gap-4 items-center"
              onSubmit={(e) => {
                e.preventDefault();
                const target = e.target as typeof e.target & {
                  homeScore: { value: string };
                  awayScore: { value: string };
                  status: { value: string };
                };
                handleUpdate(match.id, target.homeScore.value, target.awayScore.value, target.status.value);
              }}
            >
              <input
                name="homeScore"
                type="number"
                defaultValue={match.homeScore ?? ""}
                className="w-16 px-2 py-1 bg-gray-700 rounded text-center"
                placeholder="Home"
              />
              <span>-</span>
              <input
                name="awayScore"
                type="number"
                defaultValue={match.awayScore ?? ""}
                className="w-16 px-2 py-1 bg-gray-700 rounded text-center"
                placeholder="Away"
              />
              <select name="status" defaultValue={match.status} className="bg-gray-700 px-2 py-1 rounded">
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="LIVE">LIVE</option>
                <option value="FINISHED">FINISHED</option>
              </select>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded">
                Save
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
