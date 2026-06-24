(() => {
  // Templates for tertiary institutions (university, master). The education
  // engine uses these to create a concrete EducationInstitution Place and to
  // size the cohort of classmates and the faculty of professors.

  const universityTypes = {
    university: {
      placeType: "university",
      level: "university",
      minAge: 17,
      classmateCount: [4, 8],
      teacherCount: [2, 4],
      namePool: ["Городской университет", "Политехнический университет", "Университет «Прогресс»", "Открытый университет", "Университет №{n}"],
    },
    master: {
      placeType: "university",
      level: "master",
      minAge: 21,
      classmateCount: [3, 5],
      teacherCount: [2, 3],
      namePool: ["Магистратура «Прогресс»", "Высшая школа «Меридиан»", "Аспирантура университета"],
    },
  };

  window.GameEducationData = { ...(window.GameEducationData || {}), universityTypes };
})();
