import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Bot,
  ClipboardCheck,
  UserCheck,
  FileText,
  TrendingUp,
  ShieldCheck,
  Settings,
  Bell,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Activity,
  Heart,
  Thermometer,
  Moon,
  Smile,
  LucideIcon,
} from 'lucide-react';
import { PageId, AstronautProfile, NotificationItem } from './types';

// ============================================================================
// 1. REUSABLE CARD & BADGE
// ============================================================================

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Card({ children, className = '', title, subtitle, action }: CardProps) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200/80 shadow-subtle p-5 sm:p-6 transition-all ${className}`}>
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-900 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="ml-4 shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'neutral' | 'success' | 'amber' | 'rose';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'neutral', size = 'sm', className = '' }: BadgeProps) {
  const styles = {
    blue: 'bg-sky-50 text-sky-700 border border-sky-200/60',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200/60',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200/60',
    rose: 'bg-rose-50 text-rose-700 border border-rose-200/60',
  }[variant];

  const sizeStyles = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center font-medium rounded-md tracking-wide ${styles} ${sizeStyles} ${className}`}>
      {children}
    </span>
  );
}

// ============================================================================
// 2. METRIC CARD COMPONENT
// ============================================================================

interface MetricCardProps {
  label: string;
  value: string;
  unit: string;
  status: 'Normal' | 'Good' | 'Monitor' | 'Attention';
  subtext: string;
  trend?: string;
  iconName: 'Heart' | 'Activity' | 'Thermometer' | 'Moon' | 'Smile';
}

export function MetricCard({
  label,
  value,
  unit,
  status,
  subtext,
  trend,
  iconName,
}: MetricCardProps) {
  const iconMap: Record<string, LucideIcon> = {
    Heart,
    Activity,
    Thermometer,
    Moon,
    Smile,
  };

  const Icon = iconMap[iconName] || Activity;

  const statusVariantMap: Record<string, 'success' | 'blue' | 'amber' | 'rose'> = {
    Normal: 'success',
    Good: 'success',
    Monitor: 'amber',
    Attention: 'rose',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-subtle p-5 hover:border-slate-300 transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
          <Icon className="w-4 h-4 stroke-[2]" />
        </div>
      </div>

      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
        <span className="text-xs font-medium text-slate-500">{unit}</span>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 truncate mr-2">{subtext}</span>
        <Badge variant={statusVariantMap[status] || 'neutral'} size="sm">
          {status}
        </Badge>
      </div>

      {trend && (
        <div className="mt-1 text-[11px] text-slate-400">
          {trend}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 3. PAGE HEADER
// ============================================================================

interface PageHeaderProps {
  title: string;
  category: string;
  description: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, category, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60">
      <div>
        <div className="text-xs font-semibold text-sky-600 uppercase tracking-wider mb-1">
          {category}
        </div>
        <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">{title}</h2>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>
      {action && <div className="self-start sm:self-center shrink-0">{action}</div>}
    </div>
  );
}

// ============================================================================
// 4. SIDEBAR COMPONENT
// ============================================================================

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  isOpen: boolean;
  onClose: () => void;
  astronaut: AstronautProfile;
}

export function Sidebar({ currentPage, onNavigate, isOpen, onClose, astronaut }: SidebarProps) {
  const isProfileSubpage =
    currentPage === 'health-profile-info' ||
    currentPage === 'health-profile-analytics' ||
    currentPage === 'health-profile-recommendations';

  const [isProfileExpanded, setIsProfileExpanded] = useState<boolean>(true);

  // Keep submenu open if navigated to a subpage
  useEffect(() => {
    if (isProfileSubpage) {
      setIsProfileExpanded(true);
    }
  }, [isProfileSubpage]);

  const handleParentProfileClick = () => {
    setIsProfileExpanded((prev) => !prev);
    if (!isProfileSubpage) {
      onNavigate('health-profile-info');
    }
  };

  const handleNavClick = (page: PageId) => {
    onNavigate(page);
    onClose();
  };

  const isItemActive = (page: PageId) => currentPage === page;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/25 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#FAFBFD] border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Brand / Logo */}
        <div className="p-5 border-b border-slate-200/70 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-sm shadow-sky-600/20">
              <Activity className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight text-slate-900">ASTRA HEALTH</div>
              <div className="text-[11px] font-normal text-slate-500 leading-none mt-0.5">
                Astronaut Health Monitoring
              </div>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Middle: Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {/* Dashboard */}
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isItemActive('dashboard')
                ? 'bg-sky-50 text-sky-700 border border-sky-100/80'
                : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard
              className={`w-4 h-4 mr-3 stroke-[2] ${
                isItemActive('dashboard') ? 'text-sky-600' : 'text-slate-400'
              }`}
            />
            <span>Dashboard</span>
          </button>

          {/* AI Medical Assistant */}
          <button
            onClick={() => handleNavClick('ai-assistant')}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isItemActive('ai-assistant')
                ? 'bg-sky-50 text-sky-700 border border-sky-100/80'
                : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
            }`}
          >
            <Bot
              className={`w-4 h-4 mr-3 stroke-[2] ${
                isItemActive('ai-assistant') ? 'text-sky-600' : 'text-slate-400'
              }`}
            />
            <span>AI Medical Assistant</span>
          </button>

          {/* Adaptive Health Assessment */}
          <button
            onClick={() => handleNavClick('adaptive-assessment')}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isItemActive('adaptive-assessment')
                ? 'bg-sky-50 text-sky-700 border border-sky-100/80'
                : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
            }`}
          >
            <ClipboardCheck
              className={`w-4 h-4 mr-3 stroke-[2] ${
                isItemActive('adaptive-assessment') ? 'text-sky-600' : 'text-slate-400'
              }`}
            />
            <span>Adaptive Assessment</span>
          </button>

          {/* Personalised Health Profile (Expandable) */}
          <div className="pt-1">
            <button
              onClick={handleParentProfileClick}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isProfileSubpage
                  ? 'text-sky-800 bg-sky-50/50'
                  : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center">
                <UserCheck
                  className={`w-4 h-4 mr-3 stroke-[2] ${
                    isProfileSubpage ? 'text-sky-600' : 'text-slate-400'
                  }`}
                />
                <span className="text-left">Personalised Health Profile</span>
              </div>
              <div
                className="p-0.5 rounded text-slate-400 hover:text-slate-600"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsProfileExpanded((p) => !p);
                }}
              >
                {isProfileExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </div>
            </button>

            {/* Submenu */}
            {isProfileExpanded && (
              <div className="mt-1 ml-4 pl-3 border-l border-slate-200/80 space-y-0.5">
                {/* 1. Personal Health Information */}
                <button
                  onClick={() => handleNavClick('health-profile-info')}
                  className={`w-full flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isItemActive('health-profile-info')
                      ? 'bg-sky-50 text-sky-700 font-semibold'
                      : 'text-slate-500 hover:bg-slate-100/60 hover:text-slate-800'
                  }`}
                >
                  <FileText
                    className={`w-3.5 h-3.5 mr-2 ${
                      isItemActive('health-profile-info') ? 'text-sky-600' : 'text-slate-400'
                    }`}
                  />
                  <span>Personal Health Information</span>
                </button>

                {/* 2. Predictive Analytics */}
                <button
                  onClick={() => handleNavClick('health-profile-analytics')}
                  className={`w-full flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isItemActive('health-profile-analytics')
                      ? 'bg-sky-50 text-sky-700 font-semibold'
                      : 'text-slate-500 hover:bg-slate-100/60 hover:text-slate-800'
                  }`}
                >
                  <TrendingUp
                    className={`w-3.5 h-3.5 mr-2 ${
                      isItemActive('health-profile-analytics') ? 'text-sky-600' : 'text-slate-400'
                    }`}
                  />
                  <span>Predictive Analytics</span>
                </button>

                {/* 3. Health Recommendations */}
                <button
                  onClick={() => handleNavClick('health-profile-recommendations')}
                  className={`w-full flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isItemActive('health-profile-recommendations')
                      ? 'bg-sky-50 text-sky-700 font-semibold'
                      : 'text-slate-500 hover:bg-slate-100/60 hover:text-slate-800'
                  }`}
                >
                  <ShieldCheck
                    className={`w-3.5 h-3.5 mr-2 ${
                      isItemActive('health-profile-recommendations') ? 'text-sky-600' : 'text-slate-400'
                    }`}
                  />
                  <span>Health Recommendations</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Bottom Section: Settings & Astronaut Profile */}
        <div className="p-3 border-t border-slate-200/70 space-y-2">
          {/* Settings */}
          <button
            onClick={() => handleNavClick('settings')}
            className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isItemActive('settings')
                ? 'bg-sky-50 text-sky-700 border border-sky-100/80'
                : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
            }`}
          >
            <Settings
              className={`w-4 h-4 mr-3 stroke-[2] ${
                isItemActive('settings') ? 'text-sky-600' : 'text-slate-400'
              }`}
            />
            <span>Settings</span>
          </button>

          {/* Astronaut Profile Card */}
          <div className="pt-2">
            <button
              onClick={() => handleNavClick('health-profile-info')}
              className="w-full flex items-center p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors text-left"
            >
              <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                <img
                  src={astronaut.avatarUrl}
                  alt={astronaut.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="text-xs font-semibold text-slate-600 uppercase">AM</span>
                <span
                  className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"
                  title="Biometrics Nominal"
                />
              </div>
              <div className="ml-2.5 min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-800 truncate">{astronaut.name}</div>
                <div className="text-[11px] text-slate-500 truncate flex items-center">
                  <span>{astronaut.role.split('&')[0]}</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// ============================================================================
// 5. TOP HEADER COMPONENT
// ============================================================================

interface HeaderProps {
  currentPageTitle: string;
  astronaut: AstronautProfile;
  notifications: NotificationItem[];
  onOpenMobileMenu: () => void;
  onNavigateToSettings: () => void;
  onNavigateToProfile: () => void;
}

export function Header({
  currentPageTitle,
  astronaut,
  notifications,
  onOpenMobileMenu,
  onNavigateToSettings,
  onNavigateToProfile,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">{currentPageTitle}</h1>
        </div>
      </div>

      {/* Right: Mission Badges, Notifications, Avatar */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Mission Badges */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <Badge variant="neutral" size="md">
            {astronaut.mission}
          </Badge>
          <Badge variant="blue" size="md">
            {astronaut.missionDay}
          </Badge>
        </div>

        <div className="h-5 w-px bg-slate-200" />

        {/* Notification Bell */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 stroke-[2]" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Popover */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-92 bg-white rounded-xl border border-slate-200 shadow-card py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-800">Mission Health Alerts</div>
                <Badge variant="blue" size="sm">
                  {unreadCount} unread
                </Badge>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`px-4 py-3 text-left transition-colors hover:bg-slate-50/80 ${
                      item.unread ? 'bg-sky-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="text-xs font-medium text-slate-800">{item.title}</div>
                      <span className="text-[10px] text-slate-400 ml-2 whitespace-nowrap">{item.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>

              <div className="px-4 py-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    onNavigateToSettings();
                  }}
                  className="text-[11px] font-medium text-sky-600 hover:text-sky-800"
                >
                  Manage alert preferences in Settings →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Astronaut Avatar button */}
        <button
          onClick={onNavigateToProfile}
          className="flex items-center space-x-2 pl-1 rounded-lg hover:opacity-90 transition-opacity"
          title={`${astronaut.name} (${astronaut.astronautId})`}
        >
          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-slate-100 border border-slate-200/80 flex items-center justify-center">
            <img
              src={astronaut.avatarUrl}
              alt={astronaut.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-xs font-medium text-slate-600 uppercase">AM</span>
          </div>
        </button>
      </div>
    </header>
  );
}
