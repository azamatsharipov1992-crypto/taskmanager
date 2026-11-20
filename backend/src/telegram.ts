import { db } from './db';
import { Customer, Issue, StageId, User, UserRole } from './types';

export class TelegramService {
  private botToken: string;
  private defaultAdminChatId: string;
  private lastUpdateId: number = 0;
  private pollingActive: boolean = false;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '7996799482:AAGuXIr6jk-9fvY3kpo-nGQQV7X_CEYKPLc';
    this.defaultAdminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID || '53663779';
    this.startBotPolling();
  }

  async sendTelegramMessage(chatId: string, text: string): Promise<boolean> {
    const targetChatId = chatId || this.defaultAdminChatId;
    if (!this.botToken) {
      console.log(`[TELEGRAM SIMULATOR] To ChatId: ${targetChatId}\nMessage:\n${text}`);
      return true;
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChatId,
          text: text,
          parse_mode: 'HTML'
        })
      });
      const data = await response.json();
      if (!data.ok) {
        console.error('[TELEGRAM API ERROR]', data);
      }
      return data.ok === true;
    } catch (err) {
      console.error('[TELEGRAM ERROR] Failed to send message:', err);
      return false;
    }
  }

  async sendAdminAlert(text: string): Promise<boolean> {
    const recipients = db.getTelegramRecipients().filter(r => r.isActive);
    if (recipients.length === 0) {
      return this.sendTelegramMessage(this.defaultAdminChatId, text);
    }
    const promises = recipients.map(r => this.sendTelegramMessage(r.chatId, text));
    const results = await Promise.all(promises);
    return results.some(r => r === true);
  }

  // ==========================================
  // CUSTOMER NOTIFICATIONS
  // ==========================================

  // 1. Notify Customer when new Issue is created
  async notifyCustomerIssueCreated(issue: Issue, customer: Customer): Promise<boolean> {
    if (!customer.telegramChatId || !customer.notificationConsent) return false;

    const isRu = customer.preferredLanguage === 'RU';
    const text = isRu
      ? `🔔 <b>TASK CONTROL — Ваше обращение зарегистрировано</b>\n\n` +
        `Уважаемый клиент!\n` +
        `Ваше обращение успешно зарегистрировано в системе поддержки.\n\n` +
        `📌 <b>Номер обращения:</b> <code>#${issue.code}</code>\n` +
        `🏢 <b>Организация:</b> ${customer.companyName}\n` +
        `💻 <b>Продукт:</b> ${issue.productName} (${issue.moduleName})\n` +
        `📝 <b>Тема:</b> ${issue.title}\n` +
        `⚡ <b>Приоритет:</b> ${issue.priority}\n` +
        `⏱ <b>Дата:</b> ${new Date().toLocaleDateString('ru-RU')}\n` +
        `📊 <b>Статус:</b> Зарегистрировано, передаётся специалисту.\n\n` +
        `<i>Мы будем информировать вас о ходе выполнения через этот Telegram-чат.</i>`
      : `🔔 <b>TASK CONTROL — Murojaatingiz qabul qilindi</b>\n\n` +
        `Hurmatli mijoz!\n` +
        `Sizning murojaatingiz texnik qo‘llab-quvvatlash tizimida ro‘yxatga olindi.\n\n` +
        `📌 <b>Murojaat raqami:</b> <code>#${issue.code}</code>\n` +
        `🏢 <b>Korxona:</b> ${customer.companyName}\n` +
        `💻 <b>Dastur:</b> ${issue.productName} (${issue.moduleName})\n` +
        `📝 <b>Mavzu:</b> ${issue.title}\n` +
        `⚡ <b>Muhimligi:</b> ${issue.priority}\n` +
        `⏱ <b>Sana:</b> ${new Date().toLocaleDateString('uz-UZ')}\n` +
        `📊 <b>Holati:</b> Qabul qilindi, mas’ul mutaxassisga yo‘naltirilmoqda.\n\n` +
        `<i>Ish jarayoni haqida sizga ushbu Telegram-bot orqali xabar berib boramiz.</i>`;

    const sent = await this.sendTelegramMessage(customer.telegramChatId, text);
    db.addCustomerNotificationLog({
      customerId: customer.id,
      customerName: customer.companyName,
      issueId: issue.id,
      issueCode: issue.code,
      telegramChatId: customer.telegramChatId,
      notificationType: 'ISSUE_CREATED',
      message: text,
      deliveryStatus: sent ? 'SENT' : 'FAILED',
      errorMessage: sent ? undefined : 'Xabar yuborishda xatolik yuz berdi'
    });
    return sent;
  }

  // 2. Notify Customer when Solution is Ready
  async notifyCustomerSolutionReady(issue: Issue, customer: Customer): Promise<boolean> {
    if (!customer.telegramChatId || !customer.notificationConsent) return false;

    const isRu = customer.preferredLanguage === 'RU';
    const text = isRu
      ? `✅ <b>TASK CONTROL — Техническое решение готово!</b>\n\n` +
        `Уважаемый клиент!\n` +
        `По вашему обращению <code>#${issue.code}</code> («${issue.title}») технические работы успешно завершены.\n\n` +
        (issue.appVersion ? `📦 <b>Версия обновления:</b> ${issue.appVersion}\n` : '') +
        (issue.solutionNote ? `📝 <b>Отчет о решении:</b> <i>${issue.solutionNote}</i>\n\n` : '\n') +
        `Наш оператор свяжется с вами для проверки и подтверждения результата.`
      : `✅ <b>TASK CONTROL — Muammo bo‘yicha texnik yechim tayyorlandi!</b>\n\n` +
        `Hurmatli mijoz!\n` +
        `Sizning <code>#${issue.code}</code> («${issue.title}») raqamli murojaatingiz bo‘yicha texnik ishlar yakunlandi.\n\n` +
        (issue.appVersion ? `📦 <b>Dastur versiyasi:</b> ${issue.appVersion}\n` : '') +
        (issue.solutionNote ? `📝 <b>Bajarilgan ish:</b> <i>${issue.solutionNote}</i>\n\n` : '\n') +
        `Mutaxassis tomonidan yechim taqdim etildi. Operatorimiz siz bilan bog‘lanib, natijani yetkazadi va sinovdan o‘tkazishni taklif qiladi.`;

    const sent = await this.sendTelegramMessage(customer.telegramChatId, text);
    db.addCustomerNotificationLog({
      customerId: customer.id,
      customerName: customer.companyName,
      issueId: issue.id,
      issueCode: issue.code,
      telegramChatId: customer.telegramChatId,
      notificationType: 'SOLUTION_READY',
      message: text,
      deliveryStatus: sent ? 'SENT' : 'FAILED',
      errorMessage: sent ? undefined : 'Xabar yuborishda xatolik yuz berdi'
    });
    return sent;
  }

  // 3. Notify Customer when Issue is Closed
  async notifyCustomerIssueClosed(issue: Issue, customer: Customer): Promise<boolean> {
    if (!customer.telegramChatId || !customer.notificationConsent) return false;

    const isRu = customer.preferredLanguage === 'RU';
    const text = isRu
      ? `🎉 <b>TASK CONTROL — Обращение закрыто</b>\n\n` +
        `Уважаемый клиент!\n` +
        `Обращение <code>#${issue.code}</code> успешно закрыто на основе вашего подтверждения.\n\n` +
        `Спасибо за сотрудничество и доверие к нашим продуктам!`
      : `🎉 <b>TASK CONTROL — Murojaatingiz rasman yopildi</b>\n\n` +
        `Hurmatli mijoz!\n` +
        `<code>#${issue.code}</code> raqamli murojaatingiz muammo to‘liq hal etilgani tasdiqlanganligi sababli yopildi.\n\n` +
        `Hamkorligingiz va tizimimizdan foydalanganingiz uchun tashakkur!`;

    const sent = await this.sendTelegramMessage(customer.telegramChatId, text);
    db.addCustomerNotificationLog({
      customerId: customer.id,
      customerName: customer.companyName,
      issueId: issue.id,
      issueCode: issue.code,
      telegramChatId: customer.telegramChatId,
      notificationType: 'ISSUE_CLOSED',
      message: text,
      deliveryStatus: sent ? 'SENT' : 'FAILED',
      errorMessage: sent ? undefined : 'Xabar yuborishda xatolik yuz berdi'
    });
    return sent;
  }

  // 4. Test Notification to Customer
  async sendCustomerTestNotification(customer: Customer): Promise<boolean> {
    if (!customer.telegramChatId) return false;

    const isRu = customer.preferredLanguage === 'RU';
    const text = isRu
      ? `🧪 <b>TASK CONTROL — Тестовое уведомление</b>\n\n` +
        `Здравствуйте, ${customer.contactPerson || customer.companyName}!\n` +
        `Telegram-уведомления для организации "${customer.companyName}" успешно настроены и активны.`
      : `🧪 <b>TASK CONTROL — Test bildirishnomasi</b>\n\n` +
        `Assalomu alaykum, ${customer.contactPerson || customer.companyName}!\n` +
        `"${customer.companyName}" korxonasi uchun Telegram xabarnomalar xizmati muvaffaqiyatli ishlamoqda.`;

    const sent = await this.sendTelegramMessage(customer.telegramChatId, text);
    db.addCustomerNotificationLog({
      customerId: customer.id,
      customerName: customer.companyName,
      telegramChatId: customer.telegramChatId,
      notificationType: 'TEST',
      message: text,
      deliveryStatus: sent ? 'SENT' : 'FAILED',
      errorMessage: sent ? undefined : 'Xabar yuborishda xatolik yuz berdi'
    });
    return sent;
  }

  // ==========================================
  // INTERNAL EMPLOYEE NOTIFICATIONS
  // ==========================================

  // 1. Notify Specialist when a new issue is assigned
  async notifySpecialistAssigned(issue: Issue, specialist: User): Promise<boolean> {
    const msg = `🔔 <b>YANGI VAZIFA BIRIKTIRILDI!</b>\n\n` +
      `📌 <b>Murojaat kodi:</b> <code>${issue.code}</code>\n` +
      `⚡️ <b>Muhimligi:</b> <b>${issue.priority}</b>\n` +
      `🏢 <b>Mijoz:</b> ${issue.customerName} (STIR: ${issue.customerInn || '-'})\n` +
      `📍 <b>Hudud:</b> ${issue.regionName || '-'}\n` +
      `💻 <b>Dastur:</b> ${issue.productName} — ${issue.moduleName}\n` +
      `📝 <b>Muammo:</b> ${issue.title}\n\n` +
      `👤 <b>Qabul qilgan operator:</b> ${issue.created_by_operator_name}\n` +
      `⏱ <b>Muddati:</b> ${issue.dueDate ? new Date(issue.dueDate).toLocaleString('uz-UZ') : 'Belgilanmagan'}\n\n` +
      `👉 <i>Iltimos, TASK CONTROL tizimiga kirib vazifani qabul qiling va bajarishni boshlang!</i>`;

    db.addReminderLog({
      issueId: issue.id,
      issueCode: issue.code,
      issueTitle: issue.title,
      targetRole: 'MUTAXASSIS',
      targetRecipient: `${specialist.name} (${specialist.telegramUsername || specialist.phone})`,
      stage: 'STAGE_1_ACCEPTED',
      message: msg,
      status: 'SENT'
    });

    if (specialist.telegramChatId) {
      await this.sendTelegramMessage(specialist.telegramChatId, msg);
    }
    return this.sendAdminAlert(msg);
  }

  // 2. Notify Operator when Specialist finishes solution
  async notifyOperatorSolutionReady(issue: Issue, operator: User, specialist: User): Promise<boolean> {
    const msg = `✅ <b>MUTAXASSIS YECHIMNI TOPSHIRDI!</b>\n\n` +
      `📌 <b>Murojaat kodi:</b> <code>${issue.code}</code>\n` +
      `🏢 <b>Mijoz:</b> ${issue.customerName} (${issue.contactPhoneSnapshot || issue.customerPhone || 'Telefon kiritilmagan'})\n` +
      `📍 <b>Hudud:</b> ${issue.regionName || '-'}\n` +
      `👨‍💻 <b>Mas'ul mutaxassis:</b> ${specialist.name}\n` +
      `📝 <b>Yechim tavsifi:</b> ${issue.solutionNote || 'Yechim tayyor'}\n` +
      (issue.appVersion ? `📦 <b>Versiya:</b> ${issue.appVersion}\n` : '') +
      (issue.commitUrl ? `🔗 <b>Commit:</b> ${issue.commitUrl}\n` : '') +
      `\n👤 <b>Mas'ul operator:</b> ${operator.name}\n\n` +
      `⚠️ <b>MUHIM:</b> <i>Dasturchi yechim bergani bilan murojaat yopilmaydi! Iltimos, mijoz bilan zudlikda bog'lanib, yangilanishni yetkazing va tasdiqni oling!</i>`;

    db.addReminderLog({
      issueId: issue.id,
      issueCode: issue.code,
      issueTitle: issue.title,
      targetRole: 'OPERATOR',
      targetRecipient: `${operator.name} (${operator.telegramUsername || operator.phone})`,
      stage: 'STAGE_2_RESOLVED',
      message: msg,
      status: 'SENT'
    });

    if (operator.telegramChatId) {
      await this.sendTelegramMessage(operator.telegramChatId, msg);
    }
    return this.sendAdminAlert(msg);
  }

  // 3. Notify Specialist when Issue is Reopened (Customer unsatisfied)
  async notifySpecialistReopened(issue: Issue, specialist: User, returnReason: string): Promise<boolean> {
    const msg = `⚠️ <b>DIQQAT: MUROJAAT QAYTARILDI!</b>\n\n` +
      `📌 <b>Murojaat kodi:</b> <code>${issue.code}</code> (Ish sikli #${issue.currentCycleNumber})\n` +
      `🏢 <b>Mijoz:</b> ${issue.customerName}\n` +
      `💻 <b>Dastur:</b> ${issue.productName}\n` +
      `👨‍💻 <b>Mutaxassis:</b> ${specialist.name}\n` +
      `👤 <b>Qaytargan operator:</b> ${issue.created_by_operator_name}\n\n` +
      `❌ <b>Mijoz e'tirozi / Qaytarish sababi:</b>\n<i>"${returnReason}"</i>\n\n` +
      `👉 <i>Mijoz muammo bartaraf etilmaganini tasdiqlamadi. Iltimos, zudlik bilan qayta tahlil qiling!</i>`;

    db.addReminderLog({
      issueId: issue.id,
      issueCode: issue.code,
      issueTitle: issue.title,
      targetRole: 'MUTAXASSIS',
      targetRecipient: `${specialist.name} (${specialist.telegramUsername || specialist.phone})`,
      stage: 'STAGE_1_ACCEPTED',
      message: msg,
      status: 'SENT'
    });

    if (specialist.telegramChatId) {
      await this.sendTelegramMessage(specialist.telegramChatId, msg);
    }
    return this.sendAdminAlert(msg);
  }

  // 4. Notify when Issue is successfully Closed
  async notifyIssueClosed(issue: Issue): Promise<boolean> {
    const stars = '⭐️'.repeat(issue.customerRating || 5);
    const msg = `🎉 <b>MUROJAAT MUVOFAQIYATLI YOPILDI!</b>\n\n` +
      `📌 <b>Murojaat kodi:</b> <code>${issue.code}</code>\n` +
      `🏢 <b>Mijoz:</b> ${issue.customerName} (STIR: ${issue.customerInn || '-'})\n` +
      `📍 <b>Viloyat:</b> ${issue.regionName || '-'}\n` +
      `💻 <b>Dastur:</b> ${issue.productName} (${issue.moduleName})\n` +
      `👨‍💻 <b>Mutaxassis:</b> ${issue.current_specialist_name || 'Mutaxassis'}\n` +
      `👤 <b>Operator:</b> ${issue.created_by_operator_name}\n` +
      `🌟 <b>Mijoz bahosi:</b> ${stars} (${issue.customerRating || 5}/5)\n` +
      (issue.customerFeedback ? `💬 <b>Mijoz fikri:</b> <i>"${issue.customerFeedback}"</i>\n` : '') +
      `⏱ <b>Yopilgan sana:</b> ${new Date().toLocaleString('uz-UZ')}\n\n` +
      `✅ <i>Barcha 4 nazorat bosqichlari to‘liq muvaffaqiyatli yakunlandi!</i>`;

    db.addReminderLog({
      issueId: issue.id,
      issueCode: issue.code,
      issueTitle: issue.title,
      targetRole: 'SUPER_ADMIN',
      targetRecipient: 'Boshqaruv & Administratorlar',
      stage: 'STAGE_4_CONFIRMED',
      message: msg,
      status: 'SENT'
    });

    return this.sendAdminAlert(msg);
  }

  // 5. Send Daily Monitoring Summary Report
  async sendDailyReportToAdmins(): Promise<boolean> {
    const summary = db.getReportSummary('daily');
    const msg = `📊 <b>TASK CONTROL — KUNDALIK MONITORING HISOBOTI</b>\n` +
      `📅 <b>Sana:</b> ${new Date().toLocaleDateString('uz-UZ')}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📥 <b>Jami qabul qilingan:</b> ${summary.totalReceived}\n` +
      `⚙️ <b>Jarayondagi topshiriqlar:</b> ${summary.currentlyInProgress}\n` +
      `📞 <b>Mijoz tasdig'i kutilayotganlar:</b> ${summary.waitingForCustomer}\n` +
      `✅ <b>Muvaffaqiyatli yopilganlar:</b> ${summary.totalClosed}\n` +
      `⚠️ <b>Qayta ochilganlar soni:</b> ${summary.totalReopened}\n\n` +
      `🏆 <b>KUN QAHRAMONLARI (KPI):</b>\n` +
      summary.topSpecialists.map((s, idx) => `${idx + 1}. ${s.name} — ${s.completed} ta vazifa (${s.score} ball)`).join('\n') +
      `\n\n<i>Avtomatik ravishda TASK CONTROL Cloud Server orqali shakllantirildi.</i>`;

    return this.sendAdminAlert(msg);
  }

  // 6. Escalation Reminder Check
  async checkAndTriggerEscalations(): Promise<number> {
    const issues = db.getIssues();
    const now = new Date().getTime();
    let remindersCreated = 0;

    for (const issue of issues) {
      if (issue.status === 'CLOSED' || issue.status === 'CANCELLED') continue;

      // Rule: In stage 3 (Solution delivered to customer) > 2 hours -> remind operator
      if (issue.stage === 'STAGE_3_DISPATCHED' && issue.dispatchedAt) {
        const diffHours = (now - new Date(issue.dispatchedAt).getTime()) / (1000 * 3600);
        if (diffHours >= 2) {
          const operator = db.getUserById(issue.created_by_operator_id);
          const msg = `⏰ <b>ESLATMA: MIJOZ TASDIG'I KUTILMOQDA!</b>\n\n` +
            `📌 <b>Murojaat kodi:</b> <code>${issue.code}</code>\n` +
            `🏢 <b>Mijoz:</b> ${issue.customerName} (${issue.contactPhoneSnapshot || issue.customerPhone || 'Telefon mavjud emas'})\n` +
            `⏱ Yechim topshirilganiga <b>${Math.floor(diffHours)} soat</b> bo‘ldi.\n\n` +
            `👤 <b>Mas'ul operator:</b> ${issue.created_by_operator_name}\n` +
            `👉 <i>Iltimos, mijoz bilan bog'lanib natijani tasdiqlang va murojaatni yoping!</i>`;

          db.addReminderLog({
            issueId: issue.id,
            issueCode: issue.code,
            issueTitle: issue.title,
            targetRole: 'OPERATOR',
            targetRecipient: `${issue.created_by_operator_name}`,
            stage: 'STAGE_3_DISPATCHED',
            message: msg,
            status: 'SENT'
          });

          if (operator?.telegramChatId) {
            await this.sendTelegramMessage(operator.telegramChatId, msg);
          }
          await this.sendAdminAlert(msg);
          db.updateIssue(issue.id, {
            lastReminderSentAt: new Date().toISOString(),
            reminderCount: (issue.reminderCount || 0) + 1
          });
          remindersCreated++;
        }
      }
    }

    return remindersCreated;
  }

  // 7. Background Bot Update Polling for Telegram Account Linking
  private startBotPolling() {
    if (this.pollingActive || !this.botToken) return;
    this.pollingActive = true;

    // Check updates every 5 seconds
    setInterval(async () => {
      try {
        const url = `https://api.telegram.org/bot${this.botToken}/getUpdates?offset=${this.lastUpdateId + 1}&timeout=3`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.ok && Array.isArray(data.result)) {
          for (const update of data.result) {
            this.lastUpdateId = Math.max(this.lastUpdateId, update.update_id);
            if (update.message && update.message.text) {
              await this.handleIncomingMessage(update.message);
            }
          }
        }
      } catch (err) {
        // Silently catch network hiccups
      }
    }, 5000);
  }

  // Handle incoming commands like:
  // /start link_TC-SP-301 (employee)
  // /start cust_302845112_xyz (customer)
  private async handleIncomingMessage(msg: any) {
    const chatId = String(msg.chat.id);
    const text = msg.text.trim();
    const username = msg.from?.username || '';
    const senderName = [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(' ') || 'Foydalanuvchi';

    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      const rawParam = parts[1] || '';

      // A. Check if Customer link token (starts with cust_)
      if (rawParam.startsWith('cust_')) {
        const customer = db.getCustomerByLinkToken(rawParam);
        if (customer) {
          if (customer.telegramLinkExpiresAt && new Date(customer.telegramLinkExpiresAt).getTime() < Date.now()) {
            await this.sendTelegramMessage(
              chatId,
              `⚠️ <b>Kechirasiz, ushbu bog‘lash havolasining amal qilish muddati tugagan!</b>\n\n` +
              `Iltimos, operatoringizdan yangi bog‘lash havolasini yuborishni so‘rang.`
            );
            return;
          }

          db.linkCustomerTelegram(customer.id, chatId, username);

          const isRu = customer.preferredLanguage === 'RU';
          const successMsg = isRu
            ? `🎉 <b>Здравствуйте, ${customer.contactPerson || customer.companyName}!</b>\n\n` +
              `✅ Ваша организация <b>"${customer.companyName}"</b> успешно подключена к системе поддержки <b>TASK CONTROL</b>!\n` +
              `🏢 <b>ИНН:</b> <code>${customer.inn}</code>\n` +
              `📍 <b>Регион:</b> ${customer.regionName}\n\n` +
              `Теперь уведомления обо всех ваших обращениях и готовых решениях будут оперативно приходить в этот чат.`
            : `🎉 <b>Assalomu alaykum, ${customer.contactPerson || customer.companyName}!</b>\n\n` +
              `✅ Sizning <b>"${customer.companyName}"</b> korxonangiz <b>TASK CONTROL</b> texnik qo‘llab-quvvatlash tizimiga muvaffaqiyatli bog‘landi!\n` +
              `🏢 <b>STIR/INN:</b> <code>${customer.inn}</code>\n` +
              `📍 <b>Hudud:</b> ${customer.regionName}\n\n` +
              `Endi barcha texnik murojaatlaringiz holati, tayyorlangan yechimlar va yangilanishlar sizga ushbu bot orqali yetkazib boriladi.`;

          await this.sendTelegramMessage(chatId, successMsg);
          db.addCustomerNotificationLog({
            customerId: customer.id,
            customerName: customer.companyName,
            telegramChatId: chatId,
            notificationType: 'LINK_CONFIRMED',
            message: successMsg,
            deliveryStatus: 'SENT'
          });
          return;
        }
      }

      // B. Check if Employee link code (starts with link_ or TC-)
      const employeeParam = rawParam.replace('link_', '');
      if (employeeParam) {
        const user = db.getUserByLinkCode(employeeParam) || db.getUserByLogin(employeeParam);
        if (user) {
          db.linkUserTelegram(user.id, chatId, username);
          await this.sendTelegramMessage(
            chatId,
            `🎉 <b>Assalomu alaykum, ${user.name}!</b>\n\n` +
            `✅ Sizning Telegram hisobingiz <b>TASK CONTROL</b> tizimidagi profilingizga muvaffaqiyatli bog'landi!\n` +
            `👤 <b>Rol:</b> ${user.role}\n` +
            `📱 <b>Telefon:</b> ${user.phone}\n\n` +
            `Endi sizga barcha biriktirilgan vazifalar va bildirishnomalar ushbu bot orqali avtomatik yuboriladi.`
          );
          return;
        }
      }

      // Default welcome
      await this.sendTelegramMessage(
        chatId,
        `👋 <b>Assalomu alaykum, ${senderName}!</b>\n\n` +
        `Bu <b>TASK CONTROL</b> avtomatlashtirilgan xabarnomalar boti.\n\n` +
        `Sizning Telegram Chat ID: <code>${chatId}</code>\n` +
        (username ? `Username: @${username}\n\n` : '\n') +
        `Profilingiz yoki korxonangizni bog'lash uchun tizimdagi maxsus havola orqali botga kiring.`
      );
    }
  }
}

export const telegramService = new TelegramService();
