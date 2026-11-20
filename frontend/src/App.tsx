import React, { useState, useEffect } from 'react';
import { Customer, DashboardStats, Issue, IssueStatus, Product, ReminderLog, TelegramRecipient, User, UserRole } from './types';
import { Language } from './translations';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { KanbanView } from './components/KanbanView';
import { IssuesListView } from './components/IssuesListView';
import { EmployeesView } from './components/EmployeesView';
import { KPIView } from './components/KPIView';
import { ReportsView } from './components/ReportsView';
import { CustomersView } from './components/CustomersView';
import { ProductsView } from './components/ProductsView';
import { RemindersView } from './components/RemindersView';
import { IssueDetailModal } from './components/IssueDetailModal';
import { NewIssueModal } from './components/NewIssueModal';
import { LoginView } from './components/LoginView';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('task_control_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const currentRole: UserRole = currentUser?.role || 'SUPER_ADMIN';
  const [currentTab, setCurrentTab] = useState<ActiveTab>('dashboard');
  const [lang, setLang] = useState<Language>('UZ');
  
  // Day / Night mode
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('task_control_theme') as 'light' | 'dark') || 'light';
  });

  const [issues, setIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [reminders, setReminders] = useState<ReminderLog[]>([]);
  const [recipients, setRecipients] = useState<TelegramRecipient[]>([]);

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isNewIssueOpen, setIsNewIssueOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sync theme class to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('task_control_theme', theme);
  }, [theme]);

  // Load initial data
  const fetchData = async () => {
    try {
      const [issuesRes, statsRes, custRes, prodRes, usersRes, remRes, recipRes] = await Promise.all([
        fetch('/api/issues').then(r => r.json()),
        fetch('/api/dashboard/stats').then(r => r.json()),
        fetch('/api/customers').then(r => r.json()),
        fetch('/api/products').then(r => r.json()),
        fetch('/api/employees').then(r => r.json()),
        fetch('/api/reminders').then(r => r.json()),
        fetch('/api/telegram/recipients').then(r => r.json()).catch(() => [])
      ]);

      setIssues(issuesRes || []);
      setStats(statsRes);
      setCustomers(custRes || []);
      setProducts(prodRes || []);
      setUsers(usersRes || []);
      setReminders(remRes || []);
      if (recipRes) setRecipients(recipRes);

      if (selectedIssue) {
        const updated = issuesRes.find((i: Issue) => i.id === selectedIssue.id);
        if (updated) setSelectedIssue(updated);
      }
    } catch (err) {
      console.error('Failed to load API data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, [selectedIssue?.id]);

  const getActiveOperatorId = () => {
    if (currentUser?.role === 'OPERATOR') return currentUser.id;
    const operator = users.find(u => u.role === 'OPERATOR');
    return operator?.id || currentUser?.id || 'usr_op1';
  };

  const getActiveSpecialistId = () => {
    if (currentUser?.role === 'MUTAXASSIS' || (currentUser?.role as string) === 'DEVELOPER') return currentUser.id;
    const spec = users.find(u => u.role === 'MUTAXASSIS' || (u.role as string) === 'DEVELOPER');
    return spec?.id || 'usr_spec1';
  };

  const handleCreateIssue = async (issueData: any) => {
    const res = await fetch('/api/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...issueData,
        created_by_operator_id: getActiveOperatorId()
      })
    });
    if (res.ok) {
      await fetchData();
    }
  };

  // Mutaxassis accepts
  const handleAcceptTask = async (issueId: string) => {
    const res = await fetch(`/api/issues/${issueId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ specialistId: getActiveSpecialistId() })
    });
    if (res.ok) await fetchData();
  };

  // Mutaxassis pauses (Waiting)
  const handlePauseTask = async (issueId: string, reason: string) => {
    const res = await fetch(`/api/issues/${issueId}/wait`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ specialistId: getActiveSpecialistId(), reason })
    });
    if (res.ok) await fetchData();
  };

  // Mutaxassis resumes
  const handleResumeTask = async (issueId: string) => {
    const res = await fetch(`/api/issues/${issueId}/resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ specialistId: getActiveSpecialistId() })
    });
    if (res.ok) await fetchData();
  };

  // Mutaxassis submits solution -> routes back to operator
  const handleSubmitSolution = async (issueId: string, solutionData: any) => {
    const res = await fetch(`/api/issues/${issueId}/solution`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...solutionData,
        specialistId: getActiveSpecialistId()
      })
    });
    if (res.ok) await fetchData();
  };

  // Operator contacts customer
  const handleDispatchToCustomer = async (issueId: string, dispatchData: any) => {
    const res = await fetch(`/api/issues/${issueId}/customer-contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...dispatchData,
        operatorId: getActiveOperatorId()
      })
    });
    if (res.ok) await fetchData();
  };

  // Operator confirms with customer and closes issue
  const handleConfirmClose = async (issueId: string, closeData: any) => {
    const res = await fetch(`/api/issues/${issueId}/confirm-close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...closeData,
        operatorId: getActiveOperatorId()
      })
    });
    if (res.ok) await fetchData();
  };

  // Operator reopens issue -> routes back to specialist
  const handleReopen = async (issueId: string, returnReason: string) => {
    const res = await fetch(`/api/issues/${issueId}/reopen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operatorId: getActiveOperatorId(),
        returnReason
      })
    });
    if (res.ok) await fetchData();
  };

  const handleAddComment = async (issueId: string, content: string) => {
    const activeUser = users.find(u => u.role === currentRole) || users[0];
    const res = await fetch(`/api/issues/${issueId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authorId: activeUser?.id || 'usr_admin',
        authorName: activeUser?.name || 'Administrator',
        authorRole: currentRole,
        content
      })
    });
    if (res.ok) await fetchData();
  };

  // Customer Management
  const handleUpdateCustomer = async (id: string, updates: any) => {
    const res = await fetch(`/api/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (res.ok) await fetchData();
  };

  const handleDeleteCustomer = async (id: string) => {
    const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    if (res.ok) await fetchData();
  };

  // Attachments Management
  const handleUploadAttachment = async (issueId: string, fileData: { originalName: string; mimeType: string; base64: string; size: number }) => {
    const activeUser = users.find(u => u.role === currentRole) || users[0];
    const res = await fetch(`/api/issues/${issueId}/attachments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...fileData,
        uploadedById: activeUser?.id || 'usr_admin',
        uploadedByName: activeUser?.name || 'Administrator',
        uploadedByRole: currentRole
      })
    });
    if (res.ok) await fetchData();
  };

  const handleDeleteAttachment = async (issueId: string, attachmentId: string) => {
    const res = await fetch(`/api/issues/${issueId}/attachments/${attachmentId}`, {
      method: 'DELETE'
    });
    if (res.ok) await fetchData();
  };

  const unresolvedCount = issues.filter(i => i.status !== 'CLOSED' && i.status !== 'CANCELLED').length;

  // If user is not logged in, show Login page
  if (!currentUser) {
    return (
      <LoginView
        onLogin={(user) => {
          setCurrentUser(user);
          setCurrentTab('dashboard');
        }}
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F1D] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Navbar */}
      <Navbar
        currentTab={currentTab}
        setTab={setCurrentTab}
        currentUser={currentUser}
        onLogout={() => {
          localStorage.removeItem('task_control_user');
          localStorage.removeItem('task_control_token');
          setCurrentUser(null);
        }}
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        onOpenNewIssue={() => setIsNewIssueOpen(true)}
        unresolvedCount={unresolvedCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {loading && !stats ? (
          <div className="flex items-center justify-center h-64 font-mono text-sm text-slate-400">
            // MA'LUMOTLAR YUKLANMOQDA...
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && stats && (
              <DashboardView
                stats={stats}
                issues={issues}
                customers={customers}
                lang={lang}
                onSelectIssue={(issue) => setSelectedIssue(issue)}
                onNavigateToTab={(tab) => setCurrentTab(tab)}
              />
            )}

            {currentTab === 'kanban' && (
              <KanbanView
                issues={issues}
                currentRole={currentRole}
                lang={lang}
                onSelectIssue={(issue) => setSelectedIssue(issue)}
                onUpdateStatus={async () => {}}
              />
            )}

            {currentTab === 'issues' && (
              <IssuesListView
                issues={issues}
                lang={lang}
                onSelectIssue={(issue) => setSelectedIssue(issue)}
              />
            )}

            {currentTab === 'employees' && (
              <EmployeesView
                users={users}
                onRefresh={fetchData}
                lang={lang}
              />
            )}

            {currentTab === 'kpi' && (
              <KPIView
                lang={lang}
              />
            )}

            {currentTab === 'reports' && (
              <ReportsView
                lang={lang}
              />
            )}

            {currentTab === 'customers' && (
              <CustomersView
                customers={customers}
                products={products}
                lang={lang}
                currentUserRole={currentRole}
                operators={users.filter(u => u.role === 'OPERATOR')}
                onAddCustomer={async (c) => {
                  await fetch('/api/customers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(c)
                  });
                  fetchData();
                }}
                onUpdateCustomer={handleUpdateCustomer}
                onDeleteCustomer={handleDeleteCustomer}
              />
            )}

            {currentTab === 'products' && (
              <ProductsView
                products={products}
                lang={lang}
              />
            )}

            {currentTab === 'reminders' && (
              <RemindersView
                reminders={reminders}
                recipients={recipients}
                lang={lang}
                onTriggerCheck={async () => {
                  await fetch('/api/reminders/check-now', { method: 'POST' });
                  fetchData();
                }}
                onAddRecipient={async (r) => {
                  await fetch('/api/telegram/recipients', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(r)
                  });
                  fetchData();
                }}
                onRemoveRecipient={async (id) => {
                  await fetch(`/api/telegram/recipients/${id}`, { method: 'DELETE' });
                  fetchData();
                }}
                onToggleRecipient={async (id) => {
                  await fetch(`/api/telegram/recipients/${id}/toggle`, { method: 'PATCH' });
                  fetchData();
                }}
                onTestRecipient={async (chatId, name) => {
                  await fetch('/api/telegram/test-recipient', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chatId, name })
                  });
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Detail Modal */}
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          currentRole={currentRole}
          lang={lang}
          onClose={() => setSelectedIssue(null)}
          onAcceptTask={handleAcceptTask}
          onPauseTask={handlePauseTask}
          onResumeTask={handleResumeTask}
          onSubmitSolution={handleSubmitSolution}
          onDispatchToCustomer={handleDispatchToCustomer}
          onConfirmClose={handleConfirmClose}
          onReopen={handleReopen}
          onAddComment={handleAddComment}
          onUploadAttachment={handleUploadAttachment}
          onDeleteAttachment={handleDeleteAttachment}
        />
      )}

      {/* New Issue Modal */}
      {isNewIssueOpen && (
        <NewIssueModal
          customers={customers}
          products={products}
          users={users}
          lang={lang}
          onClose={() => setIsNewIssueOpen(false)}
          onCreateIssue={handleCreateIssue}
        />
      )}
    </div>
  );
};

export default App;
