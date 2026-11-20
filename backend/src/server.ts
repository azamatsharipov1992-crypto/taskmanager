import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { db } from './db';
import { telegramService } from './telegram';
import { iHamkorService } from './ihamkor';
import { DashboardStats, IssueStatus, Priority, StageId, UserRole } from './types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'TASK CONTROL Cloud Backend',
    version: '2.1.0',
    time: new Date().toISOString()
  });
});

// ==========================================
// REGIONS & DISTRICTS
// ==========================================

app.get('/api/regions', (req, res) => {
  res.json(db.getRegions());
});

app.get('/api/regions/:id', (req, res) => {
  const region = db.getRegionById(req.params.id);
  if (!region) return res.status(404).json({ error: 'Hudud topilmadi!' });
  res.json(region);
});

app.get('/api/regions/:id/districts', (req, res) => {
  const districts = db.getDistrictsByRegion(req.params.id);
  res.json(districts);
});

// ==========================================
// SOFTWARE PRODUCTS
// ==========================================

app.get('/api/software-products', (req, res) => {
  res.json(db.getProducts());
});

app.get('/api/products', (req, res) => {
  res.json(db.getProducts());
});

// ==========================================
// iHAMKOR INTEGRATION
// ==========================================

app.get('/api/integrations/ihamkor/status', (req, res) => {
  res.json(iHamkorService.getStatus());
});

app.post('/api/integrations/ihamkor/company-lookup', async (req, res) => {
  const { inn } = req.body;
  if (!inn) return res.status(400).json({ error: 'STIR/INN kiritilishi shart!' });

  const cleanInn = String(inn).trim().replace(/\D/g, '');
  if (cleanInn.length !== 9) {
    return res.status(400).json({ error: 'STIR/INN aynan 9 ta raqamdan iborat bo‘lishi shart!' });
  }

  // Check if customer already exists in our database
  const existing = db.getCustomerByInn(cleanInn);
  if (existing) {
    return res.json({
      success: true,
      exists: true,
      customer: existing,
      message: `Ushbu STIR (${cleanInn}) bo‘yicha mijoz bazada mavjud: "${existing.companyName}"!`
    });
  }

  const lookupResult = await iHamkorService.lookupCompanyByInn(cleanInn);
  if (!lookupResult.success) {
    return res.status(400).json({ error: lookupResult.error });
  }

  res.json({
    success: true,
    exists: false,
    data: lookupResult.data
  });
});

// ==========================================
// CUSTOMER ACCOUNTS DIRECTORY
// ==========================================

app.get('/api/customers', (req, res) => {
  const { search, regionId, productId, telegramLinked, isActive } = req.query;
  const customers = db.getCustomers({
    search: search ? String(search) : undefined,
    regionId: regionId ? String(regionId) : undefined,
    productId: productId ? String(productId) : undefined,
    telegramLinked: telegramLinked ? String(telegramLinked) : undefined,
    isActive: isActive ? String(isActive) : undefined
  });
  res.json(customers);
});

app.get('/api/customers/:id', (req, res) => {
  const customer = db.getCustomerById(req.params.id);
  if (!customer) return res.status(404).json({ error: 'Mijoz topilmadi!' });
  res.json(customer);
});

app.post('/api/customers', (req, res) => {
  const {
    inn,
    companyName,
    shortName,
    companyStatus,
    legalAddress,
    regionId,
    districtId,
    districtName,
    activityAddress,
    primaryPhone,
    secondaryPhone,
    contactPerson,
    position,
    preferredLanguage,
    responsibleOperatorId,
    notes,
    products,
    productIds,
    dataSource
  } = req.body;

  if (!inn || !companyName || !primaryPhone || !contactPerson || !regionId) {
    return res.status(400).json({
      error: 'STIR/INN, korxona nomi, viloyat, asosiy telefon va mas’ul shaxs kiritilishi shart!'
    });
  }

  const result = db.addCustomer({
    inn,
    companyName,
    shortName,
    companyStatus,
    legalAddress,
    regionId,
    districtId,
    districtName,
    activityAddress,
    primaryPhone,
    secondaryPhone,
    contactPerson,
    position,
    preferredLanguage: preferredLanguage || 'UZ',
    responsibleOperatorId,
    notes,
    products,
    productIds,
    dataSource: dataSource || 'MANUAL'
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.status(201).json(result.customer);
});

app.put('/api/customers/:id', (req, res) => {
  const result = db.updateCustomer(req.params.id, req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json(result.customer);
});

app.delete('/api/customers/:id', (req, res) => {
  const result = db.deleteCustomer(req.params.id);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ success: true, message: 'Mijoz ma\'lumotlar bazasidan o\'chirildi.' });
});

// Generate Telegram linking link/token for customer
app.post('/api/customers/:id/telegram-link', (req, res) => {
  const result = db.setCustomerTelegramLinkToken(req.params.id);
  if (!result.success) return res.status(404).json({ error: result.error });
  res.json(result);
});

// Unlink Telegram from customer
app.post('/api/customers/:id/unlink-telegram', (req, res) => {
  const success = db.unlinkCustomerTelegram(req.params.id);
  if (!success) return res.status(404).json({ error: 'Mijoz topilmadi!' });
  res.json({ success: true, message: 'Mijoz Telegram hisobi uzildi.' });
});

// Test Telegram notification to customer
app.post('/api/customers/:id/notifications/test', async (req, res) => {
  const customer = db.getCustomerById(req.params.id);
  if (!customer) return res.status(404).json({ error: 'Mijoz topilmadi!' });
  if (!customer.telegramChatId) {
    return res.status(400).json({ error: 'Mijozning Telegram hisobi bog‘lanmagan!' });
  }

  const success = await telegramService.sendCustomerTestNotification(customer);
  res.json({ success, message: success ? 'Test xabari yuborildi!' : 'Xabar yuborishda xatolik yuz berdi.' });
});

// Get customer notification logs
app.get('/api/customers/:id/notifications', (req, res) => {
  const logs = db.getCustomerNotificationLogs({ customerId: req.params.id });
  res.json(logs);
});

// ==========================================
// EMPLOYEES & USERS CRUD
// ==========================================

app.get('/api/employees', (req, res) => {
  const { role, isActive, search } = req.query;
  const filters: any = {};
  if (role) filters.role = String(role);
  if (isActive !== undefined) filters.isActive = isActive === 'true';
  if (search) filters.search = String(search);

  const employees = db.getUsers(filters);
  res.json(employees);
});

app.get('/api/users', (req, res) => {
  res.json(db.getUsers());
});

app.get('/api/employees/:id', (req, res) => {
  const user = db.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Xodim topilmadi!' });

  const issues = db.getIssues();
  const assignedIssues = issues.filter(i => i.current_specialist_id === user.id);
  const registeredIssues = issues.filter(i => i.created_by_operator_id === user.id);

  res.json({
    ...user,
    stats: {
      assignedCount: assignedIssues.length,
      inProgressCount: assignedIssues.filter(i => i.status === 'IN_PROGRESS').length,
      solutionReadyCount: assignedIssues.filter(i => i.status === 'SOLUTION_READY').length,
      closedSpecialistCount: assignedIssues.filter(i => i.status === 'CLOSED').length,
      registeredCount: registeredIssues.length,
      closedOperatorCount: registeredIssues.filter(i => i.status === 'CLOSED').length,
      reopenedCount: issues.filter(i => (i.current_specialist_id === user.id || i.created_by_operator_id === user.id) && i.reopenCount > 0).length
    }
  });
});

app.post('/api/employees', (req, res) => {
  const { name, phone, role, login, email, password, telegramUsername, telegramChatId } = req.body;
  if (!name || !phone || !role || !login) {
    return res.status(400).json({ error: 'FIO, telefon, rol va login kiritilishi shart!' });
  }

  const result = db.addUser({
    name,
    phone,
    role,
    login,
    email,
    password,
    telegramUsername,
    telegramChatId
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.status(201).json(result.user);
});

app.put('/api/employees/:id', (req, res) => {
  const result = db.updateUser(req.params.id, req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json(result.user);
});

app.delete('/api/employees/:id', (req, res) => {
  const result = db.deleteUser(req.params.id);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ success: true, message: 'Xodim tizimdan o\'chirildi.' });
});

app.patch('/api/employees/:id/toggle', (req, res) => {
  const result = db.toggleUserStatus(req.params.id);
  if (!result.success) {
    return res.status(404).json({ error: 'Xodim topilmadi!' });
  }
  res.json(result.user);
});

app.post('/api/employees/:id/link-telegram', (req, res) => {
  const { chatId, username } = req.body;
  if (!chatId) return res.status(400).json({ error: 'Telegram Chat ID kiritilishi shart!' });
  const success = db.linkUserTelegram(req.params.id, String(chatId), username);
  if (!success) return res.status(404).json({ error: 'Xodim topilmadi!' });
  res.json({ success: true, user: db.getUserById(req.params.id) });
});

// ==========================================
// ATTACHMENTS & MEDIA FILES
// ==========================================

// Upload attachment to issue
app.post('/api/issues/:id/attachments', (req, res) => {
  const { originalName, mimeType, base64, uploadedBy } = req.body;
  if (!originalName || !base64) {
    return res.status(400).json({ error: 'Fayl nomi va base64 ma\'lumotlari kiritilishi shart!' });
  }

  const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
  const buffer = Buffer.from(cleanBase64, 'base64');

  const attachment = db.saveAttachment(req.params.id, {
    originalName,
    mimeType: mimeType || 'application/octet-stream',
    buffer,
    uploadedBy: uploadedBy || 'Operator'
  });

  res.status(201).json(attachment);
});

// View / Stream attachment inline
app.get('/api/attachments/:id', (req, res) => {
  const { attachment, filePath } = db.getAttachmentById(req.params.id);
  if (!attachment || !filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Fayl topilmadi!' });
  }

  res.setHeader('Content-Type', attachment.mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(attachment.originalName)}"`);
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

// Download attachment
app.get('/api/attachments/:id/download', (req, res) => {
  const { attachment, filePath } = db.getAttachmentById(req.params.id);
  if (!attachment || !filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Fayl topilmadi!' });
  }

  res.download(filePath, attachment.originalName);
});

// Delete attachment
app.delete('/api/issues/:id/attachments/:attachmentId', (req, res) => {
  const success = db.deleteAttachment(req.params.id, req.params.attachmentId);
  if (!success) return res.status(404).json({ error: 'Fayl topilmadi!' });
  res.json({ success: true, message: 'Fayl o‘chirildi.' });
});

// ==========================================
// ISSUES & WORKFLOW ENFORCEMENT
// ==========================================

app.get('/api/issues', (req, res) => {
  let issues = db.getIssues();
  const { status, stage, priority, customerId, regionId, productId, assignedDevId, specialistId, operatorId, search } = req.query;

  if (status) issues = issues.filter(i => i.status === status);
  if (stage) issues = issues.filter(i => i.stage === stage);
  if (priority) issues = issues.filter(i => i.priority === priority);
  if (customerId) issues = issues.filter(i => i.customerId === customerId);
  if (regionId && regionId !== 'ALL') issues = issues.filter(i => i.regionId === regionId);
  if (productId && productId !== 'ALL') issues = issues.filter(i => i.productId === productId);
  if (specialistId || assignedDevId) {
    const sId = specialistId || assignedDevId;
    issues = issues.filter(i => i.current_specialist_id === sId);
  }
  if (operatorId) {
    issues = issues.filter(i => i.created_by_operator_id === operatorId);
  }

  if (search) {
    const q = String(search).toLowerCase();
    issues = issues.filter(i => 
      i.code.toLowerCase().includes(q) ||
      i.title.toLowerCase().includes(q) ||
      i.customerName.toLowerCase().includes(q) ||
      (i.customerInn && i.customerInn.includes(q)) ||
      (i.regionName && i.regionName.toLowerCase().includes(q)) ||
      i.created_by_operator_name.toLowerCase().includes(q) ||
      (i.current_specialist_name && i.current_specialist_name.toLowerCase().includes(q))
    );
  }

  res.json(issues);
});

app.get('/api/issues/:id', (req, res) => {
  const issue = db.getIssueById(req.params.id);
  if (!issue) return res.status(404).json({ error: 'Murojaat topilmadi!' });
  res.json(issue);
});

// Create new issue with snapshots and customer notifications
app.post('/api/issues', async (req, res) => {
  const {
    title,
    description,
    customerId,
    customerInn,
    regionId,
    contactPhoneSnapshot,
    contactPersonSnapshot,
    productId,
    moduleId,
    priority,
    created_by_operator_id,
    assigned_specialist_id,
    dueDate,
    attachments
  } = req.body;

  if (!title || !description || !customerId || !productId) {
    return res.status(400).json({ error: 'Sarlavha, tavsif, mijoz va mahsulot kiritilishi shart!' });
  }

  const newIssue = db.createIssue({
    title,
    description,
    customerId,
    customerInn,
    regionId,
    contactPhoneSnapshot,
    contactPersonSnapshot,
    productId,
    moduleId: moduleId || '',
    priority: priority || 'MEDIUM',
    created_by_operator_id: created_by_operator_id || 'usr_op1',
    assigned_specialist_id,
    dueDate
  });

  // Attach files if provided during creation
  if (Array.isArray(attachments) && attachments.length > 0) {
    attachments.forEach((att: any) => {
      if (att.originalName && att.base64) {
        const cleanBase64 = att.base64.includes(',') ? att.base64.split(',')[1] : att.base64;
        const buf = Buffer.from(cleanBase64, 'base64');
        db.saveAttachment(newIssue.id, {
          originalName: att.originalName,
          mimeType: att.mimeType || 'application/octet-stream',
          buffer: buf,
          uploadedBy: newIssue.created_by_operator_name
        });
      }
    });
  }

  // 1. Notify Customer via Telegram if linked!
  const customer = db.getCustomerById(customerId);
  if (customer && customer.telegramChatId) {
    await telegramService.notifyCustomerIssueCreated(newIssue, customer);
  }

  // 2. Notify Specialist if assigned immediately
  if (newIssue.current_specialist_id) {
    const specialist = db.getUserById(newIssue.current_specialist_id);
    if (specialist) {
      await telegramService.notifySpecialistAssigned(newIssue, specialist);
    }
  }

  res.status(201).json(db.getIssueById(newIssue.id));
});

// Assign Specialist
app.post('/api/issues/:id/assign', async (req, res) => {
  const { specialistId, assignedById } = req.body;
  if (!specialistId) return res.status(400).json({ error: 'Mutaxassis tanlanishi shart!' });

  const updated = db.assignSpecialist(req.params.id, specialistId, assignedById || 'usr_admin');
  if (!updated) return res.status(404).json({ error: 'Murojaat yoki mutaxassis topilmadi!' });

  const specialist = db.getUserById(specialistId);
  if (specialist) {
    await telegramService.notifySpecialistAssigned(updated, specialist);
  }

  res.json(updated);
});

// Specialist accepts task
app.post('/api/issues/:id/accept', (req, res) => {
  const { specialistId } = req.body;
  const updated = db.acceptIssue(req.params.id, specialistId);
  if (!updated) return res.status(404).json({ error: 'Murojaat topilmadi!' });
  res.json(updated);
});

// Specialist pauses task (Waiting)
app.post('/api/issues/:id/wait', (req, res) => {
  const { specialistId, reason } = req.body;
  if (!reason) return res.status(400).json({ error: 'Kutish sababi kiritilishi shart!' });
  const updated = db.waitIssue(req.params.id, specialistId, reason);
  if (!updated) return res.status(404).json({ error: 'Murojaat topilmadi!' });
  res.json(updated);
});

// Specialist resumes task
app.post('/api/issues/:id/resume', (req, res) => {
  const { specialistId } = req.body;
  const updated = db.resumeIssue(req.params.id, specialistId);
  if (!updated) return res.status(404).json({ error: 'Murojaat topilmadi!' });
  res.json(updated);
});

// Specialist submits solution -> ROUTES TO OPERATOR & NOTIFIES CUSTOMER
app.post('/api/issues/:id/solution', async (req, res) => {
  const { specialistId, solutionNote, commitUrl, appVersion } = req.body;
  if (!solutionNote) {
    return res.status(400).json({ error: 'Yechim tavsifi kiritilishi shart!' });
  }

  const updated = db.submitSolution(req.params.id, specialistId, solutionNote, commitUrl, appVersion);
  if (!updated) return res.status(404).json({ error: 'Murojaat topilmadi!' });

  const operator = db.getUserById(updated.created_by_operator_id);
  const specialist = db.getUserById(specialistId || updated.current_specialist_id || '');
  if (operator && specialist) {
    await telegramService.notifyOperatorSolutionReady(updated, operator, specialist);
  }

  // Also notify Customer if linked!
  const customer = db.getCustomerById(updated.customerId);
  if (customer && customer.telegramChatId) {
    await telegramService.notifyCustomerSolutionReady(updated, customer);
  }

  res.json(updated);
});

// Operator contacts customer
app.post('/api/issues/:id/customer-contact', (req, res) => {
  const { operatorId, dispatchMethod, dispatchNote } = req.body;
  const updated = db.contactCustomer(req.params.id, operatorId, dispatchMethod || 'PHONE', dispatchNote || 'Mijozga yetkazildi');
  if (!updated) return res.status(404).json({ error: 'Murojaat topilmadi!' });
  res.json(updated);
});

// Operator confirms with client and closes issue
app.post('/api/issues/:id/confirm-close', async (req, res) => {
  const { operatorId, customerFeedback, customerRating } = req.body;
  const updated = db.confirmClose(req.params.id, operatorId, customerFeedback || 'Muammo hal qilindi', Number(customerRating) || 5);
  if (!updated) return res.status(404).json({ error: 'Murojaat topilmadi!' });

  // Internal admin alert
  await telegramService.notifyIssueClosed(updated);

  // Notify customer
  const customer = db.getCustomerById(updated.customerId);
  if (customer && customer.telegramChatId) {
    await telegramService.notifyCustomerIssueClosed(updated, customer);
  }

  res.json(updated);
});

// Operator notes dissatisfaction and reopens issue -> ROUTES BACK TO SPECIALIST
app.post('/api/issues/:id/reopen', async (req, res) => {
  const { operatorId, returnReason } = req.body;
  if (!returnReason) {
    return res.status(400).json({ error: 'Qaytarish sababi kiritilishi shart!' });
  }

  const updated = db.reopenIssue(req.params.id, operatorId, returnReason);
  if (!updated) return res.status(404).json({ error: 'Murojaat topilmadi!' });

  if (updated.current_specialist_id) {
    const specialist = db.getUserById(updated.current_specialist_id);
    if (specialist) {
      await telegramService.notifySpecialistReopened(updated, specialist, returnReason);
    }
  }

  res.json(updated);
});

// Add comment
app.post('/api/issues/:id/comments', (req, res) => {
  const { authorId, authorName, authorRole, content } = req.body;
  if (!content) return res.status(400).json({ error: 'Izoh matni kiritilishi shart!' });
  const comment = db.addComment(req.params.id, {
    authorId,
    authorName,
    authorRole,
    content
  });
  if (!comment) return res.status(404).json({ error: 'Murojaat topilmadi!' });
  res.status(201).json(comment);
});

// ==========================================
// DASHBOARD & ANALYTICS REPORTS
// ==========================================

app.get('/api/dashboard/stats', (req, res) => {
  res.json(db.getDashboardStats());
});

app.get('/api/reports/regions', (req, res) => {
  res.json(db.getRegionReports());
});

app.get('/api/reports/software-products', (req, res) => {
  res.json(db.getProductReports());
});

app.get('/api/reports/region-products', (req, res) => {
  res.json(db.getRegionProductMatrix());
});

app.get('/api/reports/customer-telegram', (req, res) => {
  res.json(db.getCustomerTelegramAnalytics());
});

app.get('/api/reports/summary', (req, res) => {
  const period = (req.query.period as any) || 'daily';
  res.json(db.getReportSummary(period));
});

app.post('/api/reports/send-telegram', async (req, res) => {
  const success = await telegramService.sendDailyReportToAdmins();
  res.json({ success, message: 'Kundalik hisobot Telegram orqali yuborildi.' });
});

app.get('/api/kpi/specialists', (req, res) => {
  res.json(db.getSpecialistKPIs());
});

app.get('/api/kpi/operators', (req, res) => {
  res.json(db.getOperatorKPIs());
});

// ==========================================
// REMINDERS & TELEGRAM RECIPIENTS
// ==========================================

app.get('/api/reminders', (req, res) => {
  res.json(db.getReminderLogs());
});

app.post('/api/reminders/check-now', async (req, res) => {
  const count = await telegramService.checkAndTriggerEscalations();
  res.json({ message: `${count} ta eslatma tekshirildi va yuborildi.`, count });
});

app.get('/api/telegram/recipients', (req, res) => {
  res.json(db.getTelegramRecipients());
});

app.post('/api/telegram/recipients', (req, res) => {
  const { name, role, chatId, username } = req.body;
  if (!name || !chatId) {
    return res.status(400).json({ error: 'Ism va Telegram Chat ID kiritilishi shart!' });
  }
  const created = db.addTelegramRecipient({
    name,
    role: role || 'Administrator',
    chatId: String(chatId).trim(),
    username: username ? username.replace('@', '').trim() : undefined,
    isActive: true
  });
  res.status(201).json(created);
});

app.delete('/api/telegram/recipients/:id', (req, res) => {
  const success = db.removeTelegramRecipient(req.params.id);
  res.json({ success });
});

app.patch('/api/telegram/recipients/:id/toggle', (req, res) => {
  const success = db.toggleTelegramRecipient(req.params.id);
  res.json({ success });
});

app.post('/api/telegram/test-recipient', async (req, res) => {
  const { chatId, name } = req.body;
  if (!chatId) return res.status(400).json({ error: 'Chat ID kiritilmadi!' });
  const text = `⚡️ <b>TASK CONTROL TEST BOG'LANISH</b>\n\n` +
    `Hurmatli <b>${name || 'Foydalanuvchi'}</b>,\n` +
    `Sizning Telegram hisobingiz (Chat ID: <code>${chatId}</code>) TASK CONTROL tizimi bilan muvaffaqiyatli bog'landi va test xabari yetib keldi.\n\n` +
    `⏱ Vaqt: ${new Date().toLocaleString('uz-UZ')}`;
  const ok = await telegramService.sendTelegramMessage(chatId, text);
  res.json({ success: ok });
});

// Periodic automated check (every 5 minutes)
setInterval(() => {
  telegramService.checkAndTriggerEscalations().catch(err => console.error('[ESCALATION CRON ERROR]', err));
}, 5 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`🚀 TASK CONTROL Enterprise Backend running on http://localhost:${PORT}`);
});
