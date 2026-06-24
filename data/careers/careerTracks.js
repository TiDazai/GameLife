(() => {
  // Career tracks per industry. Each track is a named ladder that overrides the
  // generic position titles with field-appropriate ones, so an IT "specialist"
  // reads as "Разработчик" while a finance one reads as "Аналитик".

  const track = (id, name, field, titles = {}) => ({
    id,
    name,
    field,
    ladder: ["intern", "junior", "specialist", "senior", "lead", "manager", "head", "director"],
    titles,
  });

  const careerTracks = {
    it: track("it", "IT", "it", {
      intern: "Стажёр-разработчик", junior: "Младший разработчик", specialist: "Разработчик",
      senior: "Старший разработчик", lead: "Тимлид", manager: "Менеджер продукта",
      head: "Руководитель разработки", director: "Технический директор",
    }),
    medicine: track("medicine", "Медицина", "medicine", {
      intern: "Интерн", junior: "Младший врач", specialist: "Врач",
      senior: "Старший врач", lead: "Заведующий отделением", manager: "Главный специалист",
      head: "Заместитель главврача", director: "Главврач",
    }),
    engineering: track("engineering", "Инженерия", "engineering", {
      intern: "Стажёр-инженер", junior: "Инженер", specialist: "Инженер-проектировщик",
      senior: "Старший инженер", lead: "Ведущий инженер", manager: "Руководитель проекта",
      head: "Главный инженер", director: "Технический директор",
    }),
    finance: track("finance", "Финансы", "finance", {
      intern: "Стажёр", junior: "Младший аналитик", specialist: "Аналитик",
      senior: "Старший аналитик", lead: "Ведущий аналитик", manager: "Финансовый менеджер",
      head: "Начальник управления", director: "Финансовый директор",
    }),
    education: track("education", "Образование", "education", {
      intern: "Ассистент", junior: "Молодой педагог", specialist: "Педагог",
      senior: "Старший педагог", lead: "Методист", manager: "Завуч",
      head: "Заместитель директора", director: "Директор",
    }),
    creativity: track("creativity", "Творчество", "creativity", {
      intern: "Стажёр", junior: "Младший автор", specialist: "Автор",
      senior: "Старший автор", lead: "Арт-директор", manager: "Креативный менеджер",
      head: "Руководитель студии", director: "Креативный директор",
    }),
    service: track("service", "Сервис", "service", {
      intern: "Стажёр", junior: "Сотрудник", specialist: "Специалист",
      senior: "Старший сотрудник", lead: "Бригадир", manager: "Менеджер",
      head: "Управляющий", director: "Директор сети",
    }),
    government: track("government", "Госслужба", "government", {
      intern: "Стажёр", junior: "Младший специалист", specialist: "Специалист",
      senior: "Главный специалист", lead: "Советник", manager: "Начальник отдела",
      head: "Заместитель руководителя", director: "Руководитель ведомства",
    }),
    production: track("production", "Производство", "production", {
      intern: "Ученик", junior: "Рабочий", specialist: "Мастер",
      senior: "Старший мастер", lead: "Бригадир", manager: "Начальник смены",
      head: "Начальник цеха", director: "Директор производства",
    }),
    entrepreneurship: track("entrepreneurship", "Бизнес", "entrepreneurship", {
      intern: "Помощник", junior: "Координатор", specialist: "Менеджер",
      senior: "Старший менеджер", lead: "Руководитель направления", manager: "Операционный менеджер",
      head: "Операционный директор", director: "Генеральный директор",
    }),
  };

  function trackForField(field) {
    return careerTracks[field] || careerTracks.service;
  }

  window.GameCareerData = { ...(window.GameCareerData || {}), careerTracks, trackForField };
})();
