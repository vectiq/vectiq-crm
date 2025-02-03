import { Building2, UserCircle, Settings, Users, Target, Briefcase, UserPlus } from 'lucide-react';

export const navigationItems = [
  { name: 'Leads', href: '/leads', icon: Target, roles: ['admin'] },
  { name: 'Opportunities', href: '/opportunities', icon: Briefcase, roles: ['admin'] },
  { name: 'Candidates', href: '/candidates', icon: UserPlus, roles: ['admin'] },
] as const;