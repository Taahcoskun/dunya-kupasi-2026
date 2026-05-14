const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const translations = {
  "Mexico": "Meksika",
  "South Africa": "Güney Afrika",
  "South Korea": "Güney Kore",
  "Czechia": "Çekya",
  "Canada": "Kanada",
  "Bosnia-Herzegovina": "Bosna-Hersek",
  "USA": "ABD",
  "Paraguay": "Paraguay",
  "Qatar": "Katar",
  "Switzerland": "İsviçre",
  "Brazil": "Brezilya",
  "Morocco": "Fas",
  "Haiti": "Haiti",
  "Scotland": "İskoçya",
  "Australia": "Avustralya",
  "Turkey": "Türkiye",
  "Germany": "Almanya",
  "Curacao": "Curaçao",
  "Curaçao": "Curaçao",
  "Netherlands": "Hollanda",
  "Japan": "Japonya",
  "Ivory Coast": "Fildişi Sahili",
  "Ecuador": "Ekvador",
  "Sweden": "İsveç",
  "Tunisia": "Tunus",
  "Spain": "İspanya",
  "Cape Verde": "Yeşil Burun Adaları",
  "Saudi Arabia": "Suudi Arabistan",
  "Uruguay": "Uruguay",
  "Iran": "İran",
  "New Zealand": "Yeni Zelanda",
  "France": "Fransa",
  "Senegal": "Senegal",
  "Iraq": "Irak",
  "Norway": "Norveç",
  "Argentina": "Arjantin",
  "Algeria": "Cezayir",
  "Austria": "Avusturya",
  "Jordan": "Ürdün",
  "Portugal": "Portekiz",
  "DR Congo": "Kongo DC",
  "Uzbekistan": "Özbekistan",
  "Colombia": "Kolombiya",
  "England": "İngiltere",
  "Croatia": "Hırvatistan",
  "Ghana": "Gana",
  "Panama": "Panama",
  "Belgium": "Belçika",
  "Egypt": "Mısır"
};

async function main() {
  console.log("Starting localization...");

  // Update Teams table
  const teams = await prisma.team.findMany();
  for (const team of teams) {
    if (translations[team.name] && translations[team.name] !== team.name) {
      await prisma.team.update({
        where: { id: team.id },
        data: { name: translations[team.name] }
      });
      console.log(`Translated team: ${team.name} -> ${translations[team.name]}`);
    }
  }

  // Update Matches table
  const matches = await prisma.match.findMany();
  for (const match of matches) {
    let updated = false;
    let newHome = match.teamHome;
    let newAway = match.teamAway;

    if (translations[match.teamHome] && translations[match.teamHome] !== match.teamHome) {
      newHome = translations[match.teamHome];
      updated = true;
    }
    
    if (translations[match.teamAway] && translations[match.teamAway] !== match.teamAway) {
      newAway = translations[match.teamAway];
      updated = true;
    }

    if (updated) {
      await prisma.match.update({
        where: { id: match.id },
        data: { teamHome: newHome, teamAway: newAway }
      });
      console.log(`Translated match: ${match.teamHome} vs ${match.teamAway} -> ${newHome} vs ${newAway}`);
    }
  }

  console.log("Database localization complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
