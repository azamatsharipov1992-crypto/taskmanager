import fs from 'fs';
import path from 'path';
import {
  Attachment,
  Customer,
  CustomerContact,
  CustomerNotificationLog,
  CustomerProduct,
  DashboardStats,
  Issue,
  IssueStatus,
  IssueWorkCycle,
  OperatorKPI,
  Priority,
  Product,
  ProductReportItem,
  RegionProductMatrixRow,
  RegionReportItem,
  ReminderLog,
  SpecialistKPI,
  StageId,
  SystemReportSummary,
  TelegramRecipient,
  User,
  UserRole
} from './types';
import { UZBEKISTAN_REGIONS, RegionData, DistrictData } from './regionsData';

interface DatabaseData {
  users: User[];
  customers: Customer[];
  products: Product[];
  issues: Issue[];
  reminderLogs: ReminderLog[];
  customerNotificationLogs: CustomerNotificationLog[];
  telegramRecipients: TelegramRecipient[];
}

const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');
const ATTACHMENTS_DIR = path.join(DATA_DIR, 'attachments');

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
  },
  {
    id: 'prod_other',
    name: 'Boshqa mahsulot',
    code: 'OTH',
    description: 'Boshqa individual dasturiy yechimlar va integratsiyalar',
    modules: [
      { id: 'mod_oth_custom', name: 'Maxsus modul / Skript' },
      { id: 'mod_oth_api', name: 'Tashqi API Integratsiya' }
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
    if (!fs.existsSync(ATTACHMENTS_DIR)) {
      fs.mkdirSync(ATTACHMENTS_DIR, { recursive: true });
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
        const customerNotificationLogs = Array.isArray(parsed.customerNotificationLogs) ? parsed.customerNotificationLogs : [];
        const telegramRecipients = Array.isArray(parsed.telegramRecipients) && parsed.telegramRecipients.length > 0 ? parsed.telegramRecipients : INITIAL_RECIPIENTS;

        // Upgrade users with login/isActive/linkCode if missing
        users.forEach((u: any) => {
          if (!u.login) u.login = u.email ? u.email.split('@')[0] : u.id;
          if (u.isActive === undefined) u.isActive = true;
          if (!u.telegramLinkCode) u.telegramLinkCode = `TC-${u.id.toUpperCase()}`;
          if (u.role === 'DEVELOPER') u.role = 'MUTAXASSIS';
        });

        // Upgrade customers with INN and regions if missing
        customers.forEach((c: any, idx: number) => {
          if (!c.inn) c.inn = `30000000${(idx + 1) % 10}`;
          if (!c.companyStatus) c.companyStatus = 'FAOL';
          if (!c.legalAddress) c.legalAddress = c.address || 'Toshkent shahri';
          if (!c.regionId) c.regionId = 'reg_tashkent_city';
          if (!c.regionName) c.regionName = 'Toshkent shahri';
          if (!c.primaryPhone) c.primaryPhone = c.phone || '+998901234567';
          if (!c.preferredLanguage) c.preferredLanguage = 'UZ';
          if (!c.dataSource) c.dataSource = 'MANUAL';
          if (c.notificationConsent === undefined) c.notificationConsent = true;
          if (!Array.isArray(c.products)) {
            c.products = (c.productIds || []).map((pId: string) => {
              const p = products.find(prod => prod.id === pId);
              return {
                id: `cp_${Date.now()}_${pId}`,
                productId: pId,
                productName: p?.name || pId,
                isActive: true
              };
            });
          }
        });

        // Upgrade issues with operator lock, customerInn, region, attachments
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
          if (!iss.attachments) {
            iss.attachments = [];
          }
          if (!iss.regionId) {
            const cust = customers.find((c: any) => c.id === iss.customerId);
            iss.regionId = cust?.regionId || 'reg_tashkent_city';
            iss.regionName = cust?.regionName || 'Toshkent shahri';
            iss.customerInn = cust?.inn || '300000001';
          }
        });

        return {
          users,
          customers,
          products,
          issues,
          reminderLogs,
          customerNotificationLogs,
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
      customerNotificationLogs: [],
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

  // ==========================================
  // REGIONS & DISTRICTS
  // ==========================================
  getRegions(): RegionData[] {
    return UZBEKISTAN_REGIONS;
  }

  getRegionById(id: string): RegionData | undefined {
    return UZBEKISTAN_REGIONS.find(r => r.id === id);
  }

  getDistrictsByRegion(regionId: string): DistrictData[] {
    const region = this.getRegionById(regionId);
    return region ? region.districts : [];
  }

  // ==========================================
  // USERS / EMPLOYEES
  // ==========================================
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

  // ==========================================
  // CUSTOMER ACCOUNTS DIRECTORY
  // ==========================================
  getCustomers(filters?: {
    search?: string;
    regionId?: string;
    productId?: string;
    telegramLinked?: string;
    isActive?: string;
  }): Customer[] {
    let result = (this.data.customers || []).map(cust => {
      const issues = (this.data.issues || []).filter(i => i.customerId === cust.id);
      return {
        ...cust,
        issuesCount: issues.length
      };
    });

    if (filters) {
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        result = result.filter(c =>
          (c.inn && c.inn.includes(q)) ||
          c.companyName.toLowerCase().includes(q) ||
          c.primaryPhone.includes(q) ||
          (c.secondaryPhone && c.secondaryPhone.includes(q)) ||
          c.contactPerson.toLowerCase().includes(q) ||
          (c.telegramUsername && c.telegramUsername.toLowerCase().includes(q))
        );
      }
      if (filters.regionId && filters.regionId !== 'ALL') {
        result = result.filter(c => c.regionId === filters.regionId);
      }
      if (filters.productId && filters.productId !== 'ALL') {
        result = result.filter(c => 
          (c.products || []).some(p => p.productId === filters.productId) ||
          (c.productIds || []).includes(filters.productId)
        );
      }
      if (filters.telegramLinked !== undefined && filters.telegramLinked !== 'ALL') {
        const isLinked = filters.telegramLinked === 'true';
        result = result.filter(c => (!!c.telegramChatId) === isLinked);
      }
      if (filters.isActive !== undefined && filters.isActive !== 'ALL') {
        const isActive = filters.isActive === 'true';
        result = result.filter(c => c.isActive === isActive);
      }
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getCustomerById(id: string): Customer | undefined {
    const cust = (this.data.customers || []).find(c => c.id === id);
    if (!cust) return undefined;
    const issues = (this.data.issues || []).filter(i => i.customerId === cust.id);
    return {
      ...cust,
      issuesCount: issues.length
    };
  }

  getCustomerByInn(inn: string): Customer | undefined {
    const cleanInn = inn.trim().replace(/\D/g, '');
    return (this.data.customers || []).find(c => c.inn === cleanInn);
  }

  getCustomerByLinkToken(token: string): Customer | undefined {
    return (this.data.customers || []).find(c => c.telegramLinkToken === token);
  }

  addCustomer(customerData: {
    inn: string;
    companyName: string;
    shortName?: string;
    companyStatus?: 'FAOL' | 'TUGATILGAN' | 'TOXTATILGAN';
    legalAddress?: string;
    regionId: string;
    districtId?: string;
    districtName?: string;
    activityAddress?: string;
    primaryPhone: string;
    secondaryPhone?: string;
    contactPerson: string;
    position?: string;
    preferredLanguage?: 'UZ' | 'RU';
    responsibleOperatorId?: string;
    notes?: string;
    products?: CustomerProduct[];
    productIds?: string[];
    dataSource?: 'IHAMKOR' | 'MANUAL' | 'HYBRID';
  }): { success: boolean; customer?: Customer; error?: string } {
    const cleanInn = customerData.inn.trim().replace(/\D/g, '');
    if (cleanInn.length !== 9) {
      return { success: false, error: 'STIR/INN aynan 9 ta raqamdan iborat bo‘lishi shart!' };
    }

    const existing = this.getCustomerByInn(cleanInn);
    if (existing) {
      return { success: false, error: `Ushbu STIR (${cleanInn}) bo‘yicha mijoz mavjud: "${existing.companyName}"!` };
    }

    const region = this.getRegionById(customerData.regionId) || UZBEKISTAN_REGIONS[0];
    const operator = customerData.responsibleOperatorId ? this.getUserById(customerData.responsibleOperatorId) : undefined;

    const id = `cust_${Date.now()}`;
    const now = new Date().toISOString();

    const formattedProducts: CustomerProduct[] = (customerData.products && customerData.products.length > 0)
      ? customerData.products.map(p => ({
          ...p,
          id: p.id || `cp_${Date.now()}_${p.productId}`,
          isActive: p.isActive !== undefined ? p.isActive : true
        }))
      : (customerData.productIds || []).map(pId => {
          const p = this.data.products.find(prod => prod.id === pId);
          return {
            id: `cp_${Date.now()}_${pId}`,
            productId: pId,
            productName: p?.name || pId,
            isActive: true
          };
        });

    const newCustomer: Customer = {
      id,
      inn: cleanInn,
      companyName: customerData.companyName.trim(),
      shortName: customerData.shortName,
      companyStatus: customerData.companyStatus || 'FAOL',
      legalAddress: customerData.legalAddress || `${region.name_uz}, O‘zbekiston`,
      regionId: region.id,
      regionName: region.name_uz,
      districtId: customerData.districtId,
      districtName: customerData.districtName,
      activityAddress: customerData.activityAddress,
      primaryPhone: customerData.primaryPhone.trim(),
      secondaryPhone: customerData.secondaryPhone ? customerData.secondaryPhone.trim() : undefined,
      contactPerson: customerData.contactPerson.trim(),
      position: customerData.position,
      preferredLanguage: customerData.preferredLanguage || 'UZ',
      responsibleOperatorId: operator?.id,
      responsibleOperatorName: operator?.name,
      notificationConsent: true,
      dataSource: customerData.dataSource || 'MANUAL',
      sourceLastCheckedAt: now,
      isActive: true,
      notes: customerData.notes,
      productIds: formattedProducts.map(p => p.productId),
      products: formattedProducts,
      createdAt: now,
      updatedAt: now,
      issuesCount: 0
    };

    if (!this.data.customers) this.data.customers = [];
    this.data.customers.push(newCustomer);
    this.saveData();

    return { success: true, customer: newCustomer };
  }

  updateCustomer(id: string, updates: Partial<Customer>): { success: boolean; customer?: Customer; error?: string } {
    const customer = this.getCustomerById(id);
    if (!customer) return { success: false, error: 'Mijoz topilmadi!' };

    if (updates.inn && updates.inn !== customer.inn) {
      const cleanInn = updates.inn.trim().replace(/\D/g, '');
      const existing = this.getCustomerByInn(cleanInn);
      if (existing && existing.id !== id) {
        return { success: false, error: `Ushbu STIR (${cleanInn}) boshqa mijozda ro‘yxatga olingan!` };
      }
      updates.inn = cleanInn;
    }

    if (updates.regionId && updates.regionId !== customer.regionId) {
      const reg = this.getRegionById(updates.regionId);
      if (reg) updates.regionName = reg.name_uz;
    }

    if (updates.responsibleOperatorId && updates.responsibleOperatorId !== customer.responsibleOperatorId) {
      const op = this.getUserById(updates.responsibleOperatorId);
      if (op) updates.responsibleOperatorName = op.name;
    }

    if (updates.products) {
      updates.productIds = updates.products.map(p => p.productId);
    }

    updates.updatedAt = new Date().toISOString();
    Object.assign(customer, updates);
    this.saveData();

    return { success: true, customer };
  }

  deleteCustomer(id: string): { success: boolean; error?: string } {
    const customer = this.getCustomerById(id);
    if (!customer) return { success: false, error: 'Mijoz topilmadi!' };

    this.data.customers = (this.data.customers || []).filter(c => c.id !== id);
    this.saveData();
    return { success: true };
  }

  setCustomerTelegramLinkToken(customerId: string): { success: boolean; token?: string; linkUrl?: string; error?: string } {
    const customer = this.getCustomerById(customerId);
    if (!customer) return { success: false, error: 'Mijoz topilmadi!' };

    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const token = `cust_${customer.inn}_${randomSuffix}`;
    const expiresAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString(); // 48 soat

    customer.telegramLinkToken = token;
    customer.telegramLinkExpiresAt = expiresAt;
    this.saveData();

    const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'task_control_bot';
    const linkUrl = `https://t.me/${botUsername}?start=${token}`;

    return { success: true, token, linkUrl };
  }

  linkCustomerTelegram(customerId: string, chatId: string, username?: string): boolean {
    const customer = this.getCustomerById(customerId);
    if (!customer) return false;

    customer.telegramChatId = chatId;
    if (username) customer.telegramUsername = username.replace('@', '');
    customer.telegramLinkedAt = new Date().toISOString();
    customer.telegramLinkToken = undefined;
    customer.telegramLinkExpiresAt = undefined;
    customer.notificationConsent = true;

    this.saveData();
    return true;
  }

  unlinkCustomerTelegram(customerId: string): boolean {
    const customer = this.getCustomerById(customerId);
    if (!customer) return false;

    customer.telegramChatId = undefined;
    customer.telegramUsername = undefined;
    customer.telegramLinkedAt = undefined;
    customer.telegramLinkToken = undefined;
    customer.telegramLinkExpiresAt = undefined;

    this.saveData();
    return true;
  }

  // --- Customer Notification Logs ---
  addCustomerNotificationLog(log: Omit<CustomerNotificationLog, 'id' | 'sentAt'>): CustomerNotificationLog {
    const newLog: CustomerNotificationLog = {
      ...log,
      id: `cnl_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      sentAt: new Date().toISOString()
    };
    if (!this.data.customerNotificationLogs) this.data.customerNotificationLogs = [];
    this.data.customerNotificationLogs.push(newLog);
    this.saveData();
    return newLog;
  }

  getCustomerNotificationLogs(filters?: { customerId?: string; issueId?: string }): CustomerNotificationLog[] {
    let logs = this.data.customerNotificationLogs || [];
    if (filters?.customerId) logs = logs.filter(l => l.customerId === filters.customerId);
    if (filters?.issueId) logs = logs.filter(l => l.issueId === filters.issueId);
    return logs.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }

  // ==========================================
  // PRODUCTS
  // ==========================================
  getProducts(): Product[] {
    return this.data.products;
  }

  // ==========================================
  // ATTACHMENTS & MEDIA FILES
  // ==========================================
  saveAttachment(
    issueId: string,
    file: {
      originalName: string;
      mimeType: string;
      buffer: Buffer;
      uploadedBy: string;
    }
  ): Attachment {
    this.ensureDirectoryExistence();
    const id = `att_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const safeName = file.originalName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const fileName = `${id}_${safeName}`;
    const filePath = path.join(ATTACHMENTS_DIR, fileName);

    fs.writeFileSync(filePath, file.buffer);

    let category: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'ARCHIVE' | 'OTHER' = 'OTHER';
    if (file.mimeType.startsWith('image/')) category = 'IMAGE';
    else if (file.mimeType.startsWith('video/')) category = 'VIDEO';
    else if (file.mimeType.includes('pdf') || file.mimeType.includes('word') || file.mimeType.includes('sheet') || file.mimeType.includes('excel') || file.mimeType.includes('text')) category = 'DOCUMENT';
    else if (file.mimeType.includes('zip') || file.mimeType.includes('rar') || file.mimeType.includes('tar') || file.mimeType.includes('7z')) category = 'ARCHIVE';

    const bytes = file.buffer.length;
    const sizeFormatted = bytes > 1024 * 1024 
      ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(bytes / 1024)} KB`;

    const attachment: Attachment = {
      id,
      issueId,
      name: fileName,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: bytes,
      sizeFormatted,
      fileCategory: category,
      storagePath: filePath,
      url: `/api/attachments/${id}`,
      uploadedAt: new Date().toISOString(),
      uploadedBy: file.uploadedBy
    };

    const issue = this.getIssueById(issueId);
    if (issue) {
      if (!issue.attachments) issue.attachments = [];
      issue.attachments.push(attachment);
      this.saveData();
    }

    return attachment;
  }

  getAttachmentById(attachmentId: string): { attachment?: Attachment; filePath?: string } {
    for (const issue of (this.data.issues || [])) {
      const att = (issue.attachments || []).find(a => a.id === attachmentId);
      if (att) {
        return { attachment: att, filePath: att.storagePath };
      }
    }
    return {};
  }

  deleteAttachment(issueId: string, attachmentId: string): boolean {
    const issue = this.getIssueById(issueId);
    if (!issue || !issue.attachments) return false;

    const attIndex = issue.attachments.findIndex(a => a.id === attachmentId);
    if (attIndex === -1) return false;

    const att = issue.attachments[attIndex];
    if (att.storagePath && fs.existsSync(att.storagePath)) {
      try {
        fs.unlinkSync(att.storagePath);
      } catch (err) {
        console.warn('Failed to delete physical file:', err);
      }
    }

    issue.attachments.splice(attIndex, 1);
    this.saveData();
    return true;
  }

  // ==========================================
  // TELEGRAM RECIPIENTS (INTERNAL ADMINS)
  // ==========================================
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

  // ==========================================
  // ISSUES MANAGEMENT
  // ==========================================
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
    customerInn?: string;
    productId: string;
    moduleId: string;
    priority: Priority;
    created_by_operator_id: string; // Locked to operator
    assigned_specialist_id?: string;
    dueDate?: string;
    regionId?: string;
    contactPhoneSnapshot?: string;
    contactPersonSnapshot?: string;
  }): Issue {
    const now = new Date().toISOString();
    const customer = (this.data.customers || []).find(c => c.id === issueData.customerId);
    const product = this.data.products.find(p => p.id === issueData.productId);
    const module = product?.modules.find(m => m.id === issueData.moduleId);
    const operator = this.getUserById(issueData.created_by_operator_id) || this.data.users.find(u => u.role === 'OPERATOR');
    const specialist = issueData.assigned_specialist_id ? this.getUserById(issueData.assigned_specialist_id) : undefined;

    // Snapshot region from issueData or customer or fallback
    const targetRegionId = issueData.regionId || customer?.regionId || 'reg_tashkent_city';
    const regionObj = this.getRegionById(targetRegionId) || UZBEKISTAN_REGIONS[0];

    const count = (this.data.issues?.length || 0) + 1;
    const code = `TC-2026-${String(count).padStart(6, '0')}`;

    const cycles: IssueWorkCycle[] = [];
    if (specialist) {
      cycles.push({
        id: `cycle_1`,
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
      customerName: customer?.companyName || 'Noma\'lum korxona',
      customerInn: issueData.customerInn || customer?.inn || '300000001',
      customerPhone: customer?.primaryPhone,
      contactPhoneSnapshot: issueData.contactPhoneSnapshot || customer?.primaryPhone,
      contactPersonSnapshot: issueData.contactPersonSnapshot || customer?.contactPerson,
      regionId: regionObj.id,
      regionName: regionObj.name_uz,
      districtName: customer?.districtName,
      productId: issueData.productId,
      productName: product?.name || 'POSCODE',
      moduleId: issueData.moduleId,
      moduleName: module?.name || 'Asosiy modul',
      priority: issueData.priority || 'MEDIUM',
      status: specialist ? 'ASSIGNED' : 'NEW',
      stage: 'STAGE_1_ACCEPTED',
      created_by_operator_id: operator?.id || 'usr_op1',
      created_by_operator_name: operator?.name || 'Operator',
      current_specialist_id: specialist?.id,
      current_specialist_name: specialist?.name,
      cycles,
      currentCycleNumber: cycles.length > 0 ? 1 : 0,
      reopenCount: 0,
      reportedAt: now,
      dueDate: issueData.dueDate,
      reminderCount: 0,
      attachments: [],
      comments: [
        {
          id: `cmt_${Date.now()}`,
          issueId: `iss_${Date.now()}`,
          authorId: operator?.id || 'usr_op1',
          authorName: operator?.name || 'Operator',
          authorRole: 'OPERATOR',
          content: `Murojaat qabul qilindi va tizimda ro‘yxatdan o‘tkazildi. (Mijoz: ${customer?.companyName || 'Mijoz'}, Viloyat: ${regionObj.name_uz})`,
          stageChange: {
            from: 'STAGE_1_ACCEPTED',
            to: 'STAGE_1_ACCEPTED'
          },
          createdAt: now
        }
      ],
      updatedAt: now
    };

    if (!this.data.issues) this.data.issues = [];
    this.data.issues.push(newIssue);
    this.saveData();

    return newIssue;
  }

  updateIssue(id: string, updates: Partial<Issue>): Issue | undefined {
    const issue = this.getIssueById(id);
    if (!issue) return undefined;

    Object.assign(issue, updates, { updatedAt: new Date().toISOString() });
    this.saveData();
    return issue;
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

  addComment(issueId: string, commentData: { authorId: string; content: string; stageChange?: { from: StageId; to: StageId } }): Issue | undefined {
    const issue = this.getIssueById(issueId);
    if (!issue) return undefined;

    const author = this.getUserById(commentData.authorId);
    const comment = {
      id: `cmt_${Date.now()}`,
      issueId,
      authorId: commentData.authorId,
      authorName: author?.name || 'Foydalanuvchi',
      authorRole: author?.role || 'OPERATOR',
      content: commentData.content,
      stageChange: commentData.stageChange,
      createdAt: new Date().toISOString()
    };

    if (!issue.comments) issue.comments = [];
    issue.comments.push(comment);
    issue.updatedAt = new Date().toISOString();
    this.saveData();
    return issue;
  }

  addReminderLog(log: Omit<ReminderLog, 'id' | 'sentAt'>): ReminderLog {
    const newLog: ReminderLog = {
      ...log,
      id: `rem_${Date.now()}`,
      sentAt: new Date().toISOString()
    };
    if (!this.data.reminderLogs) this.data.reminderLogs = [];
    this.data.reminderLogs.push(newLog);
    this.saveData();
    return newLog;
  }

  getReminderLogs(): ReminderLog[] {
    return this.data.reminderLogs || [];
  }

  // ==========================================
  // REGIONAL & PRODUCT ANALYTICS
  // ==========================================
  getRegionReports(): RegionReportItem[] {
    const issues = this.data.issues || [];
    const customers = this.data.customers || [];
    const totalIssues = issues.length;

    return UZBEKISTAN_REGIONS.map(reg => {
      const regIssues = issues.filter(i => i.regionId === reg.id || i.regionName === reg.name_uz);
      const closed = regIssues.filter(i => i.status === 'CLOSED').length;
      const open = regIssues.length - closed;
      const reopened = regIssues.reduce((sum, i) => sum + (i.reopenCount || 0), 0);
      const regCustCount = customers.filter(c => c.regionId === reg.id).length;
      const sharePercentage = totalIssues > 0 ? Number(((regIssues.length / totalIssues) * 100).toFixed(1)) : 0;

      return {
        regionId: reg.id,
        regionName: reg.name_uz,
        totalIssues: regIssues.length,
        closedIssues: closed,
        openIssues: open,
        reopenedIssues: reopened,
        sharePercentage,
        customerCount: regCustCount
      };
    }).sort((a, b) => b.totalIssues - a.totalIssues);
  }

  getProductReports(): ProductReportItem[] {
    const issues = this.data.issues || [];
    const customers = this.data.customers || [];
    const totalIssues = issues.length;

    return this.data.products.map(prod => {
      const prodIssues = issues.filter(i => i.productId === prod.id || i.productName.toLowerCase() === prod.name.toLowerCase());
      const closed = prodIssues.filter(i => i.status === 'CLOSED').length;
      const open = prodIssues.length - closed;
      const reopened = prodIssues.reduce((sum, i) => sum + (i.reopenCount || 0), 0);
      const activeCust = customers.filter(c => 
        (c.products || []).some(cp => cp.productId === prod.id && cp.isActive) ||
        (c.productIds || []).includes(prod.id)
      ).length;
      const sharePercentage = totalIssues > 0 ? Number(((prodIssues.length / totalIssues) * 100).toFixed(1)) : 0;

      return {
        productId: prod.id,
        productName: prod.name,
        code: prod.code,
        totalIssues: prodIssues.length,
        closedIssues: closed,
        openIssues: open,
        reopenedIssues: reopened,
        sharePercentage,
        activeCustomerCount: activeCust
      };
    }).sort((a, b) => b.totalIssues - a.totalIssues);
  }

  getRegionProductMatrix(): RegionProductMatrixRow[] {
    const issues = this.data.issues || [];
    const products = this.data.products;

    return UZBEKISTAN_REGIONS.map(reg => {
      const regIssues = issues.filter(i => i.regionId === reg.id || i.regionName === reg.name_uz);
      const productCounts: Record<string, number> = {};

      products.forEach(p => {
        productCounts[p.id] = regIssues.filter(i => i.productId === p.id || i.productName.toLowerCase() === p.name.toLowerCase()).length;
      });

      return {
        regionId: reg.id,
        regionName: reg.name_uz,
        products: productCounts,
        total: regIssues.length
      };
    }).sort((a, b) => b.total - a.total);
  }

  getCustomerTelegramAnalytics() {
    const customers = this.data.customers || [];
    const logs = this.data.customerNotificationLogs || [];

    const linkedCount = customers.filter(c => !!c.telegramChatId).length;
    const unlinkedCount = customers.length - linkedCount;
    const totalNotificationsSent = logs.filter(l => l.deliveryStatus === 'SENT' || l.deliveryStatus === 'SIMULATED').length;
    const totalNotificationsFailed = logs.filter(l => l.deliveryStatus === 'FAILED').length;

    return {
      totalCustomers: customers.length,
      linkedCount,
      unlinkedCount,
      linkedPercentage: customers.length > 0 ? Number(((linkedCount / customers.length) * 100).toFixed(1)) : 0,
      totalNotificationsSent,
      totalNotificationsFailed,
      recentLogs: logs.slice(0, 10)
    };
  }

  // ==========================================
  // DASHBOARD STATS & KPIS
  // ==========================================
  getDashboardStats(): DashboardStats {
    const issues = this.data.issues || [];
    const customers = this.data.customers || [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const totalIssues = issues.length;
    const newIssues = issues.filter(i => i.status === 'NEW').length;
    const inProgress = issues.filter(i => i.status === 'IN_PROGRESS' || i.status === 'ASSIGNED').length;
    const waitingForSpecialist = issues.filter(i => i.status === 'ASSIGNED' || i.status === 'ANALYSIS').length;
    const solutionReady = issues.filter(i => i.stage === 'STAGE_2_RESOLVED' || i.status === 'SOLUTION_READY').length;
    const waitingForCustomer = issues.filter(i => i.stage === 'STAGE_3_DISPATCHED').length;
    const closedIssues = issues.filter(i => i.status === 'CLOSED').length;
    const reopenedIssues = issues.filter(i => i.reopenCount > 0).length;

    const overdueTasks = issues.filter(i => {
      if (i.status === 'CLOSED' || !i.dueDate) return false;
      return new Date(i.dueDate) < now;
    }).length;

    const stagesCount = {
      stage1: issues.filter(i => i.stage === 'STAGE_1_ACCEPTED').length,
      stage2: issues.filter(i => i.stage === 'STAGE_2_RESOLVED').length,
      stage3: issues.filter(i => i.stage === 'STAGE_3_DISPATCHED').length,
      stage4: issues.filter(i => i.stage === 'STAGE_4_CONFIRMED').length
    };

    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.isActive).length;
    const telegramLinkedCustomers = customers.filter(c => !!c.telegramChatId).length;
    const todayIssues = issues.filter(i => i.reportedAt && i.reportedAt.startsWith(todayStr)).length;

    const regionReports = this.getRegionReports();
    const topRegions = regionReports.slice(0, 5).map(r => ({
      regionId: r.regionId,
      regionName: r.regionName,
      count: r.totalIssues
    }));

    const productReports = this.getProductReports();
    const productDistribution = productReports.map(p => ({
      productId: p.productId,
      productName: p.productName,
      count: p.totalIssues
    }));

    const tgAnalytics = this.getCustomerTelegramAnalytics();

    return {
      totalIssues,
      newIssues,
      inProgress,
      waitingForSpecialist,
      waitingForDeveloper: waitingForSpecialist,
      solutionReady,
      waitingForCustomer,
      overdueTasks,
      closedIssues,
      reopenedIssues,
      stagesCount,
      totalCustomers,
      activeCustomers,
      telegramLinkedCustomers,
      todayIssues,
      topRegions,
      productDistribution,
      telegramStats: {
        linkedCount: tgAnalytics.linkedCount,
        unlinkedCount: tgAnalytics.unlinkedCount,
        totalNotificationsSent: tgAnalytics.totalNotificationsSent,
        totalNotificationsFailed: tgAnalytics.totalNotificationsFailed
      }
    };
  }

  getSpecialistKPIs(): SpecialistKPI[] {
    const specialists = this.data.users.filter(u => u.role === 'MUTAXASSIS' || (u.role as string) === 'DEVELOPER');
    const issues = this.data.issues || [];

    return specialists.map(sp => {
      const spIssues = issues.filter(i => i.current_specialist_id === sp.id || i.assignedDevId === sp.id);
      const assignedCount = spIssues.length;
      const completedCount = spIssues.filter(i => i.stage === 'STAGE_2_RESOLVED' || i.stage === 'STAGE_3_DISPATCHED' || i.stage === 'STAGE_4_CONFIRMED').length;
      const inProgressCount = spIssues.filter(i => i.status === 'IN_PROGRESS').length;
      const reopenedCount = spIssues.reduce((sum, i) => sum + (i.reopenCount || 0), 0);

      let totalResolutionSec = 0;
      let resolvedCount = 0;
      let onTimeCount = 0;

      spIssues.forEach(i => {
        if (i.resolvedAt && i.reportedAt) {
          const diff = Math.max(0, Math.floor((new Date(i.resolvedAt).getTime() - new Date(i.reportedAt).getTime()) / 1000));
          totalResolutionSec += diff;
          resolvedCount++;

          if (i.dueDate && new Date(i.resolvedAt) <= new Date(i.dueDate)) {
            onTimeCount++;
          } else if (!i.dueDate) {
            onTimeCount++;
          }
        }
      });

      const averageResolutionSeconds = resolvedCount > 0 ? Math.round(totalResolutionSec / resolvedCount) : 0;
      const onTimePercentage = resolvedCount > 0 ? Math.round((onTimeCount / resolvedCount) * 100) : 100;
      const returnRatePercentage = assignedCount > 0 ? Math.min(100, Math.round((reopenedCount / assignedCount) * 100)) : 0;

      let kpiScore = 100;
      if (assignedCount > 0) {
        const slaScore = onTimePercentage;
        const qualityScore = Math.max(0, 100 - returnRatePercentage * 2);
        const speedScore = averageResolutionSeconds > 0 ? Math.max(0, 100 - (averageResolutionSeconds / 3600) * 10) : 100;
        kpiScore = Math.min(100, Math.round(slaScore * 0.40 + qualityScore * 0.35 + speedScore * 0.25));
      }

      return {
        id: sp.id,
        name: sp.name,
        phone: sp.phone,
        role: sp.role,
        assignedCount,
        completedCount,
        inProgressCount,
        reopenedCount,
        averageResolutionSeconds,
        onTimePercentage,
        returnRatePercentage,
        kpiScore: Math.max(50, kpiScore)
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
