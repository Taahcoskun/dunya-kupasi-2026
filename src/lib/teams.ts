export const teamFlags: { [key: string]: string } = {
  // Turkish Names
  "Meksika": "mx", "Güney Afrika": "za", "Güney Kore": "kr", "Çekya": "cz",
  "Kanada": "ca", "Bosna-Hersek": "ba", "ABD": "us", "Paraguay": "py",
  "Katar": "qa", "İsviçre": "ch", "Brezilya": "br", "Fas": "ma",
  "Haiti": "ht", "İskoçya": "gb-sct", "Avustralya": "au", "Türkiye": "tr",
  "Almanya": "de", "Curaçao": "cw", "Hollanda": "nl", "Japonya": "jp",
  "Fildişi Sahili": "ci", "Ekvador": "ec", "İsveç": "se", "Tunus": "tn",
  "İspanya": "es", "Belçika": "be", "Mısır": "eg", "Suudi Arabistan": "sa",
  "Uruguay": "uy", "İran": "ir", "Yeni Zelanda": "nz", "Fransa": "fr",
  "Senegal": "sn", "Irak": "iq", "Norveç": "no", "Arjantin": "ar",
  "Cezayir": "dz", "Avusturya": "at", "Ürdün": "jo", "Portekiz": "pt",
  "Kongo DC": "cd", "Özbekistan": "uz", "Kolombiya": "co", "İngiltere": "gb-eng",
  "Hırvatistan": "hr", "Gana": "gh", "Panama": "pa", "Yeşil Burun Adaları": "cv",

  // English Names
  "Mexico": "mx", "South Africa": "za", "South Korea": "kr", "Czechia": "cz",
  "Canada": "ca", "Bosnia-Herzegovina": "ba", "USA": "us", "Paraguay": "py",
  "Qatar": "qa", "Switzerland": "ch", "Brazil": "br", "Morocco": "ma",
  "Haiti": "ht", "Scotland": "gb-sct", "Australia": "au", "Turkey": "tr",
  "Germany": "de", "Curacao": "cw", "Netherlands": "nl", "Japan": "jp",
  "Ivory Coast": "ci", "Ecuador": "ec", "Sweden": "se", "Tunisia": "tn",
  "Spain": "es", "Belgium": "be", "Egypt": "eg", "Saudi Arabia": "sa",
  "Uruguay": "uy", "Iran": "ir", "New Zealand": "nz", "France": "fr",
  "Senegal": "sn", "Iraq": "iq", "Norway": "no", "Argentina": "ar",
  "Algeria": "dz", "Austria": "at", "Jordan": "jo", "Portugal": "pt",
  "DR Congo": "cd", "Uzbekistan": "uz", "Colombia": "co", "England": "gb-eng",
  "Croatia": "hr", "Ghana": "gh", "Panama": "pa", "Cape Verde": "cv",
  "Bosnia-Herzegovina": "ba"
};

export function getFlagUrl(teamName: string): string {
  const code = teamFlags[teamName];
  if (!code) return `https://flagcdn.com/w80/un.png`; // Fallback to UN flag
  return `https://flagcdn.com/w80/${code}.png`;
}
