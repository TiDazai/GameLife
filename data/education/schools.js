(() => {
  // Templates for pre-tertiary institutions (school, then college). These feed
  // the education engine when it lazily creates a concrete EducationInstitution
  // (stored as a Place of the matching type) and populates classmates/teachers.

  const schoolTypes = {
    school: {
      placeType: "school",
      level: "school",
      minAge: 7,
      classmateCount: [4, 7],
      teacherCount: [2, 3],
      namePool: ["Школа №{n}", "Гимназия «Восход»", "Лицей «Перспектива»", "Школа «Радуга»", "Лицей №{n}"],
    },
    college: {
      placeType: "college",
      level: "college",
      minAge: 16,
      classmateCount: [3, 6],
      teacherCount: [2, 3],
      namePool: ["Колледж «Профиль»", "Технический колледж", "Колледж «Старт»", "Колледж №{n}"],
    },
  };

  window.GameEducationData = { ...(window.GameEducationData || {}), schoolTypes };
})();
