(() => {
  const legalStatuses = {
    clean: { id: "clean", name: "Чистый статус", text: "Нет открытых правовых проблем." },
    watched: { id: "watched", name: "Под наблюдением", text: "Есть вопросы к документам, штрафам или публичному поведению." },
    fined: { id: "fined", name: "Есть штрафы", text: "Неоплаченные штрафы давят на деньги и доверие." },
    case_open: { id: "case_open", name: "Открыто дело", text: "Идет разбирательство, возможны ограничения." },
    restricted: { id: "restricted", name: "Ограниченный статус", text: "Часть документов, поездок или работ может быть недоступна." },
    convicted: { id: "convicted", name: "Судимость", text: "Серьезный юридический след влияет на карьеру и отношения." },
  };

  const legalActions = {
    pay_fine: { id: "pay_fine", title: "Оплатить штраф", minAge: 14, stress: -2, publicTrust: 1 },
    lawyer: { id: "lawyer", title: "Нанять юриста", minAge: 16, baseCost: 950, stress: -5, publicTrust: 1 },
    restore_reputation: { id: "restore_reputation", title: "Восстановить репутацию", minAge: 14, baseCost: 420, reputation: 5, publicTrust: 4, stress: 2 },
    volunteer: { id: "volunteer", title: "Волонтерство", minAge: 12, reputation: 2, karma: 6, publicTrust: 4, socialStanding: 2 },
    public_apology: { id: "public_apology", title: "Публичное извинение", minAge: 12, reputation: 2, karma: 3, publicTrust: 3, stress: 1 },
    close_tax: { id: "close_tax", title: "Закрыть налоговую проблему", minAge: 16, baseCost: 250, reputation: 1, publicTrust: 2, stress: -4 },
  };

  const legalOffenses = [
    offense("petty_theft", "Мелкая кража", 14, 260, 0.34, { stress: 8, reputation: -7, karma: -8, criminalRecord: 1 }, ["fine", "case"]),
    offense("fare_evasion", "Проезд без оплаты", 12, 120, 0.26, { stress: 4, reputation: -2, karma: -3 }, ["fine"]),
    offense("tax_hiding", "Скрыть часть дохода", 18, 520, 0.3, { stress: 10, reputation: -6, karma: -6, taxDebt: 420 }, ["tax", "case"]),
    offense("document_shortcut", "Обойти документальную процедуру", 16, 430, 0.38, { stress: 9, reputation: -6, criminalRecord: 1 }, ["document", "case"]),
    offense("online_harassment", "Агрессивная травля в сети", 14, 180, 0.28, { stress: 6, reputation: -9, karma: -10, publicTrust: -8 }, ["reputation", "fine"]),
  ];

  const legalCaseOutcomes = {
    warning: { id: "warning", title: "Предупреждение", fineMultiplier: 0.25, record: 0, reputation: -1, stress: 2 },
    fine: { id: "fine", title: "Штраф", fineMultiplier: 1, record: 0, reputation: -3, stress: 5 },
    probation: { id: "probation", title: "Испытательный срок", fineMultiplier: 0.7, record: 1, reputation: -6, stress: 8 },
    conviction: { id: "conviction", title: "Судимость", fineMultiplier: 1.3, record: 2, reputation: -12, stress: 12 },
  };

  function offense(id, title, minAge, baseFine, caughtChance, effectsOnCaught, tags) {
    return { id, title, minAge, baseFine, caughtChance, effectsOnCaught, tags };
  }

  window.GameData = { ...(window.GameData || {}), legalStatuses, legalActions, legalOffenses, legalCaseOutcomes };
})();
