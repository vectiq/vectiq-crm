import { Clock, Building2, FolderKanban, BarChart2, TrendingUp, UserCircle, Settings, FileCheck, CalendarDays, HelpCircle, Users, DollarSign } from 'lucide-react';

export const navigationItems = [
  { name: 'Clients', href: '/clients', icon: Building2, roles: ['admin'] },
  { name: 'Users', href: '/users', icon: UserCircle, roles: ['admin'] },
  { name: 'Teams', href: '/teams', icon: Users, roles: ['admin'] },
  { name: 'Admin', href: '/admin', icon: Settings, roles: ['admin'] },
] as const;