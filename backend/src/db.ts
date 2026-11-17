import fs from 'fs';
import path from 'path';
import { Customer, Issue, IssueStatus, IssueWorkCycle, OperatorKPI, Priority, Product, ReminderLog, SpecialistKPI, StageId, SystemReportSummary, TelegramRecipient, User, UserRole } from './types';

interface DatabaseData {
  users: User[];
  customers: Customer[];
  products: Product[];
  issues: Issue[];
  reminderLogs: ReminderLog[];
  telegramRecipients: TelegramRecipient[];
}

const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

const INITIAL_USERS: User[] = [];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_poscode',
    name: 'POSCODE',
    code: 'POS',
    description: 'Savdo va chakana biznesni avtomatlashtirish tizimi',
    modules: [
      { id: 'mod_pos_kassa', name: 'Kassa va Savdo' },
      { id: 'mod_pos_ombor', name: 'Ombor va Qoldiqlar' },
      { id: 'mod_pos_hisobot', name: 'Moliya va Hisobot' },
      { id: 'mod_pos_fiskal', name: 'Fiskalizatsiya (OFD/Solik)' },
      { id: 'mod_pos_pay', name: 'To\'lov tizimlari (Payme/Click/Uzum/Terminal)' },
      { id: 'mod_pos_mark', name: 'Markirovka (Asl Belgisi)' }
    ]
  },
  {
    id: 'prod_restoplus',
    name: 'RESTOPLUS',
    code: 'RST',
    description: 'Restoran, kafe va ovqatlanish shahobchalari tizimi',
    modules: [
      { id: 'mod_rst_kds', name: 'Oshxona ekrani (KDS)' },
      { id: 'mod_rst_waiter', name: 'Ofitsiant mobil ilovasi' },
      { id: 'mod_rst_kassa', name: 'Kassa va Chek chop etish' },
      { id: 'mod_rst_qr', name: 'QR-menyu va Buyurtmalar' }
    ]
  },
  {
    id: 'prod_mizaan',
    name: 'MIZAAN',
    code: 'MIZ',
    description: 'Ishlab chiqarish va xomashyo hisobi tizimi',
    modules: [
      { id: 'mod_miz_prod', name: 'Ishlab chiqarish rejalashtirish' },
      { id: 'mod_miz_cost', name: 'Tannarx kalkulyatsiyasi' },
      { id: 'mod_miz_raw', name: 'Xomashyo ombori' },
      { id: 'mod_miz_qc', name: 'Sifat nazorati (QC)' }
    ]
  }
];

const INITIAL_CUSTOMERS: Customer[] = [];
const INITIAL_ISSUES: Issue[] = [];

const INITIAL_RECIPIENTS: TelegramRecipient[] = [
  {
    id: 'recip_admin_main',
    name: 'Shohrux (Bosh Admin)',
    role: 'Bosh Administrator',
    chatId: '53663779',
    username: 'shohrux_admin',
    isActive: true,
    createdAt: '2026-11-17T09:00:00Z'
  }
];

class Database {
  private data: DatabaseData;

  constructor() {
    this.ensureDirectoryExistence();
    this.data = this.loadData();
  }

  private ensureDirectoryExistence() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseData {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        
        const users = Array.isArray(parsed.users) ? parsed.users : [];
        const issues = Array.isArray(parsed.issues) ? parsed.issues : [];
        const products = Array.isArray(parsed.products) && parsed.products.length > 0 ? parsed.products : INITIAL_PRODUCTS;
        const customers = Array.isArray(parsed.customers) ? parsed.customers : [];
        const reminderLogs = Array.isArray(parsed.reminderLogs) ? parsed.reminderLogs : [];
        const telegramRecipients = Array.isArray(parsed.telegramRecipients) && parsed.telegramRecipients.length > 0 ? parsed.telegramRecipients : INITIAL_RECIPIENTS;

        // Upgrade users with login/isActive/linkCode if missing
        users.forEach((u: any) => {
          if (!u.login) u.login = u.email ? u.email.split('@')[0] : u.id;
          if (u.isActive === undefined) u.isActive = true;
          if (!u.telegramLinkCode) u.telegramLinkCode = `TC-${u.id.toUpperCase()}`;
          if (u.role === 'DEVELOPER') u.role = 'MUTAXASSIS';
        });

        // Upgrade issues with operator lock and cycles if missing
        issues.forEach((iss: any) => {
          if (!iss.created_by_operator_id) {
            iss.created_by_operator_id = iss.createdById || 'usr_op1';
            iss.created_by_operator_name = iss.createdByName || 'Malika Karimova';
          }
          if (!iss.current_specialist_id && iss.assignedDevId) {
            iss.current_specialist_id = iss.assignedDevId;
            iss.current_specialist_name = iss.assignedDevName;
          }
          if (!iss.cycles) {
            iss.cycles = [];
          }
          if (iss.currentCycleNumber === undefined) {
            iss.currentCycleNumber = iss.cycles.length > 0 ? iss.cycles.length : 1;
          }
          if (iss.reopenCount === undefined) {
            iss.reopenCount = 0;
          }
        });

        return {
          users,
          customers,
          products,
          issues,
          reminderLogs,
          telegramRecipients
        };
      }
    } catch (err) {
      console.error('Error loading database file, initializing defaults:', err);
    }

    return {
      users: INITIAL_USERS,
      customers: INITIAL_CUSTOMERS,
      products: INITIAL_PRODUCTS,
      issues: INITIAL_ISSUES,
      reminderLogs: [],
      telegramRecipients: INITIAL_RECIPIENTS
    };
  }

  private saveData() {
    try {
      this.ensureDirectoryExistence();
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database file:', err);
    }
  }

  // --- Users / Employees ---
  getUsers(filters?: { role?: string; isActive?: boolean; search?: string }): User[] {
    let result = this.data.users;
    if (filters) {
      if (filters.role && filters.role !== 'ALL') {
        const targetRole = filters.role === 'DEVELOPER' ? 'MUTAXASSIS' : filters.role;
        result = result.filter(u => u.role === targetRole || (targetRole === 'MUTAXASSIS' && (u.role as string) === 'DEVELOPER'));
      }
      if (filters.isActive !== undefined) {
        result = result.filter(u => u.isActive === filters.isActive);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(u => 
          u.name.toLowerCase().includes(q) || 
          u.phone.includes(q) || 
          u.login.toLowerCase().includes(q) ||
          (u.telegramUsername && u.telegramUsername.toLowerCase().includes(q))
        );
      }
    }
    return result;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByPhone(phone: string): User | undefined {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return this.data.users.find(u => u.phone.replace(/[\s\-\(\)]/g, '') === cleanPhone);
  }

  getUserByLogin(login: string): User | undefined {
    return this.data.users.find(u => u.login.toLowerCase() === login.toLowerCase());
  }

  getUserByLinkCode(code: string): User | undefined {
    return this.data.users.find(u => u.telegramLinkCode === code);
  }

  getUserByTelegramChatId(chatId: string): User | undefined {
    return this.data.users.find(u => u.telegramChatId === chatId);
  }

  addUser(userData: {
    name: string;
    phone: string;
    role: UserRole;
    login: string;
    email?: string;
    password?: string;
    telegramUsername?: string;
    telegramChatId?: string;
  }): { success: boolean; user?: User; error?: string } {
    if (this.getUserByPhone(userData.phone)) {
      return { success: false, error: 'Bu telefon raqami bilan xodim mavjud!' };
    }
    if (this.getUserByLogin(userData.login)) {
      return { success: false, error: 'Bu login allaqachon band qilingan!' };
    }

    const id = `usr_${Date.now()}`;
    const codeSuffix = Math.floor(1000 + Math.random() * 9000);
    const linkCode = `TC-${userData.role.substring(0, 3)}-${codeSuffix}`;

    const newUser: User = {
      id,
      name: userData.name,
      phone: userData.phone,
      role: userData.role === 'DEVELOPER' ? 'MUTAXASSIS' : userData.role,
      login: userData.login,
      email: userData.email || `${userData.login}@taskcontrol.uz`,
      password: userData.password || '123456',
      telegramUsername: userData.telegramUsername ? userData.telegramUsername.replace('@', '') : undefined,
      telegramChatId: userData.telegramChatId || undefined,
      telegramLinkCode: linkCode,
      telegramLinkedAt: userData.telegramChatId ? new Date().toISOString() : undefined,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    this.data.users.push(newUser);
    this.saveData();
    return { success: true, user: newUser };
  }

  updateUser(id: string, updates: Partial<User>): { success: boolean; user?: User; error?: string } {
    const user = this.getUserById(id);
    if (!user) return { success: false, error: 'Xodim topilmadi!' };

    if (updates.phone && updates.phone !== user.phone) {
      const existing = this.getUserByPhone(updates.phone);
      if (existing && existing.id !== id) {
        return { success: false, error: 'Ushbu telefon raqami boshqa xodimda mavjud!' };
      }
    }

    if (updates.login && updates.login !== user.login) {
      const existing = this.getUserByLogin(updates.login);
      if (existing && existing.id !== id) {
        return { success: false, error: 'Ushbu login boshqa xodim tomonidan band qilingan!' };
      }
    }

    Object.assign(user, updates);
    this.saveData();
    return { success: true, user };
  }

  toggleUserStatus(id: string): { success: boolean; user?: User } {
    const user = this.getUserById(id);
    if (!user) return { success: false };
    user.isActive = !user.isActive;
    this.saveData();
    return { success: true, user };
  }

  deleteUser(id: string): { success: boolean; error?: string } {
    const user = this.getUserById(id);
    if (!user) return { success: false, error: 'Xodim topilmadi!' };
    this.data.users = this.data.users.filter(u => u.id !== id);
    this.saveData();
    return { success: true };
  }

  linkUserTelegram(id: string, chatId: string, username?: string): boolean {
    const user = this.getUserById(id);
    if (!user) return false;
    user.telegramChatId = chatId;
    if (username) user.telegramUsername = username.replace('@', '');
    user.telegramLinkedAt = new Date().toISOString();
    this.saveData();
    return true;
  }

  // --- Customers & Products ---
  getCustomers(): Customer[] {
    return this.data.customers || [];
  }

  addCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Customer {
    const newCustomer: Customer = {
      ...customer,
      id: `cust_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    if (!this.data.customers) this.data.customers = [];
    this.data.customers.push(newCustomer);
    this.saveData();
    return newCustomer;
  }

  getProducts(): Product[] {
    return this.data.products;
  }

  // --- Telegram Recipients ---
  getTelegramRecipients(): TelegramRecipient[] {
    return this.data.telegramRecipients || [];
  }

  addTelegramRecipient(recipient: Omit<TelegramRecipient, 'id' | 'createdAt'>): TelegramRecipient {
    const newRecip: TelegramRecipient = {
      ...recipient,
      id: `rec_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    if (!this.data.telegramRecipients) this.data.telegramRecipients = [];
    this.data.telegramRecipients.push(newRecip);
    this.saveData();
    return newRecip;
  }

  removeTelegramRecipient(id: string): boolean {
    if (!this.data.telegramRecipients) return false;
    const initialLen = this.data.telegramRecipients.length;
    this.data.telegramRecipients = this.data.telegramRecipients.filter(r => r.id !== id);
    if (this.data.telegramRecipients.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  toggleTelegramRecipient(id: string): boolean {
    if (!this.data.telegramRecipients) return false;
    const r = this.data.telegramRecipients.find(x => x.id === id);
    if (r) {
      r.isActive = !r.isActive;
      this.saveData();
      return true;
    }
    return false;
  }

  // --- Issues Management ---
  getIssues(): Issue[] {
    return this.data.issues || [];
  }

  getIssueById(id: string): Issue | undefined {
    return (this.data.issues || []).find(i => i.id === id);
  }

  createIssue(issueData: {
    title: string;
    description: string;
    customerId: string;
    productId: string;
    moduleId: string;
    priority: Priority;
    created_by_operator_id: string; // Locked to operator
    assigned_specialist_id?: string;
    dueDate?: string;
  }): Issue {
    const now = new Date().toISOString();
    const customer = (this.data.customers || []).find(c => c.id === issueData.customerId);
    const product = this.data.products.find(p => p.id === issueData.productId);
    const module = product?.modules.find(m => m.id === issueData.moduleId);
    const operator = this.getUserById(issueData.created_by_operator_id) || this.data.users.find(u => u.role === 'OPERATOR');
    const specialist = issueData.assigned_specialist_id ? this.getUserById(issueData.assigned_specialist_id) : undefined;

    const count = (this.data.issues?.length || 0) + 1;
    const code = `TC-2026-${String(count).padStart(6, '0')}`;

    const cycles: IssueWorkCycle[] = [];
    if (specialist) {
      cycles.push({
        id: `cyc_${Date.now()}_1`,
        cycleNumber: 1,
        specialistId: specialist.id,
        specialistName: specialist.name,
        assignedAt: now,
        waitingSeconds: 0,
        activeSeconds: 0,
        totalSeconds: 0
      });
    }

    const newIssue: Issue = {
      id: `iss_${Date.now()}`,
      code,
      title: issueData.title,
      description: issueData.description,
      customerId: issueData.customerId,
      customerName: customer ? customer.companyName : 'Noma\'lum mijoz',
      customerPhone: customer?.phone,
      productId: issueData.productId,
      productName: product ? product.name : 'Noma\'lum dastur',
      moduleId: issueData.moduleId,
      moduleName: module ? module.name : 'Asosiy modul',
      priority: issueData.priority || 'MEDIUM',
      status: specialist ? 'ASSIGNED' : 'NEW',
      stage: 'STAGE_1_ACCEPTED',
      created_by_operator_id: operator ? operator.id : 'usr_op1',
      created_by_operator_name: operator ? operator.name : 'Malika Karimova',
      current_specialist_id: specialist?.id,
      current_specialist_name: specialist?.name,
      currentCycleNumber: cycles.length > 0 ? 1 : 0,
      reopenCount: 0,
      reportedAt: now,
      stage1CompletedAt: specialist ? now : undefined,
      dueDate: issueData.dueDate,
      reminderCount: 0,
      cycles,
      attachments: [],
      comments: [
        {
          id: `com_${Date.now()}`,
          issueId: `iss_${Date.now()}`,
          authorId: operator?.id || 'usr_op1',
          authorName: operator?.name || 'Operator',
          authorRole: 'OPERATOR',
          content: `Murojaat operator tomonidan qabul qilindi va tizimga kiritildi.${specialist ? ` Mas'ul mutaxassis: ${specialist.name}` : ''}`,
          createdAt: now
        }
      ],
      updatedAt: now
    };

    if (!this.data.issues) this.data.issues = [];
    this.data.issues.unshift(newIssue);
    this.saveData();
    return newIssue;
  }

  assignSpecialist(issueId: string, specialistId: string, assignedById: string): Issue | null {
    const issue = this.getIssueById(issueId);
    const specialist = this.getUserById(specialistId);
    const assigner = this.getUserById(assignedById);
    if (!issue || !specialist) return null;

    const now = new Date().toISOString();
    issue.current_specialist_id = specialist.id;
    issue.current_specialist_name = specialist.name;
    issue.status = 'ASSIGNED';
    issue.stage = 'STAGE_1_ACCEPTED';
    issue.stage1CompletedAt = now;
    issue.updatedAt = now;

    let activeCycle = issue.cycles.find(c => c.cycleNumber === issue.currentCycleNumber && !c.solutionReadyAt);
    if (!activeCycle) {
      issue.currentCycleNumber = (issue.currentCycleNumber || 0) + 1;
      activeCycle = {
        id: `cyc_${Date.now()}_${issue.currentCycleNumber}`,
        cycleNumber: issue.currentCycleNumber,
        specialistId: specialist.id,
        specialistName: specialist.name,
        assignedAt: now,
        waitingSeconds: 0,
        activeSeconds: 0,
        totalSeconds: 0
      };
      issue.cycles.push(activeCycle);
    } else {
      activeCycle.specialistId = specialist.id;
      activeCycle.specialistName = specialist.name;
    }

    issue.comments.push({
      id: `com_${Date.now()}`,
      issueId: issue.id,
      authorId: assigner?.id || 'usr_admin',
      authorName: assigner?.name || 'Administrator',
      authorRole: assigner?.role || 'SUPER_ADMIN',
      content: `Murojaat mutaxassis ${specialist.name} ga biriktirildi.`,
      createdAt: now
    });

    this.saveData();
    return issue;
  }

  acceptIssue(issueId: string, specialistId: string): Issue | null {
    const issue = this.getIssueById(issueId);
    if (!issue) return null;
    const now = new Date().toISOString();
    issue.status = 'IN_PROGRESS';
    issue.updatedAt = now;

    const currentCycle = issue.cycles.find(c => c.cycleNumber === issue.currentCycleNumber);
    if (currentCycle) {
      if (!currentCycle.acceptedAt) currentCycle.acceptedAt = now;
      if (!currentCycle.startedAt) currentCycle.startedAt = now;
    }

    issue.comments.push({
      id: `com_${Date.now()}`,
      issueId: issue.id,
      authorId: specialistId,
      authorName: issue.current_specialist_name || 'Mutaxassis',
      authorRole: 'MUTAXASSIS',
      content: 'Vazifa mutaxassis tomonidan qabul qilindi va ish boshlandi.',
      createdAt: now
    });

    this.saveData();
    return issue;
  }

  waitIssue(issueId: string, specialistId: string, reason: string): Issue | null {
    const issue = this.getIssueById(issueId);
    if (!issue) return null;
    const now = new Date().toISOString();
    issue.status = 'WAITING';
    issue.updatedAt = now;

    const currentCycle = issue.cycles.find(c => c.cycleNumber === issue.currentCycleNumber);
    if (currentCycle) {
      currentCycle.pausedAt = now;
      currentCycle.waitingReason = reason;
    }

    issue.comments.push({
      id: `com_${Date.now()}`,
      issueId: issue.id,
      authorId: specialistId,
      authorName: issue.current_specialist_name || 'Mutaxassis',
      authorRole: 'MUTAXASSIS',
      content: `Vazifa kutilmoqda holatiga o'tkazildi. Sabab: ${reason}`,
      createdAt: now
    });

    this.saveData();
    return issue;
  }

  resumeIssue(issueId: string, specialistId: string): Issue | null {
    const issue = this.getIssueById(issueId);
    if (!issue) return null;
    const now = new Date().toISOString();
    issue.status = 'IN_PROGRESS';
    issue.updatedAt = now;

    const currentCycle = issue.cycles.find(c => c.cycleNumber === issue.currentCycleNumber);
    if (currentCycle && currentCycle.pausedAt) {
      const waitDiffSec = Math.floor((new Date(now).getTime() - new Date(currentCycle.pausedAt).getTime()) / 1000);
      currentCycle.waitingSeconds += Math.max(0, waitDiffSec);
      currentCycle.pausedAt = undefined;
    }

    issue.comments.push({
      id: `com_${Date.now()}`,
      issueId: issue.id,
      authorId: specialistId,
      authorName: issue.current_specialist_name || 'Mutaxassis',
      authorRole: 'MUTAXASSIS',
      content: 'Vazifa qayta faollashtirildi, ish davom ettirilmoqda.',
      createdAt: now
    });

    this.saveData();
    return issue;
  }

  submitSolution(
    issueId: string,
    specialistId: string,
    solutionNote: string,
    commitUrl?: string,
    appVersion?: string
  ): Issue | null {
    const issue = this.getIssueById(issueId);
    if (!issue) return null;
    const now = new Date().toISOString();

    issue.stage = 'STAGE_2_RESOLVED';
    issue.status = 'SOLUTION_READY';
    issue.resolvedAt = now;
    issue.solutionNote = solutionNote;
    if (commitUrl) issue.commitUrl = commitUrl;
    if (appVersion) issue.appVersion = appVersion;
    issue.updatedAt = now;

    const currentCycle = issue.cycles.find(c => c.cycleNumber === issue.currentCycleNumber);
    if (currentCycle) {
      currentCycle.solutionReadyAt = now;
      currentCycle.solutionNote = solutionNote;
      currentCycle.returnedToOperatorAt = now;

      const start = currentCycle.startedAt ? new Date(currentCycle.startedAt).getTime() : new Date(currentCycle.assignedAt).getTime();
      const end = new Date(now).getTime();
      const totalSec = Math.max(0, Math.floor((end - start) / 1000));
      currentCycle.totalSeconds = totalSec;
      currentCycle.activeSeconds = Math.max(0, totalSec - (currentCycle.waitingSeconds || 0));
    }

    issue.comments.push({
      id: `com_${Date.now()}`,
      issueId: issue.id,
      authorId: specialistId,
      authorName: issue.current_specialist_name || 'Mutaxassis',
      authorRole: 'MUTAXASSIS',
      content: `Mas'ul mutaxassis yechimni taqdim etdi va qabul qilgan operator (${issue.created_by_operator_name}) ga yo'naltirdi. Izoh: ${solutionNote}`,
      stageChange: {
        from: 'STAGE_1_ACCEPTED',
        to: 'STAGE_2_RESOLVED'
      },
      createdAt: now
    });

    this.saveData();
    return issue;
  }

  contactCustomer(
    issueId: string,
    operatorId: string,
    dispatchMethod: 'TELEGRAM' | 'PHONE' | 'MEETING' | 'REMOTE',
    dispatchNote: string
  ): Issue | null {
    const issue = this.getIssueById(issueId);
    const operator = this.getUserById(operatorId);
    if (!issue) return null;
    const now = new Date().toISOString();

    issue.stage = 'STAGE_3_DISPATCHED';
    issue.status = 'CUSTOMER_CONTACT';
    issue.dispatchedAt = now;
    issue.dispatchedById = operator?.id || issue.created_by_operator_id;
    issue.dispatchedByName = operator?.name || issue.created_by_operator_name;
    issue.dispatchMethod = dispatchMethod;
    issue.dispatchNote = dispatchNote;
    issue.updatedAt = now;

    issue.comments.push({
      id: `com_${Date.now()}`,
      issueId: issue.id,
      authorId: operator?.id || 'usr_op1',
      authorName: operator?.name || 'Operator',
      authorRole: 'OPERATOR',
      content: `Yechim mijozga yetkazildi (${dispatchMethod}). Izoh: ${dispatchNote}. Mijoz tasdig'i kutilmoqda.`,
      stageChange: {
        from: 'STAGE_2_RESOLVED',
        to: 'STAGE_3_DISPATCHED'
      },
      createdAt: now
    });

    this.saveData();
    return issue;
  }

  confirmClose(
    issueId: string,
    operatorId: string,
    customerFeedback: string,
    customerRating: number = 5
  ): Issue | null {
    const issue = this.getIssueById(issueId);
    const operator = this.getUserById(operatorId);
    if (!issue) return null;
    const now = new Date().toISOString();

    issue.stage = 'STAGE_4_CONFIRMED';
    issue.status = 'CLOSED';
    issue.closedAt = now;
    issue.closedById = operator?.id || issue.created_by_operator_id;
    issue.closedByName = operator?.name || issue.created_by_operator_name;
    issue.customerFeedback = customerFeedback;
    issue.customerRating = customerRating;
    issue.updatedAt = now;

    issue.comments.push({
      id: `com_${Date.now()}`,
      issueId: issue.id,
      authorId: operator?.id || 'usr_op1',
      authorName: operator?.name || 'Operator',
      authorRole: 'OPERATOR',
      content: `Mijoz yechimni to'liq tasdiqladi. Baho: ${customerRating} / 5 yulduz. Murojaat muvaffaqiyatli yopildi.`,
      stageChange: {
        from: 'STAGE_3_DISPATCHED',
        to: 'STAGE_4_CONFIRMED'
      },
      createdAt: now
    });

    this.saveData();
    return issue;
  }

  reopenIssue(issueId: string, operatorId: string, returnReason: string): Issue | null {
    const issue = this.getIssueById(issueId);
    const operator = this.getUserById(operatorId);
    if (!issue) return null;
    const now = new Date().toISOString();

    issue.status = 'REOPENED';
    issue.stage = 'STAGE_1_ACCEPTED';
    issue.reopenCount = (issue.reopenCount || 0) + 1;
    issue.updatedAt = now;

    const newCycleNumber = (issue.currentCycleNumber || 1) + 1;
    issue.currentCycleNumber = newCycleNumber;

    const newCycle: IssueWorkCycle = {
      id: `cyc_${Date.now()}_${newCycleNumber}`,
      cycleNumber: newCycleNumber,
      specialistId: issue.current_specialist_id || '',
      specialistName: issue.current_specialist_name || 'Mutaxassis',
      assignedAt: now,
      returnReason: returnReason,
      waitingSeconds: 0,
      activeSeconds: 0,
      totalSeconds: 0
    };
    issue.cycles.push(newCycle);

    issue.comments.push({
      id: `com_${Date.now()}`,
      issueId: issue.id,
      authorId: operator?.id || 'usr_op1',
      authorName: operator?.name || 'Operator',
      authorRole: 'OPERATOR',
      content: `⚠️ Mijoz murojaat natijasidan qoniqmadi va qaytardi. Sabab: ${returnReason}. Yangi ish sikli #${newCycleNumber} boshlandi.`,
      stageChange: {
        from: issue.stage,
        to: 'STAGE_1_ACCEPTED'
      },
      createdAt: now
    });

    this.saveData();
    return issue;
  }

  updateIssue(id: string, updates: Partial<Issue>): Issue | null {
    const issue = this.getIssueById(id);
    if (!issue) return null;
    Object.assign(issue, updates);
    issue.updatedAt = new Date().toISOString();
    this.saveData();
    return issue;
  }

  addComment(issueId: string, commentData: Omit<Comment, 'id' | 'issueId' | 'createdAt'>): Comment | null {
    const issue = this.getIssueById(issueId);
    if (!issue) return null;
    const newComment: Comment = {
      id: `com_${Date.now()}`,
      issueId,
      ...commentData,
      createdAt: new Date().toISOString()
    };
    issue.comments.push(newComment);
    issue.updatedAt = new Date().toISOString();
    this.saveData();
    return newComment;
  }

  getReminderLogs(): ReminderLog[] {
    return this.data.reminderLogs || [];
  }

  addReminderLog(log: Omit<ReminderLog, 'id' | 'sentAt'>): ReminderLog {
    const newLog: ReminderLog = {
      ...log,
      id: `rem_${Date.now()}`,
      sentAt: new Date().toISOString()
    };
    if (!this.data.reminderLogs) this.data.reminderLogs = [];
    this.data.reminderLogs.unshift(newLog);
    if (this.data.reminderLogs.length > 200) {
      this.data.reminderLogs = this.data.reminderLogs.slice(0, 200);
    }
    this.saveData();
    return newLog;
  }

  // --- KPI Engines ---
  getSpecialistKPIs(): SpecialistKPI[] {
    const specialists = this.data.users.filter(u => u.role === 'MUTAXASSIS' || (u.role as string) === 'DEVELOPER');
    const issues = this.data.issues || [];

    return specialists.map(spec => {
      const specCycles: IssueWorkCycle[] = [];
      let assignedCount = 0;
      let completedCount = 0;
      let inProgressCount = 0;
      let reopenedCount = 0;
      let totalActiveSeconds = 0;
      let onTimeCycles = 0;

      issues.forEach(iss => {
        const hasSpec = iss.current_specialist_id === spec.id;
        const cycles = (iss.cycles || []).filter(c => c.specialistId === spec.id);
        
        if (hasSpec) assignedCount++;
        if (hasSpec && iss.status === 'IN_PROGRESS') inProgressCount++;
        if (hasSpec && iss.status === 'CLOSED') completedCount++;

        cycles.forEach(c => {
          specCycles.push(c);
          if (c.solutionReadyAt) {
            totalActiveSeconds += c.activeSeconds || 0;
            if ((c.activeSeconds || 0) <= 86400) {
              onTimeCycles++;
            }
          }
          if (c.cycleNumber > 1 && c.returnReason) {
            reopenedCount++;
          }
        });
      });

      const finishedCycles = specCycles.filter(c => c.solutionReadyAt).length;
      const averageResolutionSeconds = finishedCycles > 0 ? Math.round(totalActiveSeconds / finishedCycles) : 0;
      const onTimePercentage = finishedCycles > 0 ? Math.round((onTimeCycles / finishedCycles) * 100) : 100;
      const totalCycles = specCycles.length;
      const returnRatePercentage = totalCycles > 0 ? Math.round((reopenedCount / totalCycles) * 100) : 0;

      let kpiScore = 100;
      if (assignedCount > 0) {
        const speedScore = averageResolutionSeconds > 0 ? Math.max(0, 100 - (averageResolutionSeconds / 3600) * 8) : 100;
        const qualityScore = Math.max(0, 100 - returnRatePercentage * 2);
        kpiScore = Math.min(100, Math.round(speedScore * 0.4 + qualityScore * 0.3 + onTimePercentage * 0.3));
      }

      return {
        id: spec.id,
        name: spec.name,
        phone: spec.phone,
        role: spec.role,
        assignedCount,
        completedCount,
        inProgressCount,
        reopenedCount,
        averageResolutionSeconds,
        onTimePercentage,
        returnRatePercentage,
        kpiScore: Math.max(30, kpiScore)
      };
    });
  }

  getOperatorKPIs(): OperatorKPI[] {
    const operators = this.data.users.filter(u => u.role === 'OPERATOR');
    const issues = this.data.issues || [];

    return operators.map(op => {
      const opIssues = issues.filter(i => i.created_by_operator_id === op.id);
      const totalRegistered = opIssues.length;
      const solutionDeliveredCount = opIssues.filter(i => i.stage === 'STAGE_3_DISPATCHED' || i.stage === 'STAGE_4_CONFIRMED').length;
      const closedIssues = opIssues.filter(i => i.status === 'CLOSED');
      const closedCount = closedIssues.length;
      const reopenedCount = opIssues.reduce((sum, i) => sum + (i.reopenCount || 0), 0);

      let totalContactSec = 0;
      let contactCount = 0;
      let totalRating = 0;
      let ratingCount = 0;

      opIssues.forEach(i => {
        if (i.resolvedAt && i.dispatchedAt) {
          const diff = Math.max(0, Math.floor((new Date(i.dispatchedAt).getTime() - new Date(i.resolvedAt).getTime()) / 1000));
          totalContactSec += diff;
          contactCount++;
        }
        if (i.customerRating) {
          totalRating += i.customerRating;
          ratingCount++;
        }
      });

      const averageContactSeconds = contactCount > 0 ? Math.round(totalContactSec / contactCount) : 0;
      const averageRating = ratingCount > 0 ? Number((totalRating / ratingCount).toFixed(1)) : 5.0;

      let kpiScore = 100;
      if (totalRegistered > 0) {
        const speedScore = averageContactSeconds > 0 ? Math.max(0, 100 - (averageContactSeconds / 60) * 1.5) : 100;
        const ratingScore = (averageRating / 5.0) * 100;
        const closedRatio = (closedCount / totalRegistered) * 100;
        kpiScore = Math.min(100, Math.round(speedScore * 0.35 + ratingScore * 0.35 + closedRatio * 0.30));
      }

      return {
        id: op.id,
        name: op.name,
        phone: op.phone,
        role: op.role,
        totalRegistered,
        solutionDeliveredCount,
        closedCount,
        reopenedCount,
        averageContactSeconds,
        averageRating,
        kpiScore: Math.max(40, kpiScore)
      };
    });
  }

  // --- Reports Summary ---
  getReportSummary(period: 'daily' | 'weekly' | 'monthly'): SystemReportSummary {
    const issues = this.data.issues || [];
    const products = this.data.products;
    const specKPIs = this.getSpecialistKPIs();
    const opKPIs = this.getOperatorKPIs();

    const totalReceived = issues.length;
    const currentlyInProgress = issues.filter(i => i.status === 'IN_PROGRESS' || i.status === 'ASSIGNED').length;
    const waitingForCustomer = issues.filter(i => i.stage === 'STAGE_3_DISPATCHED').length;
    const totalClosed = issues.filter(i => i.status === 'CLOSED').length;
    const totalReopened = issues.reduce((sum, i) => sum + (i.reopenCount || 0), 0);

    const productStats = products.map(p => {
      const pIssues = issues.filter(i => i.productId === p.id);
      return {
        productId: p.id,
        productName: p.name,
        count: pIssues.length,
        closedCount: pIssues.filter(i => i.status === 'CLOSED').length
      };
    });

    const topSpecialists = specKPIs
      .sort((a, b) => b.kpiScore - a.kpiScore)
      .slice(0, 3)
      .map(s => ({
        name: s.name,
        completed: s.completedCount,
        avgHours: Number((s.averageResolutionSeconds / 3600).toFixed(1)),
        score: s.kpiScore
      }));

    const topOperators = opKPIs
      .sort((a, b) => b.kpiScore - a.kpiScore)
      .slice(0, 3)
      .map(o => ({
        name: o.name,
        registered: o.totalRegistered,
        closed: o.closedCount,
        score: o.kpiScore
      }));

    return {
      period,
      generatedAt: new Date().toISOString(),
      totalReceived,
      currentlyInProgress,
      waitingForCustomer,
      totalClosed,
      totalReopened,
      averageResolutionHours: totalClosed > 0 ? 1.5 : 0,
      productStats,
      topSpecialists,
      topOperators
    };
  }
}

export const db = new Database();
