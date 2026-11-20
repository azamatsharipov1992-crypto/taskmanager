export type UserRole = 'SUPER_ADMIN' | 'MANAGER' | 'OPERATOR' | 'MUTAXASSIS' | 'DEVELOPER';

export type StageId = 
  | 'STAGE_1_ACCEPTED'     // 1. Murojaat qabul qilindi / biriktirildi
  | 'STAGE_2_RESOLVED'     // 2. Mas'ul mutaxassis yechim berdi (Operatorga topshirildi)
  | 'STAGE_3_DISPATCHED'   // 3. Yechim mijozga yetkazildi (Mijoz tasdig'i kutilmoqda)
  | 'STAGE_4_CONFIRMED';   // 4. Mijoz natijani tasdiqladi (Yopildi)

export type IssueStatus =
  | 'NEW'
  | 'ANALYSIS'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'WAITING'
  | 'SOLUTION_READY'
  | 'TESTING'
  | 'CUSTOMER_NOTIFY'
  | 'CUSTOMER_CONFIRM'
  | 'CUSTOMER_CONTACT'
  | 'REOPENED'
  | 'CLOSED'
  | 'CANCELLED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  name: string;           // FIO
  email?: string;
  login: string;
  password?: string;
  role: UserRole;
  phone: string;          // Majburiy va takrorlanmas
  telegramUsername?: string;
  telegramChatId?: string;
  telegramLinkCode?: string;
  telegramLinkedAt?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  stats?: {
    assignedCount: number;
    inProgressCount: number;
    solutionReadyCount: number;
    closedSpecialistCount: number;
    registeredCount: number;
    closedOperatorCount: number;
    reopenedCount: number;
  };
}

export interface CustomerProduct {
  id: string;
  productId: string;
  productName: string;
  moduleId?: string;
  moduleName?: string;
  version?: string;
  startedAt?: string;
  isActive: boolean;
  notes?: string;
}

export interface CustomerContact {
  id: string;
  fullName: string;
  phone: string;
  position?: string;
  isPrimary: boolean;
  telegramChatId?: string;
  telegramUsername?: string;
  telegramLinkedAt?: string;
  notificationConsent: boolean;
  preferredLanguage: 'UZ' | 'RU';
  isActive: boolean;
}

export interface Customer {
  id: string;
  inn: string;                     // STIR/INN (9 xonali)
  companyName: string;             // Rasmiy tashkilot nomi
  shortName?: string;
  companyStatus: 'FAOL' | 'TUGATILGAN' | 'TOXTATILGAN';
  legalAddress: string;            // Yuridik manzil (iHamkor/hujjat)
  regionId: string;                // 14 ta hudud kodi
  regionName: string;              // Viloyat nomi
  districtId?: string;             // Tuman/shahar
  districtName?: string;
  activityAddress?: string;        // Amaldagi faoliyat manzili
  primaryPhone: string;            // Asosiy telefon
  secondaryPhone?: string;         // Qo‘shimcha telefon
  contactPerson: string;           // Mas'ul shaxs (FIO)
  position?: string;               // Lavozimi
  preferredLanguage: 'UZ' | 'RU';  // Muloqot tili
  responsibleOperatorId?: string;  // Biriktirilgan operator
  responsibleOperatorName?: string;
  telegramChatId?: string;         // Bog‘langan Telegram Chat ID
  telegramUsername?: string;       // @username
  telegramLinkedAt?: string;
  telegramLinkToken?: string;      // Bir martalik token
  telegramLinkExpiresAt?: string;
  notificationConsent: boolean;    // Xabarlarga rozilik
  dataSource: 'IHAMKOR' | 'MANUAL' | 'HYBRID';
  sourceLastCheckedAt?: string;
  isActive: boolean;
  notes?: string;
  productIds: string[];            // ID ro‘yxati (backward compatibility)
  products: CustomerProduct[];     // Dasturiy mahsulotlar to‘liq ro‘yxati
  contacts?: CustomerContact[];    // Qo‘shimcha aloqa shaxslari
  createdAt: string;
  updatedAt: string;
  issuesCount?: number;            // Jami murojaatlar
}

export interface ProductModule {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  description: string;
  modules: ProductModule[];
  isActive?: boolean;
}

export interface Attachment {
  id: string;
  issueId?: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  sizeFormatted: string;
  fileCategory: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'ARCHIVE' | 'OTHER';
  storagePath: string;
  url: string;
  dataUrl?: string; // base64 preview for images if small
  uploadedAt: string;
  uploadedBy: string;
}

export interface Comment {
  id: string;
  issueId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  stageChange?: {
    from: StageId;
    to: StageId;
  };
  createdAt: string;
}

export interface IssueWorkCycle {
  id: string;
  cycleNumber: number;
  specialistId: string;
  specialistName: string;
  assignedAt: string;
  acceptedAt?: string;
  startedAt?: string;
  waitingSeconds: number;
  pausedAt?: string;
  waitingReason?: string;
  solutionReadyAt?: string;
  solutionNote?: string;
  returnedToOperatorAt?: string;
  returnReason?: string;
  activeSeconds: number;
  totalSeconds: number;
}

export interface Issue {
  id: string;
  code: string; // TC-2026-000101
  title: string;
  description: string;
  customerId: string;
  customerName: string;
  customerInn?: string;
  customerPhone?: string;
  contactPhoneSnapshot?: string;     // Murojaat paytidagi telefon
  contactPersonSnapshot?: string;    // Murojaat paytidagi aloqa shaxsi
  regionId?: string;                 // Murojaat paytidagi viloyat kodi
  regionName?: string;               // Murojaat paytidagi viloyat nomi
  districtName?: string;
  productId: string;
  productName: string;
  moduleId: string;
  moduleName: string;
  priority: Priority;
  status: IssueStatus;
  stage: StageId;
  
  // Operator who registered the issue (PERMANENTLY LOCKED)
  created_by_operator_id: string;
  created_by_operator_name: string;
  createdById?: string;
  createdByName?: string;
  
  // Responsible specialist currently working on it
  current_specialist_id?: string;
  current_specialist_name?: string;
  assignedDevId?: string;
  assignedDevName?: string;

  // Work Cycles & Reopen Tracking
  cycles: IssueWorkCycle[];
  currentCycleNumber: number;
  reopenCount: number;

  // 4 Control Stages Data
  reportedAt: string;        // Stage 1
  stage1CompletedAt?: string;
  
  resolvedAt?: string;        // Stage 2: When specialist submitted solution
  solutionNote?: string;
  commitUrl?: string;
  appVersion?: string;

  dispatchedAt?: string;      // Stage 3: When operator contacted customer
  dispatchedById?: string;
  dispatchedByName?: string;
  dispatchMethod?: 'TELEGRAM' | 'PHONE' | 'MEETING' | 'REMOTE';
  dispatchNote?: string;

  closedAt?: string;          // Stage 4: When customer confirmed resolution
  closedById?: string;
  closedByName?: string;
  customerFeedback?: string;
  customerRating?: number; // 1-5

  // Reminders & Deadlines
  dueDate?: string;
  lastReminderSentAt?: string;
  reminderCount: number;

  attachments: Attachment[];
  comments: Comment[];
  updatedAt: string;
}

export interface ReminderLog {
  id: string;
  issueId: string;
  issueCode: string;
  issueTitle: string;
  targetRole: UserRole;
  targetRecipient: string;
  stage: StageId;
  message: string;
  sentAt: string;
  status: 'SENT' | 'SIMULATED' | 'FAILED';
}

export interface CustomerNotificationLog {
  id: string;
  customerId: string;
  customerName: string;
  issueId?: string;
  issueCode?: string;
  telegramChatId: string;
  notificationType: 'ISSUE_CREATED' | 'ASSIGNED' | 'SOLUTION_READY' | 'ISSUE_CLOSED' | 'LINK_CONFIRMED' | 'TEST';
  message: string;
  deliveryStatus: 'SENT' | 'FAILED' | 'SIMULATED';
  sentAt: string;
  errorMessage?: string;
}

export interface TelegramRecipient {
  id: string;
  name: string;
  role: string;
  chatId: string;
  username?: string;
  isActive: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalIssues: number;
  newIssues: number;
  inProgress: number;
  waitingForSpecialist: number;
  waitingForDeveloper?: number;
  solutionReady: number;
  waitingForCustomer: number;
  overdueTasks: number;
  closedIssues: number;
  reopenedIssues: number;
  stagesCount: {
    stage1: number;
    stage2: number;
    stage3: number;
    stage4: number;
  };
  // New Customer & Regional Stats
  totalCustomers: number;
  activeCustomers: number;
  telegramLinkedCustomers: number;
  todayIssues: number;
  topRegions: {
    regionId: string;
    regionName: string;
    count: number;
  }[];
  productDistribution: {
    productId: string;
    productName: string;
    count: number;
  }[];
  telegramStats: {
    linkedCount: number;
    unlinkedCount: number;
    totalNotificationsSent: number;
    totalNotificationsFailed: number;
  };
}

export interface RegionReportItem {
  regionId: string;
  regionName: string;
  totalIssues: number;
  closedIssues: number;
  openIssues: number;
  reopenedIssues: number;
  sharePercentage: number;
  customerCount: number;
}

export interface ProductReportItem {
  productId: string;
  productName: string;
  code: string;
  totalIssues: number;
  closedIssues: number;
  openIssues: number;
  reopenedIssues: number;
  sharePercentage: number;
  activeCustomerCount: number;
}

export interface RegionProductMatrixRow {
  regionId: string;
  regionName: string;
  products: Record<string, number>;
  total: number;
}

export interface SpecialistKPI {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  assignedCount: number;
  completedCount: number;
  inProgressCount: number;
  reopenedCount: number;
  averageResolutionSeconds: number; // o'rtacha yechish vaqti
  onTimePercentage: number;          // o'z vaqtida bajarish %
  returnRatePercentage: number;      // qaytarilish darajasi %
  kpiScore: number;                  // 0 - 100 ball
}

export interface OperatorKPI {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  totalRegistered: number;
  solutionDeliveredCount: number;
  closedCount: number;
  reopenedCount: number;
  averageContactSeconds: number;     // yechim chiqqandan mijozga yetkazish vaqti
  averageRating: number;             // mijozlar qoniqish reytingi (1-5)
  kpiScore: number;                  // 0 - 100 ball
}

export interface SystemReportSummary {
  period: 'daily' | 'weekly' | 'monthly' | 'custom';
  generatedAt: string;
  totalReceived: number;
  currentlyInProgress: number;
  waitingForCustomer: number;
  totalClosed: number;
  totalReopened: number;
  averageResolutionHours: number;
  productStats: {
    productId: string;
    productName: string;
    count: number;
    closedCount: number;
  }[];
  topSpecialists: {
    name: string;
    completed: number;
    avgHours: number;
    score: number;
  }[];
  topOperators: {
    name: string;
    registered: number;
    closed: number;
    score: number;
  }[];
}
