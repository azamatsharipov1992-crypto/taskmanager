import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db';
import { telegramService } from './telegram';
import { DashboardStats, IssueStatus, Priority, StageId, UserRole } from './types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'TASK CONTROL Cloud Backend', time: new Date().toISOString() });
});

// ==========================================
// EMPLOYEES & USERS CRUD
// ==========================================

// List employees with filter and search
app.get('/api/employees', (req, res) => {
  const { role, isActive, search } = req.query;
  const filters: any = {};
  if (role) filters.role = String(role);
  if (isActive !== undefined) filters.isActive = isActive === 'true';
  if (search) filters.search = String(search);

  const employees = db.getUsers(filters);
  res.json(employees);
});

// Backward compatibility: /api/users
app.get('/api/users', (req, res) => {
  res.json(db.getUsers());
});

// Get single employee profile with workload & metrics
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

// Create new employee
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

// Update employee
app.put('/api/employees/:id', (req, res) => {
  const result = db.updateUser(req.params.id, req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json(result.user);
});

// Delete employee
app.delete('/api/employees/:id', (req, res) => {
  const result = db.deleteUser(req.params.id);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ success: true, message: 'Xodim tizimdan o\'chirildi.' });
});

// Toggle active/inactive
app.patch('/api/employees/:id/toggle', (req, res) => {
  const result = db.toggleUserStatus(req.params.id);
  if (!result.success) {
    return res.status(404).json({ error: 'Xodim topilmadi!' });
  }
  res.json(result.user);
});

// Manually link telegram
app.post('/api/employees/:id/link-telegram', (req, res) => {
  const { chatId, username } = req.body;
  if (!chatId) return res.status(400).json({ error: 'Telegram Chat ID kiritilishi shart!' });
  const success = db.linkUserTelegram(req.params.id, String(chatId), username);
  if (!success) return res.status(404).json({ error: 'Xodim topilmadi!' });
  res.json({ success: true, user: db.getUserById(req.params.id) });
});

// ==========================================
// CUSTOMERS & PRODUCTS
// ==========================================

app.get('/api/customers', (req, res) => {
  res.json(db.getCustomers());
});

app.post('/api/customers', (req, res) => {
  const { companyName, contactPerson, phone, telegramUsername, address, notes, productIds } = req.body;
  if (!companyName || !contactPerson || !phone) {
    return res.status(400).json({ error: 'Kompaniya nomi, mas\'ul shaxs va telefon kiritilishi shart!' });
  }
  const newCustomer = db.addCustomer({
    companyName,
    contactPerson,
    phone,
    telegramUsername: telegramUsername || '',
    address: address || '',
    notes: notes || '',
    productIds: productIds || []
  });
  res.status(201).json(newCustomer);
});

app.get('/api/products', (req, res) => {
  res.json(db.getProducts());
});

// ==========================================
// DASHBOARD & KPI ENGINES
// ==========================================

app.get('/api/dashboard/stats', (req, res) => {
  const issues = db.getIssues();
  const now = new Date().getTime();

  const stats: DashboardStats = {
    totalIssues: issues.length,
    newIssues: issues.filter(i => i.status === 'NEW').length,
    inProgress: issues.filter(i => i.status === 'IN_PROGRESS' || i.status === 'ASSIGNED').length,
    waitingForSpecialist: issues.filter(i => (i.stage === 'STAGE_1_ACCEPTED' || i.status === 'WAITING') && i.status !== 'CLOSED').length,
    solutionReady: issues.filter(i => i.status === 'SOLUTION_READY' && i.stage === 'STAGE_2_RESOLVED').length,
    waitingForCustomer: issues.filter(i => i.stage === 'STAGE_3_DISPATCHED').length,
    overdueTasks: issues.filter(i => i.dueDate && new Date(i.dueDate).getTime() < now && i.status !== 'CLOSED').length,
    closedIssues: issues.filter(i => i.status === 'CLOSED').length,
    reopenedIssues: issues.reduce((sum, i) => sum + (i.reopenCount || 0), 0),
    stagesCount: {
      stage1: issues.filter(i => i.stage === 'STAGE_1_ACCEPTED' && i.status !== 'CLOSED').length,
      stage2: issues.filter(i => i.stage === 'STAGE_2_RESOLVED').length,
      stage3: issues.filter(i => i.stage === 'STAGE_3_DISPATCHED').length,
      stage4: issues.filter(i => i.stage === 'STAGE_4_CONFIRMED' || i.status === 'CLOSED').length
    }
  };

  res.json(stats);
});

app.get('/api/kpi/specialists', (req, res) => {
  res.json(db.getSpecialistKPIs());
});

app.get('/api/kpi/operators', (req, res) => {
  res.json(db.getOperatorKPIs());
});

app.get('/api/reports/summary', (req, res) => {
  const period = (req.query.period as any) || 'daily';
  res.json(db.getReportSummary(period));
});

app.post('/api/reports/send-telegram', async (req, res) => {
  const period = (req.body.period as any) || 'daily';
  const success = await telegramService.sendReportSummary(period);
  res.json({ success, message: `${period} hisobot Telegram orqali yuborildi.` });
});

// ==========================================
// ISSUES & WORKFLOW ENFORCEMENT
// ==========================================

app.get('/api/issues', (req, res) => {
  let issues = db.getIssues();
  const { status, stage, priority, customerId, productId, assignedDevId, specialistId, operatorId, search } = req.query;

  if (status) issues = issues.filter(i => i.status === status);
  if (stage) issues = issues.filter(i => i.stage === stage);
  if (priority) issues = issues.filter(i => i.priority === priority);
  if (customerId) issues = issues.filter(i => i.customerId === customerId);
  if (productId) issues = issues.filter(i => i.productId === productId);
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

// Create new issue (Locking created_by_operator_id)
app.post('/api/issues', async (req, res) => {
  const { title, description, customerId, productId, moduleId, priority, created_by_operator_id, assigned_specialist_id, dueDate } = req.body;
  if (!title || !description || !customerId || !productId) {
    return res.status(400).json({ error: 'Sarlavha, tavsif, mijoz va mahsulot kiritilishi shart!' });
  }

  const newIssue = db.createIssue({
    title,
    description,
    customerId,
    productId,
    moduleId: moduleId || '',
    priority: priority || 'MEDIUM',
    created_by_operator_id: created_by_operator_id || 'usr_op1',
    assigned_specialist_id,
    dueDate
  });

  // If specialist was assigned immediately, dispatch Telegram alert
  if (newIssue.current_specialist_id) {
    const specialist = db.getUserById(newIssue.current_specialist_id);
    if (specialist) {
      await telegramService.notifySpecialistAssigned(newIssue, specialist);
    }
  }

  res.status(201).json(newIssue);
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

// Specialist submits solution -> ROUTES TO CREATOR OPERATOR
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

  await telegramService.notifyIssueClosed(updated);
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
// REMINDERS & TELEGRAM RECIPIENTS
// ==========================================

app.get('/api/reminders', (req, res) => {
  res.json(db.getReminderLogs());
});

app.post('/api/reminders/check-now', async (req, res) => {
  const count = await telegramService.checkAndTriggerReminders();
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
    `⏰ Vaqt: ${new Date().toLocaleString('uz-UZ')}`;
  const ok = await telegramService.sendTelegramMessage(chatId, text);
  res.json({ success: ok });
});

// Periodic automated check (every 5 minutes)
setInterval(() => {
  telegramService.checkAndTriggerReminders().catch(err => console.error('Reminder scheduler error:', err));
}, 5 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`🚀 TASK CONTROL Cloud Backend running on http://localhost:${PORT}`);
});
