(() => {
  // Culture-aware name pools. Each entry: { male[], female[], last[] }.
  // Used by createNewLife and the NPC factory so a random life in any country
  // gets locally plausible names instead of always-Russian ones.
  const pools = {
    ru: {
      male: ["Алексей", "Иван", "Михаил", "Даниил", "Сергей", "Никита", "Артём", "Дмитрий"],
      female: ["Анна", "Мария", "Елена", "Ольга", "София", "Ирина", "Алиса", "Наталья"],
      last: ["Смирнов", "Иванов", "Кузнецов", "Соколов", "Лебедев", "Новиков", "Морозов", "Волков"],
    },
    ua: {
      male: ["Олександр", "Андрій", "Богдан", "Дмитро", "Тарас", "Остап", "Назар", "Ярослав"],
      female: ["Оксана", "Іванна", "Соломія", "Леся", "Марічка", "Ярина", "Наталя", "Олена"],
      last: ["Шевченко", "Коваленко", "Бондаренко", "Ткаченко", "Кравченко", "Мельник", "Бойко", "Гриценко"],
    },
    pl: {
      male: ["Jakub", "Kacper", "Filip", "Szymon", "Mateusz", "Piotr", "Marek", "Tomasz"],
      female: ["Zofia", "Lena", "Maja", "Julia", "Anna", "Katarzyna", "Magdalena", "Agnieszka"],
      last: ["Nowak", "Kowalski", "Wiśniewski", "Wójcik", "Kowalczyk", "Kamiński", "Lewandowski", "Zieliński"],
    },
    kz: {
      male: ["Нурлан", "Айдар", "Ержан", "Дамир", "Арман", "Тимур", "Бекзат", "Алибек"],
      female: ["Айгерим", "Дана", "Аружан", "Жанель", "Камила", "Назым", "Сауле", "Алия"],
      last: ["Ахметов", "Оспанов", "Серікұлы", "Нұрланов", "Болатов", "Темірбеков", "Сұлтанов", "Жақсыбеков"],
    },
    us: {
      male: ["James", "Michael", "William", "Ethan", "Mason", "Liam", "Noah", "Daniel"],
      female: ["Emily", "Olivia", "Ava", "Sophia", "Madison", "Emma", "Chloe", "Grace"],
      last: ["Smith", "Johnson", "Williams", "Brown", "Carter", "Davis", "Miller", "Wilson"],
    },
    ca: {
      male: ["Liam", "Noah", "William", "Olivier", "Lucas", "Nathan", "Felix", "Thomas"],
      female: ["Olivia", "Emma", "Charlotte", "Léa", "Florence", "Alice", "Sophia", "Camille"],
      last: ["Tremblay", "Gagnon", "Roy", "Smith", "Brown", "Côté", "Bouchard", "Wilson"],
    },
    gb: {
      male: ["Oliver", "Harry", "George", "Jack", "Charlie", "Thomas", "James", "Henry"],
      female: ["Olivia", "Amelia", "Isla", "Ava", "Emily", "Sophie", "Grace", "Charlotte"],
      last: ["Smith", "Jones", "Taylor", "Brown", "Williams", "Wilson", "Evans", "Thomas"],
    },
    ie: {
      male: ["Conor", "Seán", "Cian", "Liam", "Patrick", "Oisín", "Darragh", "Eoin"],
      female: ["Saoirse", "Aoife", "Ciara", "Niamh", "Caoimhe", "Emma", "Róisín", "Síne"],
      last: ["Murphy", "Kelly", "O'Brien", "Ryan", "O'Sullivan", "Walsh", "Byrne", "O'Connor"],
    },
    de: {
      male: ["Lukas", "Leon", "Paul", "Felix", "Maximilian", "Jonas", "Elias", "Noah"],
      female: ["Mia", "Emma", "Hannah", "Lena", "Lea", "Sophie", "Marie", "Laura"],
      last: ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Wagner", "Becker", "Hoffmann"],
    },
    at: {
      male: ["Lukas", "Tobias", "David", "Florian", "Felix", "Jakob", "Sebastian", "Matthias"],
      female: ["Anna", "Lena", "Sarah", "Hannah", "Julia", "Lena", "Sophie", "Marie"],
      last: ["Gruber", "Huber", "Bauer", "Wagner", "Müller", "Pichler", "Steiner", "Moser"],
    },
    ch: {
      male: ["Noah", "Liam", "Luca", "Elias", "Leon", "David", "Julian", "Tim"],
      female: ["Mia", "Emma", "Lena", "Lara", "Elena", "Sophie", "Laura", "Anna"],
      last: ["Müller", "Meier", "Schmid", "Keller", "Weber", "Huber", "Schneider", "Brunner"],
    },
    fr: {
      male: ["Lucas", "Hugo", "Louis", "Gabriel", "Jules", "Nathan", "Raphaël", "Léo"],
      female: ["Emma", "Jade", "Louise", "Alice", "Chloé", "Léa", "Manon", "Camille"],
      last: ["Martin", "Bernard", "Dubois", "Durand", "Moreau", "Laurent", "Lefebvre", "Girard"],
    },
    be: {
      male: ["Louis", "Arthur", "Lucas", "Liam", "Noah", "Victor", "Jules", "Adam"],
      female: ["Emma", "Louise", "Olivia", "Marie", "Léa", "Juliette", "Alice", "Lina"],
      last: ["Peeters", "Janssens", "Maes", "Jacobs", "Dubois", "Lambert", "Willems", "Claes"],
    },
    nl: {
      male: ["Daan", "Sem", "Lucas", "Finn", "Lars", "Bram", "Sven", "Thijs"],
      female: ["Emma", "Julia", "Sophie", "Mila", "Tess", "Anna", "Sara", "Lotte"],
      last: ["De Jong", "Jansen", "De Vries", "Van den Berg", "Bakker", "Visser", "Smit", "Meijer"],
    },
    es: {
      male: ["Hugo", "Daniel", "Pablo", "Álvaro", "Adrián", "Diego", "Mateo", "Javier"],
      female: ["Lucía", "Sofía", "Martina", "María", "Paula", "Carmen", "Valeria", "Daniela"],
      last: ["García", "Martínez", "López", "Sánchez", "González", "Rodríguez", "Fernández", "Gómez"],
    },
    pt: {
      male: ["João", "Rodrigo", "Martim", "Tomás", "Afonso", "Diogo", "Gonçalo", "Miguel"],
      female: ["Maria", "Matilde", "Leonor", "Beatriz", "Mariana", "Inês", "Carolina", "Ana"],
      last: ["Silva", "Santos", "Ferreira", "Pereira", "Oliveira", "Costa", "Rodrigues", "Martins"],
    },
    it: {
      male: ["Francesco", "Alessandro", "Lorenzo", "Matteo", "Leonardo", "Andrea", "Gabriele", "Marco"],
      female: ["Sofia", "Giulia", "Aurora", "Alice", "Emma", "Chiara", "Martina", "Sara"],
      last: ["Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Greco"],
    },
    gr: {
      male: ["Georgios", "Dimitris", "Konstantinos", "Nikos", "Yiannis", "Andreas", "Christos", "Panagiotis"],
      female: ["Maria", "Eleni", "Katerina", "Sofia", "Georgia", "Dimitra", "Anna", "Ioanna"],
      last: ["Papadopoulos", "Nikolaou", "Georgiou", "Dimitriou", "Vasileiou", "Pappas", "Antoniou", "Makris"],
    },
    cz: {
      male: ["Jakub", "Jan", "Tomáš", "Adam", "Matěj", "Vojtěch", "Lukáš", "Petr"],
      female: ["Eliška", "Tereza", "Anna", "Adéla", "Natálie", "Karolína", "Kateřina", "Veronika"],
      last: ["Novák", "Svoboda", "Novotný", "Dvořák", "Černý", "Procházka", "Kučera", "Veselý"],
    },
    hu: {
      male: ["Bence", "Máté", "Levente", "Dávid", "Ádám", "Balázs", "Gergő", "Zoltán"],
      female: ["Anna", "Hanna", "Zsófia", "Léna", "Luca", "Eszter", "Réka", "Petra"],
      last: ["Nagy", "Kovács", "Tóth", "Szabó", "Horváth", "Varga", "Kiss", "Molnár"],
    },
    ro: {
      male: ["Andrei", "Alexandru", "Mihai", "David", "Ștefan", "Gabriel", "Florin", "Cristian"],
      female: ["Maria", "Andreea", "Elena", "Ioana", "Gabriela", "Alexandra", "Bianca", "Diana"],
      last: ["Popescu", "Ionescu", "Popa", "Dumitru", "Stan", "Gheorghe", "Constantin", "Marin"],
    },
    by: {
      male: ["Уладзіслаў", "Максім", "Артур", "Ягор", "Дзяніс", "Мікіта", "Раман", "Цімафей"],
      female: ["Алеся", "Наста", "Кацярына", "Вольга", "Ірына", "Дар'я", "Ганна", "Марыя"],
      last: ["Каваленка", "Іваноў", "Сідаровіч", "Васілеўскі", "Бандарэнка", "Шумскі", "Лукашэвіч", "Сакалоў"],
    },
    ge: {
      male: ["Giorgi", "Luka", "Nikoloz", "Saba", "Davit", "Tornike", "Irakli", "Beka"],
      female: ["Nino", "Mariam", "Tamar", "Ana", "Salome", "Elene", "Natia", "Khatia"],
      last: ["Beridze", "Kapanadze", "Giorgadze", "Lomidze", "Tsiklauri", "Maisuradze", "Gelashvili", "Kvaratskhelia"],
    },
    se: {
      male: ["Lucas", "William", "Liam", "Oscar", "Hugo", "Elias", "Axel", "Erik"],
      female: ["Alice", "Maja", "Elsa", "Astrid", "Wilma", "Freja", "Saga", "Ebba"],
      last: ["Andersson", "Johansson", "Karlsson", "Nilsson", "Eriksson", "Larsson", "Olsson", "Lindberg"],
    },
    no: {
      male: ["Jakob", "Emil", "Noah", "Oliver", "Lucas", "Henrik", "Magnus", "Sander"],
      female: ["Nora", "Emma", "Sara", "Ingrid", "Maja", "Sofie", "Frida", "Ida"],
      last: ["Hansen", "Johansen", "Olsen", "Larsen", "Andersen", "Nilsen", "Pedersen", "Berg"],
    },
    fi: {
      male: ["Eino", "Väinö", "Onni", "Leo", "Elias", "Aaro", "Niilo", "Juho"],
      female: ["Aino", "Aada", "Eevi", "Helmi", "Sofia", "Venla", "Emma", "Ella"],
      last: ["Korhonen", "Virtanen", "Mäkinen", "Nieminen", "Mäkelä", "Hämäläinen", "Laine", "Heikkinen"],
    },
    dk: {
      male: ["William", "Oscar", "Lucas", "Emil", "Victor", "Magnus", "Frederik", "Noah"],
      female: ["Emma", "Ida", "Clara", "Laura", "Sofia", "Freja", "Alma", "Josefine"],
      last: ["Nielsen", "Jensen", "Hansen", "Pedersen", "Andersen", "Christensen", "Larsen", "Sørensen"],
    },
    jp: {
      male: ["Haruto", "Souta", "Yuto", "Haruki", "Riku", "Ren", "Kaito", "Sora"],
      female: ["Haruka", "Yui", "Aoi", "Hina", "Sakura", "Mei", "Rin", "Yuna"],
      last: ["Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe", "Ito", "Yamamoto", "Nakamura"],
    },
    cn: {
      male: ["Wei", "Hao", "Jun", "Lei", "Ming", "Bo", "Yang", "Chen"],
      female: ["Li", "Fang", "Yan", "Jing", "Xue", "Mei", "Na", "Ying"],
      last: ["Wang", "Li", "Zhang", "Liu", "Chen", "Yang", "Huang", "Zhao"],
    },
    kr: {
      male: ["Min-jun", "Seo-jun", "Do-yun", "Ji-ho", "Joon-woo", "Hyun-woo", "Ji-hoon", "Eun-woo"],
      female: ["Seo-yeon", "Ha-eun", "Ji-woo", "Min-seo", "Soo-ah", "Ji-yu", "Chae-won", "Yoon-seo"],
      last: ["Kim", "Lee", "Park", "Choi", "Jung", "Kang", "Cho", "Yoon"],
    },
    in: {
      male: ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Reyansh", "Krishna", "Ishaan"],
      female: ["Aadhya", "Ananya", "Diya", "Saanvi", "Aanya", "Pari", "Anika", "Navya"],
      last: ["Sharma", "Verma", "Patel", "Gupta", "Singh", "Kumar", "Reddy", "Nair"],
    },
    id: {
      male: ["Budi", "Adi", "Eko", "Dwi", "Putra", "Bayu", "Rizki", "Agus"],
      female: ["Siti", "Dewi", "Sri", "Putri", "Ayu", "Indah", "Wulan", "Rina"],
      last: ["Wijaya", "Saputra", "Pratama", "Hidayat", "Santoso", "Nugroho", "Halim", "Gunawan"],
    },
    th: {
      male: ["Somchai", "Anan", "Chai", "Krit", "Nat", "Phong", "Surasak", "Wirat"],
      female: ["Suda", "Malee", "Ploy", "Nok", "Kanya", "Pim", "Siri", "Wan"],
      last: ["Saetang", "Srisuk", "Boonmee", "Chaiyaphum", "Phongsri", "Wattana", "Rattana", "Suwan"],
    },
    vn: {
      male: ["Anh", "Minh", "Tuan", "Hung", "Nam", "Khang", "Phong", "Bao"],
      female: ["Linh", "Huong", "Mai", "Thao", "Trang", "Ngoc", "Lan", "Ha"],
      last: ["Nguyen", "Tran", "Le", "Pham", "Hoang", "Phan", "Vu", "Dang"],
    },
    sg: {
      male: ["Wei", "Jun", "Hao", "Ryan", "Marcus", "Aiden", "Jayden", "Ethan"],
      female: ["Hui", "Mei", "Xin", "Chloe", "Sophie", "Faith", "Hannah", "Cheryl"],
      last: ["Tan", "Lim", "Lee", "Ng", "Wong", "Goh", "Chua", "Koh"],
    },
    my: {
      male: ["Adam", "Ahmad", "Aiman", "Daniel", "Haziq", "Irfan", "Aqil", "Danish"],
      female: ["Nur", "Aisyah", "Sofia", "Hana", "Alya", "Maya", "Iman", "Sarah"],
      last: ["bin Abdullah", "Tan", "Lee", "Lim", "Ismail", "Rahman", "Hassan", "Yusof"],
    },
    ph: {
      male: ["Jose", "Juan", "Mark", "John", "Angelo", "Paolo", "Carlo", "Miguel"],
      female: ["Maria", "Andrea", "Angel", "Sofia", "Nicole", "Camille", "Patricia", "Bea"],
      last: ["Santos", "Reyes", "Cruz", "Bautista", "Garcia", "Ramos", "Mendoza", "Torres"],
    },
    tr: {
      male: ["Yusuf", "Mustafa", "Mehmet", "Emir", "Ahmet", "Ali", "Eymen", "Berat"],
      female: ["Zeynep", "Elif", "Defne", "Azra", "Asel", "Ecrin", "Nehir", "Ela"],
      last: ["Yılmaz", "Kaya", "Demir", "Şahin", "Çelik", "Yıldız", "Yıldırım", "Öztürk"],
    },
    ae: {
      male: ["Mohammed", "Ahmed", "Ali", "Omar", "Khalid", "Hamdan", "Saeed", "Rashid"],
      female: ["Fatima", "Aisha", "Mariam", "Noura", "Sara", "Hessa", "Latifa", "Shamma"],
      last: ["Al Maktoum", "Al Nahyan", "Al Mansoori", "Al Suwaidi", "Al Falasi", "Al Marri", "Al Shamsi", "Al Hashimi"],
    },
    sa: {
      male: ["Abdullah", "Mohammed", "Faisal", "Saud", "Khalid", "Fahad", "Sultan", "Nawaf"],
      female: ["Norah", "Sara", "Reem", "Lama", "Hala", "Aljohara", "Maha", "Dana"],
      last: ["Al Saud", "Al Qahtani", "Al Ghamdi", "Al Otaibi", "Al Harbi", "Al Shehri", "Al Dossari", "Al Zahrani"],
    },
    il: {
      male: ["Noam", "Itai", "Ariel", "David", "Yosef", "Daniel", "Eitan", "Uri"],
      female: ["Noa", "Tamar", "Shira", "Maya", "Yael", "Avigail", "Talia", "Lia"],
      last: ["Cohen", "Levi", "Mizrahi", "Peretz", "Biton", "Friedman", "Avraham", "Dahan"],
    },
    eg: {
      male: ["Mohamed", "Ahmed", "Mahmoud", "Omar", "Youssef", "Khaled", "Mostafa", "Hassan"],
      female: ["Mariam", "Nour", "Sara", "Habiba", "Salma", "Farida", "Yasmin", "Malak"],
      last: ["Hassan", "Ibrahim", "Ali", "Mahmoud", "Abdelrahman", "El-Sayed", "Mostafa", "Farouk"],
    },
    ng: {
      male: ["Chidi", "Emeka", "Tunde", "Bola", "Ifeanyi", "Kunle", "Obi", "Segun"],
      female: ["Ngozi", "Amara", "Chioma", "Folake", "Yetunde", "Adaeze", "Funke", "Zainab"],
      last: ["Okafor", "Okonkwo", "Adeyemi", "Balogun", "Eze", "Ibrahim", "Olawale", "Nwosu"],
    },
    za: {
      male: ["Sipho", "Thabo", "Lungelo", "Bandile", "Kagiso", "Liam", "Daniel", "Themba"],
      female: ["Lerato", "Naledi", "Thandiwe", "Nomvula", "Amahle", "Zanele", "Ayanda", "Palesa"],
      last: ["Nkosi", "Dlamini", "Khumalo", "Mokoena", "Ndlovu", "Botha", "Van der Merwe", "Mthembu"],
    },
    ke: {
      male: ["Kamau", "Otieno", "Mwangi", "Kipchoge", "Juma", "Omondi", "Wanjala", "Kibet"],
      female: ["Wanjiru", "Akinyi", "Njeri", "Chebet", "Amani", "Wairimu", "Achieng", "Nyambura"],
      last: ["Kamau", "Otieno", "Mwangi", "Wanjiru", "Kiprop", "Ochieng", "Njoroge", "Mutua"],
    },
    br: {
      male: ["Miguel", "Arthur", "Heitor", "Davi", "Gabriel", "Bernardo", "Lucas", "Matheus"],
      female: ["Helena", "Alice", "Laura", "Manuela", "Valentina", "Sophia", "Júlia", "Beatriz"],
      last: ["Silva", "Santos", "Oliveira", "Souza", "Lima", "Pereira", "Ferreira", "Costa"],
    },
    mx: {
      male: ["Santiago", "Mateo", "Sebastián", "Diego", "Leonardo", "Emiliano", "Miguel", "Daniel"],
      female: ["Sofía", "Valentina", "Regina", "María", "Ximena", "Camila", "Renata", "Daniela"],
      last: ["Hernández", "García", "Martínez", "López", "González", "Pérez", "Rodríguez", "Sánchez"],
    },
    ar: {
      male: ["Mateo", "Benjamín", "Felipe", "Joaquín", "Thiago", "Bautista", "Lautaro", "Santino"],
      female: ["Sofía", "Martina", "Catalina", "Valentina", "Emma", "Mía", "Isabella", "Olivia"],
      last: ["González", "Rodríguez", "Gómez", "Fernández", "López", "Díaz", "Martínez", "Pérez"],
    },
    cl: {
      male: ["Benjamín", "Vicente", "Martín", "Agustín", "Matías", "Tomás", "Maximiliano", "Joaquín"],
      female: ["Sofía", "Isidora", "Florencia", "Emilia", "Antonella", "Catalina", "Josefa", "Trinidad"],
      last: ["González", "Muñoz", "Rojas", "Díaz", "Pérez", "Soto", "Contreras", "Silva"],
    },
    co: {
      male: ["Santiago", "Samuel", "Matías", "Sebastián", "Martín", "Tomás", "Emiliano", "Andrés"],
      female: ["Sofía", "Isabella", "Valentina", "Salomé", "Mariana", "Luciana", "Gabriela", "Antonella"],
      last: ["Rodríguez", "Gómez", "González", "Martínez", "García", "López", "Ramírez", "Moreno"],
    },
    au: {
      male: ["Oliver", "Jack", "William", "Noah", "Thomas", "Henry", "Lucas", "Cooper"],
      female: ["Charlotte", "Olivia", "Ava", "Amelia", "Mia", "Isla", "Grace", "Chloe"],
      last: ["Smith", "Jones", "Williams", "Brown", "Wilson", "Taylor", "Nguyen", "Walker"],
    },
    nz: {
      male: ["Oliver", "Jack", "Noah", "Leo", "William", "Charlie", "Cooper", "Mason"],
      female: ["Charlotte", "Isla", "Olivia", "Amelia", "Mia", "Harper", "Ella", "Grace"],
      last: ["Smith", "Williams", "Brown", "Wilson", "Taylor", "Thompson", "Te Rangi", "Anderson"],
    },
  };

  // Sample full names used for creator placeholders (representative, friendly).
  const samples = {
    ru: "Анна Соколова", ua: "Іванна Шевченко", pl: "Zofia Nowak", kz: "Айгерим Ахметова",
    us: "Emily Carter", ca: "Olivia Tremblay", gb: "Olivia Smith", ie: "Aoife Murphy",
    de: "Lukas Schneider", at: "Anna Gruber", ch: "Mia Müller", fr: "Emma Martin",
    be: "Louise Peeters", nl: "Emma De Vries", es: "Lucía García", pt: "Maria Silva",
    it: "Sofia Rossi", gr: "Maria Papadopoulos", cz: "Eliška Novák", hu: "Anna Nagy",
    ro: "Maria Popescu", by: "Алеся Каваленка", ge: "Nino Beridze",
    se: "Alice Andersson", no: "Nora Hansen", fi: "Aino Korhonen", dk: "Emma Nielsen",
    jp: "Haruka Sato", cn: "Li Wang", kr: "Seo-yeon Kim", in: "Aadhya Sharma",
    id: "Dewi Wijaya", th: "Ploy Srisuk", vn: "Linh Nguyen", sg: "Chloe Tan",
    my: "Aisyah Rahman", ph: "Maria Santos", tr: "Zeynep Yılmaz", ae: "Fatima Al Mansoori",
    sa: "Norah Al Saud", il: "Noa Cohen", eg: "Nour Hassan", ng: "Amara Okafor",
    za: "Lerato Nkosi", ke: "Wanjiru Kamau", br: "Helena Silva", mx: "Sofía Hernández",
    ar: "Sofía González", cl: "Sofía González", co: "Sofía Rodríguez", au: "Charlotte Smith", nz: "Isla Williams",
  };

  // When a country has no explicit pool, fall back to a culturally close one.
  const regionDefault = {
    europe_east: "ru",
    europe_west: "fr",
    europe_north: "se",
    north_america: "us",
    latin_america: "mx",
    middle_east: "ae",
    africa: "ng",
    south_asia: "in",
    east_asia: "jp",
    southeast_asia: "id",
    central_asia: "kz",
    oceania: "au",
  };

  const international = {
    male: ["Alex", "David", "Daniel", "Adam", "Leo", "Max", "Eric", "Marco"],
    female: ["Anna", "Maria", "Sara", "Elena", "Nina", "Eva", "Mia", "Lara"],
    last: ["Smith", "Garcia", "Müller", "Rossi", "Kim", "Silva", "Nguyen", "Cohen"],
  };

  function countryMeta(countryId) {
    return (window.GameData?.countries || {})[countryId] || null;
  }

  // Resolve the best name pool for a country: explicit -> region default -> international.
  function poolFor(countryId) {
    if (pools[countryId]) return pools[countryId];
    const meta = countryMeta(countryId);
    const region = meta?.region;
    if (region && regionDefault[region] && pools[regionDefault[region]]) return pools[regionDefault[region]];
    return international;
  }

  function pick(list, rng = Math.random) {
    if (!Array.isArray(list) || !list.length) return "";
    return list[Math.floor(rng() * list.length)];
  }

  function firstName(countryId, gender = "male", rng = Math.random) {
    const pool = poolFor(countryId);
    const list = gender === "female" ? pool.female : pool.male;
    return pick(list && list.length ? list : pool.male, rng) || pick(international.male, rng);
  }

  function lastName(countryId, rng = Math.random) {
    const pool = poolFor(countryId);
    return pick(pool.last, rng) || pick(international.last, rng);
  }

  function placeholderFor(countryId) {
    return samples[countryId] || (() => {
      const pool = poolFor(countryId);
      const f = (pool.female && pool.female[0]) || "Alex";
      const l = (pool.last && pool.last[0]) || "Smith";
      return `${f} ${l}`;
    })();
  }

  window.GameNames = {
    pools,
    samples,
    regionDefault,
    international,
    poolFor,
    firstName,
    lastName,
    placeholderFor,
  };
})();
