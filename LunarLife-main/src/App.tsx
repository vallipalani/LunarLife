import React, { useState } from 'react';
import { PageId, AstronautProfile, DailyTask, NotificationItem } from './types';
import { initialAstronautProfile, initialDailyTasks, recentAlerts } from './data';
import { Sidebar, Header } from './components';
import { Dashboard } from './pages/Dashboard';
import { AiAssistant } from './pages/AiAssistant';
import { AdaptiveAssessment } from './pages/AdaptiveAssessment';
import { PersonalHealth } from './pages/PersonalHealth';
import { PredictiveAnalytics } from './pages/PredictiveAnalytics';
import { HealthRecommendations } from './pages/HealthRecommendations';
import { Settings } from './pages/Settings';

export function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Astronaut Profile State (shared across Header, Sidebar, and PersonalHealth page)
  const [astronaut, setAstronaut] = useState<AstronautProfile>(initialAstronautProfile);

  // Dashboard Daily Tasks State
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(initialDailyTasks);

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>(recentAlerts);

  const handleToggleTask = (taskId: string) => {
    setDailyTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task))
    );
  };

  const handleUpdateProfile = (updated: Partial<AstronautProfile>) => {
    setAstronaut((prev) => ({ ...prev, ...updated }));
  };

  const handleResetAllData = () => {
    setAstronaut(initialAstronautProfile);
    setDailyTasks(initialDailyTasks);
    setNotifications(recentAlerts);
  };

  const pageTitles: Record<PageId, string> = {
    'dashboard': 'Dashboard',
    'ai-assistant': 'AI Medical Assistant',
    'adaptive-assessment': 'Adaptive Health Assessment',
    'health-profile-info': 'Personal Health Information',
    'health-profile-analytics': 'Predictive Analytics',
    'health-profile-recommendations': 'Health Recommendations',
    'settings': 'Settings',
  };

  const renderActivePage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            astronaut={astronaut}
            dailyTasks={dailyTasks}
            onToggleTask={handleToggleTask}
            onNavigateToAssistant={() => setCurrentPage('ai-assistant')}
          />
        );
      case 'ai-assistant':
        return <AiAssistant astronaut={astronaut} />;
      case 'adaptive-assessment':
        return <AdaptiveAssessment astronaut={astronaut} />;
      case 'health-profile-info':
        return <PersonalHealth astronaut={astronaut} onUpdateProfile={handleUpdateProfile} />;
      case 'health-profile-analytics':
        return <PredictiveAnalytics />;
      case 'health-profile-recommendations':
        return <HealthRecommendations />;
      case 'settings':
        return <Settings astronaut={astronaut} onResetAllData={handleResetAllData} />;
      default:
        return (
          <Dashboard
            astronaut={astronaut}
            dailyTasks={dailyTasks}
            onToggleTask={handleToggleTask}
            onNavigateToAssistant={() => setCurrentPage('ai-assistant')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-800 flex flex-col antialiased">
      {/* Shared Application Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        astronaut={astronaut}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Shared Top Application Header */}
        <Header
          currentPageTitle={pageTitles[currentPage]}
          astronaut={astronaut}
          notifications={notifications}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onNavigateToSettings={() => setCurrentPage('settings')}
          onNavigateToProfile={() => setCurrentPage('health-profile-info')}
        />

        {/* Spacious Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}

export default App;
