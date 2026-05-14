const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const groups = [
    { name: "Group A", teams: ["Mexico", "South Africa", "South Korea", "Czechia"] },
    { name: "Group B", teams: ["Canada", "Bosnia-Herzegovina", "Qatar", "Switzerland"] },
    { name: "Group C", teams: ["Brazil", "Morocco", "Haiti", "Scotland"] },
    { name: "Group D", teams: ["USA", "Paraguay", "Turkey", "Australia"] },
    { name: "Group E", teams: ["Germany", "Curaçao", "Ivory Coast", "Ecuador"] },
    { name: "Group F", teams: ["Netherlands", "Japan", "Sweden", "Tunisia"] },
    { name: "Group G", teams: ["Belgium", "Egypt", "Iran", "New Zealand"] },
    { name: "Group H", teams: ["Spain", "Cape Verde", "Saudi Arabia", "Uruguay"] },
    { name: "Group I", teams: ["France", "Senegal", "Iraq", "Norway"] },
    { name: "Group J", teams: ["Argentina", "Algeria", "Austria", "Jordan"] },
    { name: "Group K", teams: ["Portugal", "DR Congo", "Uzbekistan", "Colombia"] },
    { name: "Group L", teams: ["England", "Croatia", "Ghana", "Panama"] },
  ];

  let matches = [];
  
  // Week 2 kickoff starts from June 18
  let week2Date = new Date("2026-06-18T16:00:00Z");
  // Week 3 kickoff starts from June 23
  let week3Date = new Date("2026-06-23T16:00:00Z");

  for (const group of groups) {
    const t1 = group.teams[0];
    const t2 = group.teams[1];
    const t3 = group.teams[2];
    const t4 = group.teams[3];

    // Week 2
    matches.push({ teamHome: t1, teamAway: t3, kickoffTime: new Date(week2Date) });
    week2Date.setHours(week2Date.getHours() + 3);
    
    matches.push({ teamHome: t4, teamAway: t2, kickoffTime: new Date(week2Date) });
    week2Date.setHours(week2Date.getHours() + 3);

    // Week 3
    matches.push({ teamHome: t1, teamAway: t4, kickoffTime: new Date(week3Date) });
    week3Date.setHours(week3Date.getHours() + 3);
    
    matches.push({ teamHome: t2, teamAway: t3, kickoffTime: new Date(week3Date) });
    week3Date.setHours(week3Date.getHours() + 3);
  }

  const existingMatches = await prisma.match.findMany();
  let addedCount = 0;

  for (const m of matches) {
    // Only add if they haven't played each other
    const exists = existingMatches.find(ex => 
      (ex.teamHome === m.teamHome && ex.teamAway === m.teamAway) ||
      (ex.teamHome === m.teamAway && ex.teamAway === m.teamHome)
    );
    if (!exists) {
      await prisma.match.create({
        data: {
          teamHome: m.teamHome,
          teamAway: m.teamAway,
          kickoffTime: m.kickoffTime,
          status: "SCHEDULED"
        }
      });
      addedCount++;
    }
  }

  console.log(`Successfully added ${addedCount} missing matches for Week 2 and Week 3!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
