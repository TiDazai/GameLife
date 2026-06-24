(() => {
  const events = [
    event("legal_document_check", "legal", "Проверка документов", "В общественном месте просят показать документы и уточнить регистрацию.", 14, 90, 7, {}, [{ stat: "legalRisk", gte: 35, add: 5 }], [
      option("calm", "Спокойно показать", "Не спорить и объяснить ситуацию.", { stress: 2, publicTrust: 1 }, "Проверка закончилась без последствий."),
      option("argue", "Спорить", "Резко отстаивать позицию.", { stress: 6, reputation: -1, publicTrust: -2 }, "Разговор стал неприятным.", { chance: 0.22, effects: { legalFine: 120, legalStatus: "watched" }, resultText: "За нарушение порядка выписали небольшой штраф." }),
    ]),
    event("legal_transport_fine", "legal", "Транспортный штраф", "Из-за спешки появляется риск получить штраф в дороге.", 12, 85, 6, {}, [{ stat: "stress", gte: 55, add: 4 }], [
      option("pay_attention", "Проверить правила", "Потратить минуту на порядок.", { stress: -1, discipline: 1 }, "Вы избежали лишней проблемы."),
      option("rush", "Спешить", "Надеяться, что обойдется.", { stress: 2 }, "Спешка ускорила день.", { chance: 0.3, effects: { legalFine: 140, publicTrust: -1 }, resultText: "Пришел транспортный штраф." }),
    ]),
    event("legal_tax_notice", "legal", "Налоговое письмо", "Приходит уведомление с вопросами по доходам и документам.", 18, 90, 8, {}, [{ stat: "taxDebt", gte: 1, add: 9 }, { stat: "moneyPressure", gte: 25, add: 4 }], [
      option("sort", "Разобраться", "Собрать документы и оплатить недоимку.", { money: -260, stress: -2, publicTrust: 2 }, "Налоговый вопрос закрыт аккуратно."),
      option("ignore", "Отложить", "Не открывать письмо до лучших времен.", { stress: 5, publicTrust: -2 }, "Письмо осталось давить фоном.", { chance: 0.45, effects: { legalCase: { title: "Налоговая проблема", type: "tax", severity: 2, tags: ["tax"], restrictions: ["work"] }, taxDebt: 420 }, resultText: "Налоговая проблема стала официальной." }),
    ]),
    event("legal_public_scandal_post", "legal", "Резкая публикация", "Ваш эмоциональный пост получает неожиданно широкую реакцию.", 14, 90, 7, {}, [{ stat: "fame", gte: 20, add: 5 }, { stat: "stress", gte: 60, add: 4 }], [
      option("delete", "Удалить и объяснить", "Не разгонять конфликт.", { stress: 2, karma: 1, publicTrust: 1 }, "Конфликт быстро погас."),
      option("double_down", "Настаивать", "Ответить еще жестче.", { fame: 2, stress: 5, reputation: -6, publicTrust: -8, socialStanding: -4 }, "Скандал стал заметнее.", { chance: 0.25, effects: { legalCase: { title: "Публичный конфликт", type: "reputation", severity: 1, tags: ["reputation"] } }, resultText: "Одна из сторон решила идти официальным путем." }),
    ]),
    event("legal_work_compliance", "legal", "Проверка на работе", "Работодатель проводит внутреннюю проверку документов и репутационных рисков.", 18, 75, 6, { requiredState: { employed: true } }, [{ stat: "criminalRecord", gte: 1, add: 8 }], [
      option("transparent", "Объяснить честно", "Дать контекст и документы.", { stress: 3, publicTrust: 1 }, "Честность снизила напряжение."),
      option("hide", "Скрыть детали", "Надеяться, что ничего не всплывет.", { stress: 6, karma: -2 }, "Скрывать оказалось тяжело.", { chance: 0.35, effects: { careerFired: true, reputation: -6 }, resultText: "Проверка ударила по работе." }),
    ]),
    event("legal_neighbor_claim", "legal", "Жалоба соседа", "Сосед обвиняет вас в нарушении порядка в доме.", 18, 90, 5, {}, [{ stat: "stress", gte: 50, add: 3 }], [
      option("mediate", "Договориться", "Спокойно обсудить границы.", { social: 1, stress: -1, publicTrust: 1 }, "Удалось найти бытовой компромисс."),
      option("escalate", "Ответить резко", "Перевести спор в конфликт.", { stress: 5, reputation: -2, publicTrust: -2 }, "Сосед написал формальную жалобу.", { chance: 0.28, effects: { legalFine: 180 }, resultText: "Жалоба закончилась штрафом." }),
    ]),
    event("legal_contract_dispute", "legal", "Спор по договору", "В старом договоре нашелся пункт, который может стоить денег.", 18, 90, 6, {}, [{ stat: "knowledge", lte: 35, add: 3 }], [
      option("read", "Разобрать договор", "Потратить вечер на детали.", { knowledge: 2, stress: 2, money: -90 }, "Вы нашли спокойное решение."),
      option("sign_fast", "Подписать быстро", "Не тратить силы на формальности.", { stress: -1 }, "Решение оказалось поспешным.", { chance: 0.32, effects: { legalCase: { title: "Спор по договору", type: "civil", severity: 2, tags: ["civil"] }, debt: 260 }, resultText: "Договор превратился в спор." }),
    ]),
    event("legal_lost_trust", "legal", "Потеря доверия", "Люди вокруг начинают осторожнее относиться к вашим словам.", 16, 90, 7, { maxStats: { publicTrust: 45 } }, [], [
      option("repair", "Исправлять делами", "Начать с маленьких честных шагов.", { publicTrust: 5, reputation: 2, stress: 2 }, "Доверие медленно возвращается."),
      option("ignore", "Не обращать внимания", "Пусть думают что хотят.", { stress: -1, socialStanding: -4, reputation: -2 }, "Дистанция стала заметнее."),
    ]),
    event("legal_reputation_recovery", "legal", "Шанс на восстановление", "Местная инициатива ищет людей для полезного проекта.", 12, 90, 8, {}, [{ stat: "reputation", lte: 35, add: 5 }, { stat: "karma", gte: 55, add: 3 }], [
      option("join", "Присоединиться", "Помочь делом.", { karma: 4, reputation: 3, publicTrust: 5, socialStanding: 3, energy: -4 }, "Полезное дело укрепило вашу репутацию."),
      option("skip", "Пропустить", "Сохранить силы.", { energy: 2 }, "Вы остались в стороне."),
    ]),
    event("legal_court_notice", "legal", "Повестка на разбирательство", "По старому делу приходит официальное уведомление.", 16, 90, 6, { minStats: { activeCases: 1 } }, [], [
      option("prepare", "Подготовиться", "Собрать документы и консультацию.", { money: -350, stress: 3, publicTrust: 1 }, "Подготовка снизила риск плохого исхода."),
      option("wing_it", "Импровизировать", "Пойти без подготовки.", { stress: 6 }, "День прошел нервно.", { chance: 0.45, effects: { criminalRecord: 1, reputation: -5, publicTrust: -4 }, resultText: "Итог оказался хуже ожидаемого." }),
    ]),
    event("legal_business_inspection", "legal", "Проверка компании", "К вашей компании приходят с плановой проверкой.", 18, 90, 7, { requiredState: { company: true } }, [{ stat: "companyReputation", lte: 35, add: 5 }], [
      option("cooperate", "Сотрудничать", "Показать документы и процессы.", { stress: 3, publicTrust: 2 }, "Проверка прошла управляемо."),
      option("delay", "Затягивать", "Попросить время и ничего не показывать.", { stress: 6, reputation: -2 }, "Затягивание вызвало вопросы.", { chance: 0.38, effects: { legalFine: 520, legalCase: { title: "Проверка компании", type: "business", severity: 2, tags: ["business"], restrictions: ["work"] } }, resultText: "Появились санкции для компании." }),
    ]),
    event("legal_travel_restriction_check", "legal", "Проверка перед поездкой", "Перед выездом всплывают вопросы по статусу и долгам.", 18, 90, 6, {}, [{ stat: "taxDebt", gte: 300, add: 4 }, { stat: "activeCases", gte: 1, add: 6 }], [
      option("settle", "Закрыть вопросы", "Оплатить часть долгов и уточнить статус.", { money: -420, stress: -2, publicTrust: 2 }, "Поездка осталась возможной."),
      option("risk_trip", "Ехать как есть", "Надеяться, что проверка будет формальной.", { stress: 4 }, "Риск не оправдался.", { chance: 0.35, effects: { legalCase: { title: "Ограничение на поездки", type: "travel", severity: 2, tags: ["document"], restrictions: ["travel"] }, reputation: -2 }, resultText: "Появилось ограничение на поездки." }),
    ]),
    event("legal_debt_collector_notice", "legal", "Жесткое письмо от взыскателя", "Старый долг передали на формальное взыскание.", 18, 90, 7, { minStats: { debt: 500 } }, [{ stat: "moneyPressure", gte: 20, add: 5 }], [
      option("plan", "Согласовать график", "Договориться о порядке оплаты.", { creditScore: 1, stress: -2, publicTrust: 1 }, "График снизил давление."),
      option("avoid", "Не отвечать", "Отложить неприятный разговор.", { stress: 5, creditScore: -3, publicTrust: -2 }, "Молчание ухудшило позицию.", { chance: 0.3, effects: { legalCase: { title: "Взыскание долга", type: "debt", severity: 2, tags: ["debt"] } }, resultText: "Долг перешел в формальный спор." }),
    ]),
    event("legal_school_property", "legal", "Испорченное имущество", "В школе считают, что вы причастны к порче вещи.", 7, 17, 5, {}, [{ stat: "risk", gte: 60, add: 4 }], [
      option("tell_truth", "Рассказать правду", "Объяснить, что произошло.", { karma: 2, stress: 2, publicTrust: 1 }, "Честность помогла смягчить разговор."),
      option("blame_other", "Свалить на другого", "Уйти от ответственности.", { karma: -5, stress: 4, reputation: -2 }, "История стала грязнее.", { chance: 0.35, effects: { legalFine: 90, publicTrust: -3 }, resultText: "Родителям пришлось платить компенсацию." }),
    ]),
    event("legal_identity_mismatch", "legal", "Несовпадение в документах", "В анкете обнаружилось несовпадение данных.", 16, 90, 6, {}, [{ stat: "discipline", lte: 40, add: 4 }], [
      option("fix", "Исправить", "Потратить время на корректировки.", { money: -110, stress: 1, discipline: 1 }, "Документы приведены в порядок."),
      option("leave", "Оставить", "Решить, что это мелочь.", { stress: -1 }, "Мелочь стала проблемой.", { chance: 0.3, effects: { legalStatus: "watched", publicTrust: -2, stress: 5 }, resultText: "Проверка стала внимательнее." }),
    ]),
    event("legal_friend_risky_offer", "legal", "Рискованная просьба знакомого", "Знакомый просит прикрыть сомнительную историю.", 14, 80, 6, {}, [{ stat: "relationshipConflict", gte: 40, add: 2 }, { stat: "risk", gte: 60, add: 5 }], [
      option("refuse", "Отказать", "Не входить в мутную схему.", { karma: 2, stress: -1, publicTrust: 1 }, "Граница сработала."),
      option("cover", "Прикрыть", "Сказать, что ничего не видели.", { karma: -6, stress: 6, publicTrust: -4 }, "История стала общей.", { chance: 0.32, effects: { legalCase: { title: "Сомнительная просьба", type: "social", severity: 2, tags: ["social"] }, reputation: -4 }, resultText: "Теперь вопросы есть и к вам." }),
    ]),
    event("legal_media_question", "legal", "Неудобный вопрос публично", "Вас спрашивают о старой ошибке перед аудиторией.", 16, 90, 6, { minStats: { fame: 10 } }, [{ stat: "pastCases", gte: 1, add: 4 }], [
      option("own", "Признать и объяснить", "Не уходить от темы.", { reputation: 2, publicTrust: 4, stress: 3 }, "Открытость помогла."),
      option("snap", "Сорваться", "Ответить раздраженно.", { fame: 2, reputation: -6, publicTrust: -7, stress: 5 }, "Отрывок разошелся широко."),
    ]),
    event("legal_permit_delay", "legal", "Задержка разрешения", "Разрешение на работу или поездку зависло из-за статуса.", 18, 90, 5, {}, [{ stat: "legalRisk", gte: 45, add: 6 }], [
      option("documents", "Донести документы", "Закрыть недостающие бумаги.", { money: -180, stress: 2, publicTrust: 1 }, "Процесс продолжился."),
      option("pressure", "Давить на сотрудников", "Требовать ускорения.", { stress: 5, reputation: -1, publicTrust: -2 }, "Давление не помогло.", { chance: 0.2, effects: { legalStatus: "watched" }, resultText: "К делу стали относиться осторожнее." }),
    ]),
    event("legal_minor_conflict_law", "legal", "Конфликт с законом", "Ночная ситуация заканчивается разговором с представителем порядка.", 14, 24, 5, {}, [{ stat: "risk", gte: 65, add: 6 }, { stat: "stress", gte: 60, add: 3 }], [
      option("cooperate", "Сотрудничать", "Говорить спокойно и коротко.", { stress: 4, discipline: 1 }, "Разговор закончился предупреждением."),
      option("run_mouth", "Провоцировать", "Отвечать дерзко.", { stress: 8, karma: -3, publicTrust: -3 }, "Дерзость ухудшила тон.", { chance: 0.35, effects: { legalFine: 240, criminalRecord: 1, reputation: -5 }, resultText: "Появился официальный след." }),
    ]),
    event("legal_false_accusation", "legal", "Ложное обвинение", "Вас обвиняют в том, чего вы не делали.", 12, 90, 5, {}, [{ stat: "publicTrust", lte: 40, add: 4 }], [
      option("facts", "Собрать факты", "Показать доказательства спокойно.", { stress: 3, publicTrust: 3, reputation: 2 }, "Факты помогли отбиться."),
      option("rage", "Сорваться", "Отвечать эмоциями.", { stress: 7, reputation: -3, publicTrust: -3 }, "Даже невиновность стала выглядеть хуже."),
    ]),
    event("legal_unpaid_fine_grows", "legal", "Просрочка штрафа", "Неоплаченный штраф начинает расти.", 14, 90, 8, { minStats: { unpaidFines: 1 } }, [], [
      option("pay", "Оплатить сейчас", "Закрыть долг по возможности.", { money: -220, stress: -3, publicTrust: 1 }, "Часть давления снята."),
      option("delay", "Еще подождать", "Денег сейчас жалко.", { stress: 4, publicTrust: -2, creditScore: -2 }, "Просрочка ухудшила финансовый след.", { chance: 0.4, effects: { legalFine: 120 }, resultText: "Добавилась пеня." }),
    ]),
    event("legal_clean_record_offer", "legal", "Программа исправления", "Появляется возможность официально смягчить старый след.", 18, 90, 5, { minStats: { criminalRecord: 1 } }, [{ stat: "karma", gte: 55, add: 4 }], [
      option("join", "Вступить", "Работать над исправлением.", { money: -500, criminalRecord: -1, reputation: 4, publicTrust: 4, stress: 2 }, "Юридический след стал мягче."),
      option("skip", "Не сейчас", "Оставить как есть.", { stress: -1 }, "Возможность ушла на потом."),
    ]),
    event("legal_community_award", "legal", "Благодарность района", "Ваш вклад в маленькое общее дело заметили.", 12, 90, 6, { minStats: { karma: 55 } }, [{ stat: "publicTrust", gte: 60, add: 3 }], [
      option("accept", "Принять", "Поблагодарить людей.", { reputation: 4, publicTrust: 5, socialStanding: 4, happiness: 2 }, "Доверие заметно выросло."),
      option("quiet", "Остаться в стороне", "Не привлекать внимание.", { stress: -2, reputation: 1 }, "Вы помогли без шума."),
    ]),
    event("legal_old_case_resurface", "legal", "Старое дело всплыло", "Кто-то вспомнил старую историю в неподходящий момент.", 18, 90, 5, { minStats: { pastCases: 1 } }, [{ stat: "fame", gte: 20, add: 5 }], [
      option("context", "Дать контекст", "Спокойно объяснить, что изменилось.", { reputation: 1, publicTrust: 3, stress: 3 }, "Контекст снизил удар."),
      option("deny", "Отрицать всё", "Делать вид, что ничего не было.", { stress: 5, publicTrust: -5, reputation: -4 }, "Отрицание выглядело неубедительно."),
    ]),
    event("legal_work_permit_question", "legal", "Вопрос к разрешению на работу", "При смене занятости выясняется, что статус нужно обновить.", 18, 90, 5, { requiredState: { employed: true } }, [{ stat: "legalRisk", gte: 40, add: 5 }], [
      option("update", "Обновить статус", "Потратить деньги и время.", { money: -300, stress: 2, publicTrust: 1 }, "Разрешение осталось действительным."),
      option("work_anyway", "Работать дальше", "Не трогать документы.", { stress: 4, karma: -2 }, "Риск остался.", { chance: 0.32, effects: { legalCase: { title: "Проблема с разрешением на работу", type: "work", severity: 2, tags: ["document"], restrictions: ["work"] }, careerFired: true }, resultText: "Работа и статус пострадали." }),
    ]),
    event("legal_public_apology_moment", "legal", "Момент для извинения", "Есть шанс закрыть неприятный публичный конфликт.", 12, 90, 6, { maxStats: { publicTrust: 55 } }, [{ stat: "reputation", lte: 45, add: 4 }], [
      option("apologize", "Извиниться", "Признать ошибку без оправданий.", { karma: 3, reputation: 2, publicTrust: 5, stress: 2 }, "Извинение не всё исправило, но снизило напряжение."),
      option("ignore", "Промолчать", "Не поднимать тему.", { stress: -1, publicTrust: -2 }, "Люди сделали свои выводы."),
    ]),
    event("legal_tax_refund_check", "legal", "Проверка возврата", "Налоговая просит подтвердить право на возврат.", 18, 90, 5, { requiredState: { document: "taxId" } }, [{ stat: "finance", gte: 45, add: 3 }], [
      option("prove", "Подтвердить", "Собрать бумаги и расчеты.", { money: 180, finance: 1, publicTrust: 1 }, "Возврат подтвержден."),
      option("overclaim", "Заявить больше", "Попробовать получить лишнее.", { stress: 4, karma: -4 }, "Сумма выглядела сомнительно.", { chance: 0.42, effects: { legalCase: { title: "Спор по налоговому возврату", type: "tax", severity: 2, tags: ["tax"] }, taxDebt: 300 }, resultText: "Проверка стала серьезнее." }),
    ]),
  ];

  function event(id, category, title, description, minAge, maxAge, baseWeight, conditions, weightModifiers, options) {
    return { id, category, title, description, minAge, maxAge, baseWeight, conditions, weightModifiers, options };
  }

  function option(id, label, description, effects, resultText, risk = null) {
    return risk ? { id, label, description, effects, resultText, risk } : { id, label, description, effects, resultText };
  }

  window.GameEventData = [...(window.GameEventData || []), ...events];
})();
