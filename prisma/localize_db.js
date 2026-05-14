const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const translationMap = {
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
  "Netherlands": "Hollanda",
  "Japan": "Japonya",
  "Ivory Coast": "Fildişi Sahili",
  "Ecuador": "Ekvador",
  "Sweden": "İsveç",
  "Tunisia": "Tunus",
  "Spain": "İspanya",
  "Belgium": "Belçika",
  "Egypt": "Mısır",
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
  "Cape Verde": "Yeşil Burun Adaları"
};

async function main() {
  // Update Teams
  const teams = await prisma.team.findMany();
  for (const team of teams) {
    const turkishName = translationMap[team.name];
    if (turkishName) {
      await prisma.team.update({
        where: { id: team.id },
        data: { name: turkishName }
      });
      console.log(`Updated team: ${team.name} -> ${turkishName}`);
    }
  }

  // Update Matches
  const matches = await prisma.match.findMany();
  for (const match of matches) {
    const turkishHome = translationMap[match.teamHome];
    const turkishAway = translationMap[match.teamAway];
    
    await prisma.match.update({
      where: { id: match.id },
      data: {
        teamHome: turkishHome || match.teamHome,
        teamAway: turkishAway || match.teamAway
      }
    });
    console.log(`Updated match: ${match.teamHome} vs ${match.teamAway}`);
  }

  console.log("Database localization complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
