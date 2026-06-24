(() => {
  // Workplace types map an industry to a concrete Place type, so a hire creates
  // an office, a site, a shop floor, or a remote setup as appropriate.

  const workplaceTypes = {
    office: { id: "office", label: "Офис", placeType: "companyOffice" },
    site:   { id: "site", label: "Площадка", placeType: "workplace" },
    shop:   { id: "shop", label: "Точка", placeType: "business_location" },
    clinic: { id: "clinic", label: "Клиника", placeType: "clinic" },
    remote: { id: "remote", label: "Удалённо", placeType: "online_platform" },
  };

  const workplaceByIndustry = {
    it: "office",
    finance: "office",
    education: "office",
    creativity: "office",
    entrepreneurship: "office",
    government: "office",
    medicine: "clinic",
    engineering: "site",
    production: "site",
    service: "shop",
  };

  function workplaceTypeFor(industry) {
    return workplaceTypes[workplaceByIndustry[industry] || "office"];
  }

  window.GameCareerData = { ...(window.GameCareerData || {}), workplaceTypes, workplaceByIndustry, workplaceTypeFor };
})();
