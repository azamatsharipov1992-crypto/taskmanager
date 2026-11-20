export type Language = 'UZ' | 'RU';

export const translations = {
  UZ: {
    appName: 'TASK CONTROL',
    tagline: 'Mijoz murojaatlari, xodimlar va hududiy KPI nazorati',
    coreRuleBadge: '4 Bosqichli Nazorat Qoidasi',
    coreRuleText: 'Mutaxassis yechim bergani bilan murojaat yopilmaydi. Faqat operator va mijoz tasdig‘i bilan yopiladi!',
    nav: {
      dashboard: 'Dashboard',
      kanban: 'Kanban',
      issues: 'Murojaatlar',
      employees: 'Xodimlar',
      kpi: 'KPI Tahlili',
      reports: 'Hisobotlar & Hududlar',
      customers: 'Mijozlar (STIR)',
      products: 'Dasturlar',
      reminders: 'Telegram & Eslatmalar'
    },
    roles: {
      SUPER_ADMIN: 'Superadmin',
      MANAGER: 'Menejer',
      MUTAXASSIS: 'Mutaxassis',
      DEVELOPER: 'Mutaxassis',
      OPERATOR: 'Operator'
    },
    stages: {
      STAGE_1_ACCEPTED: {
        title: '1. Qabul & Biriktirildi',
        desc: 'Murojaat operator tomonidan qabul qilindi va mutaxassisga biriktirildi'
      },
      STAGE_2_RESOLVED: {
        title: '2. Yechim berildi',
        desc: 'Mutaxassis muammoni hal qildi va operatorga qaytardi'
      },
      STAGE_3_DISPATCHED: {
        title: '3. Mijozga yetkazildi',
        desc: 'Operator mijoz bilan bog‘landi va natijani yetkazdi (Tasdiq kutilmoqda)'
      },
      STAGE_4_CONFIRMED: {
        title: '4. Mijoz tasdiqladi',
        desc: 'Mijoz natijani to‘liq tasdiqladi va murojaat rasman yopildi'
      }
    },
    statuses: {
      NEW: 'Yangi',
      ASSIGNED: 'Biriktirilgan',
      IN_PROGRESS: 'Bajarilmoqda',
      WAITING: 'Kutilmoqda',
      SOLUTION_READY: 'Yechim tayyor (Operatorga)',
      CUSTOMER_CONTACT: 'Mijozga yetkazildi',
      REOPENED: 'Qaytarilgan',
      CLOSED: 'Yopilgan',
      CANCELLED: 'Bekor qilingan'
    },
    priorities: {
      LOW: 'Past',
      MEDIUM: 'O‘rta',
      HIGH: 'Yuqori',
      CRITICAL: 'Kritik'
    },
    stats: {
      total: 'Jami murojaatlar',
      inProgress: 'Ish jarayonida',
      solutionReady: 'Yechim berilgan (Operatorga)',
      waitingCustomer: 'Mijoz tasdig‘i kutilmoqda',
      overdue: 'Muddati o‘tgan',
      closed: 'Yopilgan',
      reopened: 'Qaytarilganlar',
      customersTotal: 'Jami mijozlar',
      customersActive: 'Faol mijozlar',
      telegramLinked: 'Telegram bog‘langan',
      todayIssues: 'Bugungi murojaatlar'
    },
    actions: {
      newIssue: 'Yangi Murojaat',
      addCustomer: 'Yangi mijoz qo‘shish',
      addEmployee: 'Xodim qo‘shish',
      acceptTask: 'Vazifani qabul qilish',
      pauseTask: 'Kutish rejimiga olish',
      resumeTask: 'Ishni davom ettirish',
      submitSolution: 'Yechim topshirish (Operatorga)',
      contactCustomer: 'Mijoz bilan bog‘lanish',
      confirmClose: 'Mijoz tasdiqladi & Yopish',
      reopen: 'Qaytarish (Muammo hal bo‘lmadi)',
      addComment: 'Izoh yozish',
      filter: 'Filtr',
      searchPlaceholder: 'Murojaat kodi, nomi yoki mijoz...',
      triggerCheck: 'Eslatmalarni hozir tekshirish',
      sendTelegramReport: 'Telegramga hisobot jo‘natish',
      save: 'Saqlash',
      cancel: 'Bekor qilish',
      ihamkorLookup: 'iHamkor qidirish',
      linkTelegram: 'Telegram bog‘lash',
      unlinkTelegram: 'Telegramni uzish',
      testTelegram: 'Test xabar yuborish',
      attachFile: 'Fayl biriktirish',
      attachImage: 'Rasm biriktirish',
      attachVideo: 'Video biriktirish',
      exportExcel: 'Excel (.csv) yuklab olish',
      printPdf: 'Chop etish / PDF'
    },
    customer: {
      inn: 'STIR / INN',
      companyName: 'Korxona nomi',
      region: 'Viloyat / Hudud',
      district: 'Tuman / Shahar',
      legalAddress: 'Yuridik manzil',
      activityAddress: 'Faoliyat manzili',
      phone: 'Asosiy telefon',
      secondaryPhone: 'Qo‘shimcha telefon',
      contactPerson: 'Mas’ul shaxs (FIO)',
      products: 'Dasturiy mahsulotlar',
      telegramStatus: 'Telegram holati',
      linked: 'Bog‘langan',
      notLinked: 'Bog‘lanmagan'
    }
  },
  RU: {
    appName: 'TASK CONTROL',
    tagline: 'Система контроля обращений клиентов, сотрудников и регионального KPI',
    coreRuleBadge: '4-х этапный контроль',
    coreRuleText: 'Специалист не может закрыть задачу. Обращение закрывается только оператором после подтверждения клиентом!',
    nav: {
      dashboard: 'Дашборд',
      kanban: 'Канбан',
      issues: 'Обращения',
      employees: 'Сотрудники',
      kpi: 'KPI Анализ',
      reports: 'Отчеты и Регионы',
      customers: 'Клиенты (ИНН)',
      products: 'Продукты',
      reminders: 'Telegram & Напоминания'
    },
    roles: {
      SUPER_ADMIN: 'Суперадмин',
      MANAGER: 'Менеджер',
      MUTAXASSIS: 'Специалист',
      DEVELOPER: 'Специалист',
      OPERATOR: 'Оператор'
    },
    stages: {
      STAGE_1_ACCEPTED: {
        title: '1. Принято и Назначено',
        desc: 'Обращение принято оператором и назначено специалисту'
      },
      STAGE_2_RESOLVED: {
        title: '2. Решение готово',
        desc: 'Специалист устранил проблему и вернул оператору'
      },
      STAGE_3_DISPATCHED: {
        title: '3. Передано клиенту',
        desc: 'Оператор связался с клиентом (Ожидается подтверждение)'
      },
      STAGE_4_CONFIRMED: {
        title: '4. Подтверждено клиентом',
        desc: 'Клиент подтвердил решение, обращение официально закрыто'
      }
    },
    statuses: {
      NEW: 'Новый',
      ASSIGNED: 'Назначен',
      IN_PROGRESS: 'В работе',
      WAITING: 'Ожидание',
      SOLUTION_READY: 'Решение готово (Оператору)',
      CUSTOMER_CONTACT: 'Передано клиенту',
      REOPENED: 'Возвращено',
      CLOSED: 'Закрыто',
      CANCELLED: 'Отменено'
    },
    priorities: {
      LOW: 'Низкий',
      MEDIUM: 'Средний',
      HIGH: 'Высокий',
      CRITICAL: 'Критический'
    },
    stats: {
      total: 'Всего обращений',
      inProgress: 'В процессе',
      solutionReady: 'Решение готово',
      waitingCustomer: 'Ожидает клиента',
      overdue: 'Просрочено',
      closed: 'Закрыто',
      reopened: 'Возвращено',
      customersTotal: 'Всего клиентов',
      customersActive: 'Активных клиентов',
      telegramLinked: 'Подключен Telegram',
      todayIssues: 'Обращения за сегодня'
    },
    actions: {
      newIssue: 'Новое обращение',
      addCustomer: 'Добавить клиента',
      addEmployee: 'Добавить сотрудника',
      acceptTask: 'Принять задачу',
      pauseTask: 'Режим ожидания',
      resumeTask: 'Продолжить работу',
      submitSolution: 'Сдать решение (Оператору)',
      contactCustomer: 'Связаться с клиентом',
      confirmClose: 'Подтверждено клиентом & Закрыть',
      reopen: 'Вернуть специалисту',
      addComment: 'Написать комментарий',
      filter: 'Фильтр',
      searchPlaceholder: 'Код, тема или клиент...',
      triggerCheck: 'Проверить напоминания сейчас',
      sendTelegramReport: 'Отправить отчет в Telegram',
      save: 'Сохранить',
      cancel: 'Отмена',
      ihamkorLookup: 'Поиск iHamkor',
      linkTelegram: 'Подключить Telegram',
      unlinkTelegram: 'Отключить Telegram',
      testTelegram: 'Тестовое уведомление',
      attachFile: 'Прикрепить файл',
      attachImage: 'Прикрепить фото',
      attachVideo: 'Прикрепить видео',
      exportExcel: 'Экспорт в Excel',
      printPdf: 'Печать / PDF'
    },
    customer: {
      inn: 'ИНН / ПИНФЛ',
      companyName: 'Наименование организации',
      region: 'Регион / Область',
      district: 'Район / Город',
      legalAddress: 'Юридический адрес',
      activityAddress: 'Фактический адрес',
      phone: 'Основной телефон',
      secondaryPhone: 'Доп. телефон',
      contactPerson: 'Контактное лицо (ФИО)',
      products: 'Программные продукты',
      telegramStatus: 'Статус Telegram',
      linked: 'Подключен',
      notLinked: 'Не подключен'
    }
  }
};
