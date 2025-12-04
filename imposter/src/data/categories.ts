export type Category = { name: string; words: string[] }

// NOTE: This is a minimal seed list to get started.
// The spec requires ~500 words across 10 categories.
// Expand these lists later or load from an external JSON.
export const CATEGORIES: Category[] = [
  { name: 'Mat', words: [
    'Banan','Pizza','Sjokolade','Brokkoli','Brød','Suppe','Ost','Yoghurt','Kylling','Laks','Ramen','Taco','Pasta','Hamburger','Salat','Skinke','Speilegg','Avokado','Potet','Rødbete',
    'Eple','Pære','Appelsin','Druer','Jordbær','Blåbær','Bringebær','Vannmelon','Honningmelon','Ananas','Mango','Papaya','Kiwi','Sitron','Lime',
    'Tomat','Agurk','Paprika','Gulrot','Løk','Hvitløk','Spinat','Salatblad','Mais','Erter','Bønner','Linser','Kikert','Ris','Bygg',
    'Havregryn','Granola','Müsli','Ytterfilet','Indrefilet','Bacon','Pølse','Kjøttkake','Kjøttdeig','Fiskekake','Fiskeboller','Reker','Krabbe','Torsk','Sei',
    'Rømme','Krem','Smør','Margarin','Majones','Ketchup','Sennep','Pesto','Aioli','Salsa','Soyasaus','Teriyaki','BBQ','Chili',
    'Flatbrød','Knekkebrød','Bagett','Croissant','Bolle','Kanelbolle','Muffins','Kake','Pai','Vaffel','Pannekake','Lefse','Pinnekjøtt','Ribbe'
  ] },
  { name: 'Filmer', words: [
    'Titanic','Inception','Avatar','Matrix','Joker','Amélie','Interstellar','Gladiator','Casablanca','Forrest Gump','Parasitt','La La Land','Gudfaren','Pulp Fiction','The Dark Knight',
    'Star Wars','Ringenes Herre','Hobbiten','E.T.','Jurassic Park','Terminator','Alien','Blade Runner','Mad Max','Top Gun','Rocky','Karate Kid','The Shawshank Redemption','Fight Club',
    'Se7en','The Prestige','Memento','Goodfellas','Braveheart','The Lion King','Up','Inside Out','Coco','Toy Story','Wall-E','Finding Nemo','Monsters Inc','Frozen',
    'The Social Network','Whiplash','La vita è bella','The Pianist','Schindlers Liste','The Green Mile','A Beautiful Mind','No Country for Old Men','There Will Be Blood','Her'
  ] },
  { name: 'Jobber', words: [
    'Lærer','Lege','Ingeniør','Kokk','Snekker','Pilot','Sykepleier','Designer','Programmerer','Advokat','Journalist','Elektriker','Rørlegger','Bonde','Politi',
    'Brannmann','Tannlege','Fotograf','Musiker','Skuespiller','Arkitekt','Psykolog','Økonom','Revisor','Butikkmedarbeider','Servitør','Baker','Slakter','Barnehageassistent','Forsker',
    'Biolog','Geolog','Kjemiker','Fysiker','Astronom','Bibliotekar','Kunstner','Forfatter','Oversetter','Tolken','Pilot','Flyvertinne','Togfører','Bussjåfør','Lagerarbeider'
  ] },
  { name: 'Dyr', words: [
    'Hund','Katt','Elefant','Løve','Ugle','Delfin','Giraff','Panda','Rev','Hest','Sjøløve','Pingvin','Skilpadde','Kenguru','Ulv',
    'Björn','Isbjørn','Grevling','Ekorn','Hare','Kanin','Ravn','Ørn','Hauk','Spurv','Svale','And','Gås','Svane','Høne',
    'Kylling','Kalkun','Oter','Bever','Mink','Gaupe','Rådyr','Elg','Hjort','Moskus','Hval','Spekkhogger','Hai','Sild','Makrell'
  ] },
  { name: 'Steder', words: [
    'Oslo','Skole','Sykehus','Flyplass','Museum','Bibliotek','Kafé','Park','Stadion','Teater','Torg','Strand','Fjellhytte','Kontor','Kjøpesenter',
    'Kirke','Rådhus','Slott','Festning','Campingplass','Hyttefelt','Brygge','Havn','Terminal','Stasjon','Stoppested','Bensinstasjon','Rundkjøring','Motorvei','Tunnel',
    'Bro','Fjell','Dal','Øy','Skjærgård','By','Grend','Forstad','Villastrøk','Industriområde','Nabolag','Marka','Nasjonalpark','Uteområde','Plass'
  ] },
  { name: 'Hjemme', words: [
    'Sofa','TV','Lampe','Teppe','Vase','Stol','Bord','Komfyr','Kjøleskap','Seng','Putetrekk','Gardiner','Bokhylle','Vaskemaskin','Speil',
    'Oppvaskmaskin','Mikrobølgeovn','Brødrister','Vannkoker','Kaffetrakter','Safebox','Skittentøyskurv','Klesskap','Kommode','Nattbord','Dørmatte','Støvsuger','Strykejern','Hårføner','Tannbørste',
    'Tannkrem','Såpe','Sjampo','Oppvaskmiddel','Klut','Bøtte','Mopp','Fjernkontroll','Router','Modem','Lader','Adapter','USB-kabel','Lysbryter','Stikkontakt'
  ] },
  { name: 'Sport', words: [
    'Fotball','Ski','Tennis','Basket','Svømming','Håndball','Volleyball','Golf','Snowboard','Friidrett','Badminton','Boksing','Rugby','Sykling','Skøyter',
    'Langrenn','Alpint','Skihopp','Skiskyting','Cricket','Baseball','Softball','Squash','Padel','Bueskyting','Klatring','Surfing','Seiling','Roing','Kajakk',
    'Fekting','Judo','Karate','Taekwondo','Sumo','Vektløfting','Crossfit','Triatlon','Maraton','Sprint','Stafett','Diskos','Spyd','Kule','Hekk'
  ] },
  { name: 'Klær', words: [
    'Genser','Bukse','Skjorte','Sko','Jakke','Hatt','Skjerf','Kjole','T-skjorte','Shorts','Belte','Sokker','Kåpe','Blazer','Treningsdress',
    'Caps','Lue','Votter','Hansker','Støvler','Sandaler','Sneakers','Joggesko','Slips','Flosshatt','Topp','Cardigan','Pyjamas','Undertøy','BH',
    'Skjørt','Strømpebukse','Knestrømper','Tights','Treningsshorts','Regnjakke','Fleece','Dunjakke','Dress','Drakt','Arbeidsklær','Refleksvest','Forkle','Smokking','Seler'
  ] },
  { name: 'Natur', words: [
    'Fjell','Elv','Skog','Strand','Hav','Isbre','Vulkan','Foss','Ljung','Ørken','Eng','Slette','Hule','Kløft','Tundra',
    'Løype','Myr','Bekk','Ildflue','Snø','Regn','Hagl','Torden','Lyn','Soloppgang','Solnedgang','Nordlys','Måne','Stjerne','Meteor',
    'Klippe','Knaus','Svaberg','Skjær','Korall','Lagune','Bukt','Fjord','Vik','Sjø','Sjøsprøyt','Tidevann','Bølge','Strømm','Vind'
  ] },
  { name: 'Kjente Mennesker', words: [
    'Einstein','Beyoncé','Elon Musk','Messi','Frida Kahlo','Greta Thunberg','Marie Curie','Leonardo da Vinci','Adele','Ronaldo','Obama','Madonna','Oprah','Newton','Usain Bolt',
    'Taylor Swift','Ed Sheeran','Ariana Grande','Bill Gates','Steve Jobs','Mark Zuckerberg','Angelina Jolie','Brad Pitt','Tom Hanks','Meryl Streep','Keanu Reeves','Emma Watson','Daniel Radcliffe','Harrison Ford','Scarlett Johansson',
    'Dalai Lama','Pave Frans','Nelson Mandela','Malala Yousafzai','Serena Williams','Roger Federer','Novak Djokovic','Michael Jordan','LeBron James','Stephen Curry','Lionel Messi','Diego Maradona','Zinedine Zidane','Kylian Mbappé','Erling Haaland'
  ] },
]
