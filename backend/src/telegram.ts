import { db } from './db';
import { Issue, StageId, User, UserRole } from './types';

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

  // 1. Notify Specialist when a new issue is assigned
  async notifySpecialistAssigned(issue: Issue, specialist: User): Promise<boolean> {
    const msg = `🔔 <b>YANGI VAZIFA BIRIKTIRILDI!</b>\n\n` +
      `📌 <b>Murojaat kodi:</b> <code>${issue.code}</code>\n` +
      `⚡️ <b>Muhimligi:</b> <b>${issue.priority}</b>\n` +
      `🏢 <b>Mijoz:</b> ${issue.customerName}\n` +
      `💻 <b>Dastur:</b> ${issue.productName} — ${issue.moduleName}\n` +
      `📝 <b>Muammo:</b> ${issue.title}\n\n` +
      `👤 <b>Qabul qilgan operator:</b> ${issue.created_by_operator_name}\n` +
      `⏰ <b>Muddati:</b> ${issue.dueDate ? new Date(issue.dueDate).toLocaleString('uz-UZ') : 'Belgilanmagan'}\n\n` +
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
      `🏢 <b>Mijoz:</b> ${issue.customerName} (${issue.customerPhone || 'Telefon kiritilmagan'})\n` +
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
      `🏢 <b>Mijoz:</b> ${issue.customerName}\n` +
      `💻 <b>Dastur:</b> ${issue.productName} (${issue.moduleName})\n` +
      `👨‍💻 <b>Mutaxassis:</b> ${issue.current_specialist_name || 'Mutaxassis'}\n` +
      `👤 <b>Operator:</b> ${issue.created_by_operator_name}\n` +
      `🌟 <b>Mijoz bahosi:</b> ${stars} (${issue.customerRating || 5}/5)\n` +
      (issue.customerFeedback ? `💬 <b>Mijoz fikri:</b> <i>"${issue.customerFeedback}"</i>\n` : '') +
      `\n✅ <i>4-bosqich to'liq yakunlandi va mijoz tasdig'i olindi.</i>`;

    db.addReminderLog({
      issueId: issue.id,
      issueCode: issue.code,
      issueTitle: issue.title,
      targetRole: 'SUPER_ADMIN',
      targetRecipient: 'Barcha xodimlar va Superadmin',
      stage: 'STAGE_4_CONFIRMED',
      message: msg,
      status: 'SENT'
    });

    return this.sendAdminAlert(msg);
  }

  // 5. Send Full Report Summary (Daily / Weekly / Monthly)
  async sendReportSummary(period: 'daily' | 'weekly' | 'monthly'): Promise<boolean> {
    const report = db.getReportSummary(period);
    const periodLabel = period === 'daily' ? 'KUNLIK' : period === 'weekly' ? 'HAFTALIK' : 'OYLIK';

    let specText = '';
    report.topSpecialists.forEach((s, idx) => {
      specText += `${idx + 1}. <b>${s.name}</b> — ${s.completed} ta yopilgan | ${s.avgHours} soat | KPI: <b>${s.score}%</b>\n`;
    });

    let opText = '';
    report.topOperators.forEach((o, idx) => {
      opText += `${idx + 1}. <b>${o.name}</b> — ${o.registered} ta qabul | ${o.closed} ta tasdiqlangan | KPI: <b>${o.score}%</b>\n`;
    });

    const msg = `📊 <b>TASK CONTROL: ${periodLabel} HISOBOT</b>\n` +
      `📅 <i>${new Date().toLocaleDateString('uz-UZ')} holatiga ko'ra</i>\n\n` +
      `📥 <b>Jami kelib tushgan:</b> ${report.totalReceived} ta\n` +
      `⚡️ <b>Bajarilmoqda:</b> ${report.currentlyInProgress} ta\n` +
      `⏳ <b>Mijoz tasdig'i kutilmoqda:</b> ${report.waitingForCustomer} ta\n` +
      `✅ <b>To'liq yopilgan:</b> ${report.totalClosed} ta\n` +
      `⚠️ <b>Qaytarilgan murojaatlar:</b> ${report.totalReopened} ta\n` +
      `⏱ <b>O'rtacha yechish vaqti:</b> ${report.averageResolutionHours} soat\n\n` +
      `🏆 <b>MUTAXASSISLAR REYTINGI:</b>\n${specText || 'Ma\'lumot yo\'q'}\n` +
      `🎯 <b>OPERATORLAR REYTINGI:</b>\n${opText || 'Ma\'lumot yo\'q'}\n` +
      `\n🔗 <i>Batafsil ma'lumot TASK CONTROL boshqaruv panelida mavjud.</i>`;

    return this.sendAdminAlert(msg);
  }

  // 6. Check Reminders for Stalled Issues
  async checkAndTriggerReminders(): Promise<number> {
    const issues = db.getIssues();
    const now = new Date().getTime();
    let remindersCreated = 0;

    for (const issue of issues) {
      // Stage 2: Specialist finished, but operator hasn't dispatched to customer
      if (issue.stage === 'STAGE_2_RESOLVED' && issue.status === 'SOLUTION_READY') {
        const resolvedTime = issue.resolvedAt ? new Date(issue.resolvedAt).getTime() : now;
        const diffHours = (now - resolvedTime) / (1000 * 60 * 60);

        const shouldRemind = !issue.lastReminderSentAt || diffHours >= 1; // Remind every 1 hour
        if (shouldRemind) {
          const operator = db.getUserById(issue.created_by_operator_id);
          const msg = `⚠️ <b>TASK CONTROL: YECHIM MIJOZGA YETKAZILMAGAN!</b>\n\n` +
            `📌 <b>Murojaat:</b> <code>${issue.code}</code> — ${issue.title}\n` +
            `🏢 <b>Mijoz:</b> ${issue.customerName} (${issue.customerPhone || ''})\n` +
            `👨‍💻 <b>Mutaxassis:</b> ${issue.current_specialist_name || 'Mutaxassis'}\n` +
            `👤 <b>Mas'ul operator:</b> ${issue.created_by_operator_name}\n\n` +
            `❗️ <i>Mutaxassis yechimni topshirgan, biroq operator hali mijoz bilan bog'lanmadi. Iltimos, mijozga yechimni yetkazing!</i>`;

          db.addReminderLog({
            issueId: issue.id,
            issueCode: issue.code,
            issueTitle: issue.title,
            targetRole: 'OPERATOR',
            targetRecipient: `Operator (${issue.created_by_operator_name}) & Admin`,
            stage: 'STAGE_2_RESOLVED',
            message: msg,
            status: 'SENT'
          });

          await this.sendAdminAlert(msg);
          if (operator?.telegramChatId) {
            await this.sendTelegramMessage(operator.telegramChatId, msg);
          }

          db.updateIssue(issue.id, {
            lastReminderSentAt: new Date().toISOString(),
            reminderCount: (issue.reminderCount || 0) + 1
          });
          remindersCreated++;
        }
      }

      // Stage 3: Dispatched to customer, but waiting for customer confirmation > 24 hours
      if (issue.stage === 'STAGE_3_DISPATCHED' && issue.status === 'CUSTOMER_CONTACT') {
        const dispatchedTime = issue.dispatchedAt ? new Date(issue.dispatchedAt).getTime() : now;
        const diffHours = (now - dispatchedTime) / (1000 * 60 * 60);

        if (diffHours >= 24 && (!issue.lastReminderSentAt || (now - new Date(issue.lastReminderSentAt).getTime()) > (6 * 3600 * 1000))) {
          const msg = `⏳ <b>TASK CONTROL: MIJOZ TASDIG'I KUTILMOQDA!</b>\n\n` +
            `📌 <b>Murojaat:</b> <code>${issue.code}</code> — ${issue.title}\n` +
            `🏢 <b>Mijoz:</b> ${issue.customerName} (${issue.customerPhone || ''})\n` +
            `👤 <b>Mas'ul operator:</b> ${issue.created_by_operator_name}\n\n` +
            `❗️ <i>Yechim mijozga yetkazilganiga 24 soatdan oshdi. Iltimos, mijoz bilan qayta bog'lanib yakuniy tasdiqni oling!</i>`;

          db.addReminderLog({
            issueId: issue.id,
            issueCode: issue.code,
            issueTitle: issue.title,
            targetRole: 'OPERATOR',
            targetRecipient: `Operator (${issue.created_by_operator_name})`,
            stage: 'STAGE_3_DISPATCHED',
            message: msg,
            status: 'SENT'
          });

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

  // Handle incoming commands like: /start link_TC-SP-301 or /start TC-SP-301
  private async handleIncomingMessage(msg: any) {
    const chatId = String(msg.chat.id);
    const text = msg.text.trim();
    const username = msg.from?.username || '';
    const senderName = [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(' ') || 'Foydalanuvchi';

    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      const param = parts[1] ? parts[1].replace('link_', '') : '';

      if (param) {
        // Lookup user by link code or login
        const user = db.getUserByLinkCode(param) || db.getUserByLogin(param);
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
        `Profilingizni bog'lash uchun tizimdagi maxsus kod bilan /start buyrug'ini yuboring (masalan: <code>/start link_TC-SP-301</code>).`
      );
    }
  }
}

export const telegramService = new TelegramService();
