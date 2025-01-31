export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  teamId?: string;
  employeeType: 'employee' | 'contractor' | 'company';
  hoursPerWeek: number;
  overtime: 'no' | 'eligible' | 'all';
  xeroEmployeeId?: string;
  salary?: SalaryItem[];
  costRate?: CostRate[];
  projectAssignments?: ProjectAssignment[];
  createdAt?: any;
  updatedAt?: any;
}

export interface Team {
  id: string;
  name: string;
  managerId: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Bonus {
  id: string;
  employeeId: string;
  teamId?: string;
  date: string;
  kpis?: string;
  amount: number;
  paid: boolean;
  xeroPayRunId?: string;
  xeroPayItemId?: string;
  paidAt?: any;
  createdAt?: any;
  updatedAt?: any;
}

// Add XeroPayItem type if not already present
export interface XeroPayItem {
  id: string;
  EarningsRateID: string;
  Name: string;
  EarningsType: string;
  RateType: string;
  AccountCode: string;
  TypeOfUnits: string;
  IsExemptFromTax: boolean;
  IsExemptFromSuper: boolean;
  IsReportableAsW1: boolean;
  UpdatedDateUTC: string;
  CurrentRecord: boolean;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  xeroContactId?: string;
  purchaseOrderNumber?: string;
  xeroProjectId?: string;
  budget: number;
  startDate: string;
  endDate: string;
  approverEmail: string;
  requiresApproval: boolean;
  overtimeInclusive: boolean;
  isActive: boolean;
  tasks: ProjectTask[];
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified';

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: any;
}

export interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  status: LeadStatus;
  source: string;
  notes?: string;
  assignedTo?: string;
  lastContactedAt?: string;
  attachments?: Attachment[];
  createdAt: any;
  updatedAt: any;
}

export type OpportunityStage = 'discovery' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface Opportunity {
  id: string;
  leadId?: string;
  clientId?: string;
  title: string;
  value: number;
  stage: OpportunityStage;
  probability: number;
  expectedCloseDate: string;
  assignedTo?: string;
  products?: string[];
  notes?: string;
  attachments?: Attachment[];
  createdAt: any;
  updatedAt: any;
}

export type InteractionType = 'email' | 'call' | 'meeting' | 'note';

export interface Interaction {
  id: string;
  type: InteractionType;
  title: string;
  description: string;
  date: string;
  userId: string;
  leadId?: string;
  opportunityId?: string;
  candidateId?: string;
  notes?: string;
  opportunityId?: string;
  assignedTo?: string;
  attachments?: Attachment[];
  createdAt: any;
  updatedAt: any;
}

export type CandidateStatus = 'new' | 'screening' | 'interviewing' | 'offered' | 'accepted' | 'rejected' | 'withdrawn';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: CandidateStatus;
  currentRole?: string;
  currentCompany?: string;
  expectedSalary?: number;
  noticePeriod?: string;
  resumeUrl?: string;
  skills: string[];
  notes?: string;
  opportunityId?: string;
  assignedTo?: string;
  attachments?: Attachment[];
  createdAt: any;
  updatedAt: any;
}