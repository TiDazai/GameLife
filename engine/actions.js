(() => {
  const { countries, names, professions, certificateCatalog, companySectors, budgetModes, housingCatalog, possessionCatalog } = window.GameData;
  const { pick, roll, clamp } = window.GameRandom;
  const {
    state,
    fmt,
    cityData,
    canAct,
    spendAction,
    change,
    improveSkill,
    familyBond,
    notify,
    addIncome,
    annualSalary,
    professionData,
    applyProfessionSkillGrowth,
    hasPossession,
    hasCertificate,
    payOrDebt,
    skillAverage,
    certificateBonus,
    professionSkillIds,
    personalCost,
    changeCredit,
    addDanger,
  } = window.GameState;

function getActions() {
  const list = [];

  if (state.age < 3) {
    list.push(
      action("Слушать речь", "Просить родителей говорить и читать рядом.", "Знания +4, связь с родителями +2", "Слушать", () => {
        spendAction();
        change({ knowledge: 4, happiness: 1 });
        improveSkill("language", 3);
        improveSkill("empathy", 1);
        familyBond("mother", 2);
        familyBond("father", 2);
        notify("Вы учитесь речи и узнаете голоса семьи.");
      }),
      action("Играть на полу", "Ранние движения дают здоровье и настроение.", "Здоровье +3, счастье +3", "Играть", () => {
        spendAction();
        change({ health: 3, happiness: 3, stress: -1 });
        improveSkill("fitness", 3);
        improveSkill("creativity", 1);
        notify("Игра укрепила тело и любопытство.");
      }),
      action("Тянуться к маме", "Эмоциональная связь станет ресурсом на годы.", "Связь с мамой +5", "К маме", () => {
        spendAction();
        familyBond("mother", 5);
        change({ happiness: 2, stress: -2 });
        improveSkill("empathy", 2);
        notify("Мама чаще рядом, чувство безопасности растет.");
      }),
      action("Тянуться к папе", "Отцовская вовлеченность влияет на уверенность.", "Связь с папой +5", "К папе", () => {
        spendAction();
        familyBond("father", 5);
        change({ happiness: 2, social: 1 });
        improveSkill("leadership", 1);
        notify("Папа уделил время. Связь стала крепче.");
      })
    );
  }

  if (state.age >= 3 && state.age < 7) {
    list.push(
      action("Детский сад", "Режим, первые друзья и самостоятельность.", `Семья платит ${fmt(180)}, социальность +5`, "Пойти", () => {
        spendAction();
        state.familyMoney -= 180 * cityData().cost;
        change({ social: 5, discipline: 3, knowledge: 2, stress: 1 });
        improveSkill("empathy", 3);
        improveSkill("language", 2);
        notify("Детский сад дал первых друзей и привычку к режиму.");
      }, state.familyMoney < 180 * cityData().cost),
      action("Рисовать и лепить", "Творчество развивает внимание.", "Знания +3, счастье +4", "Творить", () => {
        spendAction();
        change({ knowledge: 3, happiness: 4, discipline: 1 });
        improveSkill("creativity", 5);
        notify("Творчество стало маленькой опорой.");
      }),
      action("Гулять во дворе", "Двор учит общаться и договариваться.", "Социальность +4, здоровье +2", "Гулять", () => {
        spendAction();
        change({ social: 4, health: 2, happiness: 2 });
        improveSkill("fitness", 2);
        improveSkill("empathy", 2);
        notify("Во дворе появились знакомые дети.");
      }),
      action("Помочь дома", "Даже маленькая помощь влияет на семью.", "Связь с родителями +3", "Помочь", () => {
        spendAction();
        familyBond("mother", 3);
        familyBond("father", 3);
        change({ discipline: 2, happiness: 1 });
        improveSkill("empathy", 2);
        improveSkill("craft", 1);
        notify("Родители заметили помощь и стали теплее.");
      })
    );
  }

  if (state.age >= 7 && state.age < 18) {
    list.push(
      action("Учиться в школе", "База для будущей профессии.", "Оценки +7, знания +5, стресс +2", "Учиться", () => {
        spendAction();
        const cityBonus = Math.floor(((cityData().education + state.educationAccess) / 2) / 25);
        change({ grades: 7, knowledge: 5 + cityBonus, discipline: 2, stress: 2 });
        improveSkill("logic", 3 + cityBonus);
        improveSkill("language", 2);
        notify("Школьная учеба улучшила оценки и знания.");
      }),
      action("Спорт", "Здоровье снижает риски в долгой игре.", "Здоровье +6, стресс -3", "Спорт", () => {
        spendAction();
        change({ health: 6, stress: -3, discipline: 1 });
        improveSkill("fitness", 5);
        notify("Тело стало крепче, стресс снизился.");
      }),
      action("Друзья", "Социальная сеть пригодится в карьере и бизнесе.", "Социальность +6, счастье +3", "Встретиться", () => {
        spendAction();
        change({ social: 6, happiness: 3, stress: -1 });
        improveSkill("empathy", 3);
        improveSkill("leadership", 1);
        notify("Дружба добавила уверенности и контактов.");
      }),
      action("Кружок", "Навык вне школы может стать профессией.", "Знания +4, репутация +1", "Заниматься", () => {
        spendAction();
        change({ knowledge: 4, discipline: 2, reputation: 1, portfolio: 2, happiness: 1 });
        improveSkill("creativity", 2);
        improveSkill("craft", 2);
        improveSkill("logic", 1);
        notify("Кружок дал личный навык и первые достижения.");
      }),
      action("Олимпиада", "Сложная учебная цель.", "Знания +7, портфолио +4", "Готовиться", () => {
        spendAction();
        change({ knowledge: 7, grades: 5, discipline: 3, stress: 4, portfolio: 4, reputation: 2 });
        improveSkill("logic", 4);
        improveSkill("language", 1);
        notify("Олимпиада усилила учебный профиль.");
      }, state.knowledge < 20 && state.grades < 25),
      action("Мини-проект", "Первый результат своими руками.", "Портфолио +6, навык +3", "Сделать", () => {
        spendAction();
        change({ portfolio: 6, knowledge: 2, discipline: 2, stress: 2 });
        improveSkill(state.skills.creativity > state.skills.logic ? "creativity" : "logic", 3);
        notify("Мини-проект появился в портфолио.");
      }, state.age < 12),
      action("Помогать семье", "Семья экономит деньги, отношения крепнут.", `Бюджет семьи +${fmt(120)}`, "Помочь", () => {
        spendAction();
        state.familyMoney += 120;
        familyBond("mother", 2);
        familyBond("father", 2);
        change({ discipline: 3, stress: 1 });
        improveSkill("finance", 1);
        improveSkill("empathy", 2);
        notify("Семья сэкономила немного денег благодаря вашей помощи.");
      })
    );
  }

  if (state.age >= 14) {
    list.push(
      action("Подработка", "Первые личные деньги без профессии.", `1 действие, около ${fmt(250)}`, "Подработать", () => {
        window.GameCareerEngine.applyCareerAction(state, "side_job");
      }),
      action("Стажировка", "Опыт до полноценной работы.", `Опыт +1, связи +4`, "Идти", () => {
        spendAction();
        const earned = Math.floor((180 + state.knowledge * 4 + state.social * 3) * cityData().salary);
        addIncome(earned);
        state.experience += 1;
        change({ network: 4, portfolio: 3, stress: 5, reputation: 2 });
        improveSkill("leadership", 1);
        improveSkill("empathy", 1);
        notify(`Стажировка дала опыт и ${fmt(earned)}.`);
      }, state.knowledge < 18 || state.social < 10)
    );
  }

  if (state.age >= 16) {
    list.push(
      action("Личный бренд", "Публичность и доверие.", "Связи +6, репутация +3", "Развивать", () => {
        spendAction();
        change({ network: 6, reputation: 3, social: 2, stress: 3 });
        improveSkill("leadership", 2);
        notify("Личный бренд усилил доверие к вам.");
      })
    );
  }

  if (state.age >= 18) {
    list.push(
      action("Работать по профессии", "Стабильный доход и опыт.", `Доход: ${fmt(annualSalary())}`, "Работать", () => {
        window.GameCareerEngine.applyCareerAction(state, "work");
      }, !state.career?.jobId || state.career?.status !== "employed" || !state.documents.workPermit),
      action("Фриланс", "Зависит от знаний, общения и репутации.", "Переменный доход", "Взять заказ", () => {
        window.GameCareerEngine.applyCareerAction(state, "freelance");
      }, state.knowledge < 20 && state.social < 20),
      action("Забота о здоровье", "Профилактика дешевле кризиса.", `${fmt(300)}, здоровье +9, стресс -6`, "Заняться", () => {
        spendAction();
        payOrDebt(300);
        change({ health: 9, stress: -6, happiness: 1 });
        improveSkill("fitness", 2);
        notify("Здоровье улучшилось, стресс стал ниже.");
      }),
      action("Отдых", "Баланс нужен для долгой жизни.", "Счастье +7, стресс -8", "Отдохнуть", () => {
        spendAction();
        change({ happiness: 7, stress: -8, health: 1 });
        change({ lifestyle: 3 });
        notify("Отдых вернул силы.");
      })
    );
  }

  return list;
}

function action(title, text, meta, button, run, disabled = false) {
  return { title, text, meta, button, run, disabled: Boolean(disabled) || !canAct() };
}

function chooseProfession(id) {
  const prof = professions[id];
  if (!prof || id === "none") return;
  state.profession = id;
  notify(`Вы выбрали направление: ${prof.name}.`);
}

function enroll(type) {
  const map = { university: "university", college: "college", master: "master", courses: "courses", self: "self", school: "school", preschool: "preschool", secondary: "secondary" };
  window.GameCareerEngine.applyCareerAction(state, "study", map[type] || type);
}

function acquireCertificate(id) {
  const cert = certificateCatalog[id];
  if (!cert || hasCertificate(id) || !canAct()) return;
  const cost = Math.floor(cert.cost * cityData().cost);
  if (state.age < 16 || state.knowledge < cert.knowledge || state.social < cert.social || state.personalMoney + state.familyMoney < cost) return;
  spendAction();
  if (state.personalMoney >= cost) state.personalMoney -= cost;
  else {
    const rest = cost - state.personalMoney;
    state.personalMoney = 0;
    state.familyMoney -= rest;
  }
  state.certificates.push(id);
  if (!state.education.completed.includes("certificates")) state.education.completed.push("certificates");
  improveSkill(cert.skill, 5);
  change({ reputation: cert.reputation, portfolio: 3, stress: 3 });
  notify(`Получен сертификат: ${cert.name}.`);
}

function moveTo(countryId, cityId) {
  if (state.age < 18 || state.event) return;
  if (countryId !== state.country && !state.documents.passport) return;
  const dest = countries[countryId].cities[cityId];
  const cost = Math.floor(dest.housing * 1.5);
  if (state.personalMoney < cost) return;
  const oldCountry = state.country;
  state.personalMoney -= cost;
  state.country = countryId;
  state.city = cityId;
  state.livingWithParents = false;
  state.documents.workPermit = oldCountry === countryId;
  if (oldCountry !== countryId && !state.documents.visas.includes(countryId)) state.documents.visas.push(countryId);
  change({ stress: 8, social: -5, happiness: 2 });
  notify(`Вы переехали в ${dest.name}, ${countries[countryId].name}.`);
}

function leaveParents() {
  if (state.age < 18 || !state.livingWithParents) return;
  const cost = Math.floor(cityData().housing);
  if (state.personalMoney < cost) return;
  state.personalMoney -= cost;
  state.livingWithParents = false;
  change({ discipline: 4, stress: 6, happiness: 3 });
  notify("Вы начали жить отдельно. Свободы больше, расходов тоже.");
}

function supportParents() {
  if (state.age < 18 || state.personalMoney < 400) return;
  state.personalMoney -= 400;
  state.familyMoney += 400;
  familyBond("mother", 4);
  familyBond("father", 4);
  change({ happiness: 2, reputation: 1 });
  notify("Вы помогли семье деньгами.");
}

function startRelationship() {
  window.GameRelationshipActions.applyRelationshipAction(state, "start_relationship");
}

function developRelationship() {
  window.GameRelationshipActions.applyRelationshipAction(state, "spend_time", state.relationship?.id);
}

function marry() {
  window.GameRelationshipActions.applyRelationshipAction(state, "marriage", state.relationship?.id);
}

function haveChild() {
  window.GameRelationshipActions.applyRelationshipAction(state, "have_child", state.relationship?.id);
}

function startCompany(sectorId) {
  const sector = companySectors[sectorId];
  if (!sector || state.age < 18 || state.company || !canAct()) return;
  if (state.personalMoney < sector.cost || state.knowledge < sector.knowledge || state.social < sector.social) return;
  spendAction();
  state.personalMoney -= sector.cost;
  state.company = {
    sector: sectorId,
    cash: Math.floor(sector.cost * 0.35),
    reputation: 5,
    employees: 0,
    level: 1,
    stress: sector.stress,
    marketing: 0,
    quality: 0,
    automation: 0,
    branches: 0,
    debt: 0,
  };
  change({ stress: 10, reputation: 4, happiness: 3 });
  notify(`Открыта компания: ${sector.name}. Теперь доход зависит от решений бизнеса.`);
}

function companyAction(type) {
  if (!state.company || !canAct()) return;
  const sector = companySectors[state.company.sector];
  if (type === "sell") {
    spendAction();
    const revenue = Math.floor((sector.baseRevenue + state.company.reputation * 35 + state.social * 12 + state.company.marketing * 18) * cityData().opportunity / 100);
    state.company.cash += revenue;
    state.company.reputation = clamp(state.company.reputation + 4, 0, 100);
    change({ stress: 5, reputation: 1 });
    notify(`Компания получила выручку ${fmt(revenue)}.`);
  }
  if (type === "hire" && state.company.cash >= 900) {
    spendAction();
    state.company.cash -= 900;
    state.company.employees += 1;
    state.company.reputation = clamp(state.company.reputation + 2, 0, 100);
    change({ stress: 3 });
    notify("В компанию нанят сотрудник.");
  }
  if (type === "improve" && state.company.cash >= 1300) {
    spendAction();
    state.company.cash -= 1300;
    state.company.level += 1;
    state.company.reputation = clamp(state.company.reputation + 7, 0, 100);
    change({ knowledge: 3, stress: 4, reputation: 2 });
    notify("Компания улучшила процессы и стала сильнее.");
  }
  if (type === "marketing" && state.company.cash >= 700) {
    spendAction();
    state.company.cash -= 700;
    state.company.marketing = clamp(state.company.marketing + 8, 0, 100);
    state.company.reputation = clamp(state.company.reputation + 3, 0, 100);
    change({ stress: 2, fame: 1 });
    notify("Маркетинг привел новых клиентов.");
  }
  if (type === "quality" && state.company.cash >= 1000) {
    spendAction();
    state.company.cash -= 1000;
    state.company.quality = clamp(state.company.quality + 8, 0, 100);
    state.company.reputation = clamp(state.company.reputation + 5, 0, 100);
    change({ knowledge: 2, stress: 2 });
    notify("Качество продукта выросло.");
  }
  if (type === "automation" && state.company.cash >= 1800) {
    spendAction();
    state.company.cash -= 1800;
    state.company.automation = clamp(state.company.automation + 10, 0, 100);
    change({ knowledge: 2, stress: 3 });
    notify("Автоматизация снизит будущие расходы.");
  }
  if (type === "branch" && state.company.cash >= 3200) {
    spendAction();
    state.company.cash -= 3200;
    state.company.branches += 1;
    state.company.reputation = clamp(state.company.reputation + 4, 0, 100);
    change({ stress: 7, reputation: 2 });
    notify("Открыт новый филиал.");
  }
  if (type === "loan") {
    spendAction();
    const amount = Math.floor(2200 * (1 + state.company.level * 0.2) * cityData().salary);
    const loan = window.GameEconomyEngine?.takeLoan?.(state, "business", amount, { disburse: false, reason: "бизнес-кредит" });
    if (loan?.ok || !window.GameEconomyEngine) {
      state.company.cash += amount;
      if (!window.GameEconomyEngine) state.company.debt += amount;
      change({ stress: 4, creditScore: -2 });
      notify(`Компания взяла кредит ${fmt(amount)}.`);
    }
  }
  if (type === "repay" && state.company.cash > 0 && state.company.debt > 0) {
    const amount = Math.min(state.company.cash, state.company.debt, 1200);
    state.company.cash -= amount;
    state.company.debt -= amount;
    change({ creditScore: 1, stress: -1 });
    notify(`Компания погасила ${fmt(amount)} долга.`);
  }
  if (type === "withdraw" && state.company.cash >= 500) {
    const amount = Math.floor(state.company.cash * 0.25);
    state.company.cash -= amount;
    addIncome(amount);
    notify(`Вы вывели из компании ${fmt(amount)}.`);
  }
}

function activityAction(type) {
  if (state.event) return;
  if (["toys", "hug", "walk", "book", "gym", "meditate", "volunteer", "social", "style", "vacation", "theft", "interview", "ad", "lawyer", "apologize"].includes(type) && !canAct()) return;
  if (type === "toys") {
    spendAction();
    change({ happiness: 4, energy: -2, knowledge: 1 });
    improveSkill("creativity", 2);
    notify("Игрушки развили любопытство.");
  }
  if (type === "hug") {
    spendAction();
    familyBond("mother", 3);
    familyBond("father", 3);
    change({ happiness: 3, stress: -2, mental: 2 });
    improveSkill("empathy", 1);
    notify("Семейная близость стала крепче.");
  }
  if (type === "walk") {
    spendAction();
    change({ health: 2, happiness: 3, stress: -2, energy: -1 });
    notify("Прогулка освежила день.");
  }
  if (type === "book") {
    spendAction();
    change({ knowledge: 5, stress: -1, mental: 1 });
    improveSkill("logic", 2);
    notify("Книга добавила знаний.");
  }
  if (type === "gym") {
    spendAction();
    change({ health: 5, looks: 2, stress: -2, energy: -4 });
    improveSkill("fitness", 4);
    notify("Тренировка сработала.");
  }
  if (type === "meditate") {
    spendAction();
    change({ mental: 7, stress: -7, karma: 2, energy: 2 });
    notify("Голова стала яснее.");
  }
  if (type === "volunteer") {
    if (window.GameLegalEngine?.restoreReputation) {
      window.GameLegalEngine.restoreReputation(state, "volunteer");
    } else {
      spendAction();
      change({ karma: 6, reputation: 2, happiness: 3, stress: 1 });
      improveSkill("empathy", 2);
      notify("Волонтерство улучшило репутацию.");
    }
  }
  if (type === "social") {
    spendAction();
    const viral = Math.random() < (0.08 + state.skills.creativity / 1000 + state.fame / 900);
    change({ social: 2, network: 4, stress: 2, fame: viral ? 9 : 2 });
    improveSkill("creativity", 1);
    notify(viral ? "Пост резко набрал популярность." : "Соцсети дали немного внимания.");
  }
  if (type === "style") {
    const cost = Math.floor(380 * cityData().cost);
    if (state.personalMoney < cost) return;
    spendAction();
    state.personalMoney -= cost;
    change({ looks: 6, happiness: 2, stress: -1 });
    notify("Стиль обновлен.");
  }
  if (type === "vacation") {
    const cost = Math.floor(900 * cityData().cost);
    if (state.personalMoney < cost) return;
    spendAction();
    state.personalMoney -= cost;
    change({ happiness: 12, stress: -12, mental: 5, energy: 6 });
    notify("Отпуск перезагрузил жизнь.");
  }
  if (type === "lottery") {
    if (state.age < 18 || state.personalMoney < 80) return;
    state.personalMoney -= 80;
    const win = Math.random() < 0.045 + state.karma / 5000;
    if (win) {
      const prize = Math.floor((1200 + roll(9000)) * cityData().salary);
      addIncome(prize);
      change({ happiness: 10, fame: 2 });
      notify(`Лотерея выиграла ${fmt(prize)}.`);
    } else {
      change({ happiness: -1 });
      notify("Лотерея не сыграла.");
    }
  }
  if (type === "gamble") {
    if (state.age < 18 || state.personalMoney < 180) return;
    state.personalMoney -= 180;
    addDanger(3);
    const success = Math.random() < 0.38 + state.traits.risk / 900 + state.skills.finance / 1200;
    if (success) {
      const gain = 260 + roll(740);
      state.personalMoney += gain;
      change({ happiness: 4, stress: 3 });
      notify(`Азарт принес ${fmt(gain)}.`);
    } else {
      change({ stress: 6, happiness: -3, discipline: -2 });
      notify("Азартная игра ушла в минус.");
    }
  }
  if (type === "theft") {
    addDanger(18);
    if (window.GameLegalEngine?.commitOffense) window.GameLegalEngine.commitOffense(state, "petty_theft", Math.random);
  }
  if (type === "interview") {
    if (state.fame < 15) return;
    spendAction();
    const earned = Math.floor((120 + state.fame * 12 + state.social * 4) * cityData().salary);
    addIncome(earned);
    change({ fame: 5, network: 3, stress: 3 });
    notify(`Интервью принесло ${fmt(earned)}.`);
  }
  if (type === "ad") {
    if (state.fame < 25) return;
    spendAction();
    const earned = Math.floor((300 + state.fame * 28 + state.reputation * 8) * cityData().salary);
    addIncome(earned);
    change({ fame: 2, stress: 4, reputation: Math.random() < 0.18 ? -3 : 1 });
    notify(`Реклама принесла ${fmt(earned)}.`);
  }
  if (type === "lawyer") {
    window.GameLegalEngine?.hireLawyer?.(state);
    window.GameSocialWorld?.createLawyerNpc?.(state);
  }
  if (type === "apologize") {
    if (window.GameLegalEngine?.restoreReputation) window.GameLegalEngine.restoreReputation(state, "public_apology");
    else {
      spendAction();
      change({ karma: 4, stress: -3, reputation: 1 });
      notify("Вы исправили часть напряжения.");
    }
  }
}

function legalAction(type, payload = null) {
  if (type === "pay_fine") return window.GameLegalEngine?.payFine?.(state, payload);
  if (type === "lawyer") {
    window.GameSocialWorld?.createLawyerNpc?.(state);
    return window.GameLegalEngine?.hireLawyer?.(state, payload);
  }
  if (type === "restore") return window.GameLegalEngine?.restoreReputation?.(state, "restore_reputation");
  if (type === "volunteer") return window.GameLegalEngine?.restoreReputation?.(state, "volunteer");
  if (type === "apology") return window.GameLegalEngine?.restoreReputation?.(state, "public_apology");
  if (type === "close_tax") return window.GameLegalEngine?.closeTaxIssue?.(state);
  if (type === "offense") return window.GameLegalEngine?.commitOffense?.(state, payload, Math.random);
  return { ok: false, text: "Неизвестное правовое действие." };
}

function careerMove(type) {
  if (!canAct()) return;
  if (type === "raise") {
    window.GameCareerEngine.applyCareerAction(state, "promotion");
  }
  if (type === "switch") {
    const job = window.GameCareerEngine.availableJobs(state).find((item) => item.industry === state.career?.industry && item.id !== state.career?.jobId) || window.GameCareerEngine.availableJobs(state)[0];
    if (job) window.GameCareerEngine.applyCareerAction(state, "interview", job.id);
  }
  if (type === "mentor") {
    window.GameCareerEngine.applyCareerAction(state, "mentor");
  }
  if (type === "rest") {
    window.GameCareerEngine.applyCareerAction(state, "break");
  }
  if (type === "fire") window.GameCareerEngine.applyCareerAction(state, "fire");
  if (type === "demotion") window.GameCareerEngine.applyCareerAction(state, "demotion");
  if (type === "portfolio") window.GameCareerEngine.applyCareerAction(state, "portfolio");
  if (type === "network") window.GameCareerEngine.applyCareerAction(state, "network");
  if (type === "conflict") window.GameCareerEngine.applyCareerAction(state, "conflict");
  if (type === "bonus") window.GameCareerEngine.applyCareerAction(state, "bonus");
}

function setBudgetMode(id) {
  if (!budgetModes[id]) return;
  state.budgetMode = id;
  notify(`Бюджет: ${budgetModes[id].name}.`);
}

function saveEmergencyFund() {
  const amount = Math.floor(Math.max(250, personalCost() * 0.5));
  if (state.personalMoney < amount) return;
  if (window.GameEconomyEngine?.investAsset) window.GameEconomyEngine.investAsset(state, "deposits", amount);
  else {
    state.personalMoney -= amount;
    state.assets.deposits += amount;
  }
  change({ discipline: 3, happiness: -1, creditScore: 1 });
  notify(`В резерв отложено ${fmt(amount)}.`);
}

function changeHousing(id) {
  const item = housingCatalog[id];
  if (!item || state.age < item.minAge) return;
  const annual = Math.floor(item.annual * cityData().cost);
  const buy = item.buy ? Math.floor(item.buy * cityData().cost) : 0;
  const cost = buy || annual;
  if (state.personalMoney < cost) return;
  if (item.buy && window.GameEconomyEngine?.buyRealEstate) {
    const type = id === "house" ? "house" : "apartment";
    const result = window.GameEconomyEngine.buyRealEstate(state, type, { primary: true });
    if (!result.ok) return;
  } else if (window.GameEconomyEngine?.payExpense) {
    const paid = window.GameEconomyEngine.payExpense(state, "переезд и аренда", cost, { allowDebt: false });
    if (paid.debt > 0) return;
  } else {
    state.personalMoney -= cost;
  }
  state.housing = id;
  state.livingWithParents = id === "parents";
  if (item.buy && !window.GameEconomyEngine) state.assets.property += Math.floor(buy * 0.75);
  change({ happiness: item.happiness, stress: item.stress, lifestyle: Math.floor(item.quality / 12) });
  notify(`Новое жилье: ${item.name}.`);
}

function buyPossession(id) {
  const item = possessionCatalog[id];
  if (!item || hasPossession(id) || state.personalMoney < item.cost) return;
  state.personalMoney -= item.cost;
  state.possessions.push(id);
  if (item.bonus && state.skills[item.bonus] !== undefined) improveSkill(item.bonus, 4);
  if (item.bonus === "mobility") change({ lifestyle: 4, stress: -1 });
  notify(`Покупка: ${item.name}.`);
}

function investAsset(id, amount) {
  if (window.GameEconomyEngine?.investAsset) {
    if (!window.GameEconomyEngine.investAsset(state, id, amount).ok) return;
  } else {
    if (state.personalMoney < amount) return;
    state.personalMoney -= amount;
    state.assets[id] += amount;
  }
  improveSkill("finance", 1);
  notify(`Вложено ${fmt(amount)} в ${assetName(id)}.`);
}

function withdrawAsset(id) {
  const result = window.GameEconomyEngine?.withdrawAsset ? window.GameEconomyEngine.withdrawAsset(state, id, 0.25) : null;
  const amount = result?.amount ?? Math.floor(state.assets[id] * 0.25);
  if (amount <= 0) return;
  if (!window.GameEconomyEngine) {
    state.assets[id] -= amount;
    state.personalMoney += amount;
  }
  notify(`Выведено ${fmt(amount)} из ${assetName(id)}.`);
}

function assetName(id) {
  return id === "deposits" ? "вклад" : id === "stocks" ? "акции" : "пенсионный капитал";
}

function romanticAction(type) {
  if (!state.relationship || !canAct()) return;
  const rel = state.relationship;
  if (type === "date") {
    window.GameRelationshipActions.applyRelationshipAction(state, "spend_time", rel.id);
  }
  if (type === "talk") {
    window.GameRelationshipActions.applyRelationshipAction(state, "talk", rel.id);
  }
  if (type === "gift") {
    window.GameRelationshipActions.applyRelationshipAction(state, "gift", rel.id);
  }
  if (type === "repair") {
    window.GameRelationshipActions.applyRelationshipAction(state, "apologize", rel.id);
  }
  if (type === "future") {
    window.GameRelationshipActions.applyRelationshipAction(state, "support", rel.id);
  }
  if (type === "budget") {
    spendAction();
    const partner = window.GameRelationshipEngine.activePartner(state);
    if (partner && !partner.tags.includes("shared_budget")) partner.tags.push("shared_budget");
    window.GameRelationshipEngine.syncLegacy(state);
    const support = Math.floor((rel.trust + rel.bond) * cityData().salary * 4);
    state.personalMoney += support;
    if (partner) window.GameRelationshipEngine.changeNpc(partner, { conflict: -6 });
    window.GameRelationshipEngine.syncLegacy(state);
    change({ stress: -4, discipline: 2 });
    notify(`Общий бюджет добавил устойчивости: ${fmt(support)}.`);
  }
}

function investInChild(index) {
  const child = state.children[index];
  if (!child || !canAct()) return;
  spendAction();
  const cost = 350;
  if (state.personalMoney >= cost) state.personalMoney -= cost;
  else state.familyMoney -= Math.min(state.familyMoney, cost);
  child.bond = clamp(child.bond + 8, 0, 100);
  child.health = clamp(child.health + 4, 0, 100);
  const npc = window.GameRelationshipEngine.findNpc(state, child.id);
  if (npc) window.GameRelationshipEngine.changeNpc(npc, { bond: 8, health: 4, trust: 3 });
  window.GameRelationshipEngine.syncLegacy(state);
  change({ happiness: 4, stress: 2 });
  improveSkill("empathy", 2);
  notify(`Вы вложились в развитие ребенка: ${child.name}.`);
}

function relationshipAction(actionId, npcId) {
  return window.GameRelationshipActions.applyRelationshipAction(state, actionId, npcId);
}

function familyRelationshipAction(type) {
  if (!canAct()) return;
  if (type === "council") {
    spendAction();
    (state.npcs || []).filter((npc) => npc.alive && ["parent", "sibling", "spouse", "partner", "child"].includes(npc.relationType)).forEach((npc) => {
      window.GameRelationshipEngine.changeNpc(npc, { bond: 3, trust: 3, conflict: -4, respect: 1 });
    });
    window.GameRelationshipEngine.syncLegacy(state);
    change({ stress: -4, mental: 3, happiness: 2 });
    notify("Семейный совет снизил напряжение дома.");
  }
  if (type === "elders") {
    if (state.age < 12) return;
    spendAction();
    (state.npcs || []).filter((npc) => npc.alive && npc.relationType === "grandparent").forEach((npc) => {
      window.GameRelationshipEngine.changeNpc(npc, { bond: 4, trust: 2, health: 2 });
    });
    window.GameRelationshipEngine.syncLegacy(state);
    change({ happiness: 3, stress: -1 });
    improveSkill("empathy", 3);
    notify("Старшие родственники получили заботу и поддержку.");
  }
}

function acquireDocument(id, cost) {
  if (state.documents[id] || state.personalMoney < cost) return;
  const legalCheck = window.GameLegalEngine?.canAcquireDocument?.(state, id) || { ok: true };
  if (!legalCheck.ok) {
    notify(legalCheck.text || "Правовой статус мешает оформить документ.");
    return;
  }
  state.personalMoney -= cost;
  state.documents[id] = true;
  if (id === "taxId") change({ stress: -2, reputation: 1 });
  if (id === "passport") improveSkill("language", 1);
  notify(`Документ оформлен: ${documentName(id)}.`);
}

function setInsurance(id, cost) {
  if (state.age < 18 || state.personalMoney < cost) return;
  state.personalMoney -= cost;
  state.documents.insurance = id;
  change({ stress: id === "premium" ? -4 : id === "basic" ? -2 : 2 });
  notify(`Страховка изменена: ${insuranceName(id)}.`);
}

function documentName(id) {
  const namesMap = {
    birthCertificate: "свидетельство о рождении",
    passport: "паспорт",
    taxId: "налоговый номер",
    driverLicense: "водительские права",
    workPermit: "разрешение на работу",
  };
  return namesMap[id] || id;
}

function insuranceName(id) {
  return id === "premium" ? "расширенная" : id === "basic" ? "базовая" : "без страховки";
}

function healthHabitAction(type) {
  if (!canAct() || !window.GameHealthEngine) return { ok: false, text: "Действие недоступно." };
  const actions = {
    sleep: {
      cost: 0,
      habits: { screenTime: -8 },
      effects: { sleep: 14, energy: 10, stress: -7, mental: 3 },
      text: "Сон помог восстановить силы.",
    },
    nutrition: {
      cost: state.age < 18 ? 160 : 260,
      habits: { nutrition: 10 },
      effects: { health: 4, energy: 4, immunity: 3, stress: -2 },
      text: "Питание стало устойчивее.",
    },
    activity: {
      cost: 0,
      habits: { activity: 9 },
      effects: { fitness: 5, health: 3, energy: -2, stress: -3 },
      text: "Движение поддержало форму.",
    },
    calm: {
      cost: state.age < 18 ? 240 : 420,
      habits: { screenTime: -4 },
      effects: { mental: 8, stress: -10, sleep: 4 },
      text: "Спокойная практика снизила напряжение.",
    },
    checkup: {
      cost: state.documents?.insurance === "premium" ? 120 : 350,
      habits: {},
      effects: { health: 6, stress: -3, immunity: 2 },
      text: "Профилактический осмотр дал ясность.",
      adultOnly: true,
    },
  };
  const actionData = actions[type];
  if (!actionData || (actionData.adultOnly && state.age < 18)) return { ok: false, text: "Действие недоступно." };
  const cost = Math.floor(actionData.cost * cityData().cost);
  if (cost > 0) {
    if (state.age < 18) state.familyMoney -= Math.min(state.familyMoney, cost);
    else payOrDebt(cost);
  }
  spendAction();
  window.GameHealthEngine.updateHabits(state, actionData.habits);
  window.GameHealthEngine.applyEffects(state, actionData.effects);
  if (type === "activity") improveSkill("fitness", 2);
  if (type === "calm") improveSkill("empathy", 1);
  if (type === "checkup") window.GameSocialWorld?.createDoctorNpc?.(state);
  notify(actionData.text);
  return { ok: true, text: actionData.text, cost };
}

function healthTreatment(conditionId, treatmentId) {
  const result = window.GameHealthEngine?.treatCondition?.(state, conditionId, treatmentId);
  if (result?.ok) {
    window.GameSocialWorld?.createDoctorNpc?.(state);
    window.GameState.requestRender?.();
  }
  return result || { ok: false, text: "Лечение недоступно." };
}

  window.GameActions = {
    getActions,
    action,
    chooseProfession,
    enroll,
    acquireCertificate,
    moveTo,
    leaveParents,
    supportParents,
    startRelationship,
    developRelationship,
    marry,
    haveChild,
    startCompany,
    companyAction,
    activityAction,
    careerMove,
    setBudgetMode,
    saveEmergencyFund,
    changeHousing,
    buyPossession,
    investAsset,
    withdrawAsset,
    assetName,
    relationshipAction,
    familyRelationshipAction,
    romanticAction,
    investInChild,
    acquireDocument,
    setInsurance,
    documentName,
    insuranceName,
    healthHabitAction,
    healthTreatment,
    legalAction,
  };
})();
