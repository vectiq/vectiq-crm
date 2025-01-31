import { Building2, UserCircle, Settings, Users, Target, Briefcase, UserPlus } from 'lucide-react';

export const navigationItems = [
  { name: 'Leads', href: '/leads', icon: Target, roles: ['admin'] },
  { name: 'Opportunities', href: '/opportunities', icon: Briefcase, roles: ['admin'] },
  { name: 'Candidates', href: '/candidates', icon: UserPlus, roles: ['admin'] },
  { name: 'Clients', href: '/clients', icon: Building2, roles: ['admin'] },
  { name: 'Users', href: '/users', icon: UserCircle, roles: ['admin'] },
  { name: 'Teams', href: '/teams', icon: Users, roles: ['admin'] },
  { name: 'Admin', href: '/admin', icon: Settings, roles: ['admin'] },
] as const;