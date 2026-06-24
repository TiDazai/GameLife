(() => {
  // Generic position ladder. A concrete Position object is what a character
  // actually holds at a workplace; level drives salary multiplier and prestige.
  // Career tracks (careerTracks.js) override the displayed title per field.

  const pos = (id, title, level, salaryMult, prestige) => ({ id, title, level, salaryMult, prestige });

  const positions = {
    intern:     pos("intern", "Стажёр", 1, 0.6, 25),
    junior:     pos("junior", "Младший специалист", 2, 0.85, 35),
    specialist: pos("specialist", "Специалист", 3, 1.0, 45),
    senior:     pos("senior", "Старший специалист", 4, 1.3, 56),
    lead:       pos("lead", "Ведущий специалист", 5, 1.6, 64),
    manager:    pos("manager", "Менеджер", 6, 1.9, 70),
    head:       pos("head", "Руководитель отдела", 7, 2.3, 78),
    director:   pos("director", "Директор", 8, 2.8, 88),
  };

  // Default promotion order (tracks may use a subset).
  const ladderOrder = ["intern", "junior", "specialist", "senior", "lead", "manager", "head", "director"];

  window.GameCareerData = { ...(window.GameCareerData || {}), positions, ladderOrder };
})();
