import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCandidates } from '@/lib/hooks/useCandidates';
import { useUsers } from '@/lib/hooks/useUsers';
import { useInteractions } from '@/lib/hooks/useInteractions';
import { useOpportunities } from '@/lib/hooks/useOpportunities';
import { cn } from '@/lib/utils/styles';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/Select';
import { TagInput } from '@/components/ui/TagInput';
import { InteractionTimeline } from '@/components/interactions/InteractionTimeline';
import { InteractionDialog } from '@/components/interactions/InteractionDialog';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { AttachmentUpload } from '@/components/ui/AttachmentUpload';
import { ArrowLeft, UserPlus, Briefcase, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils/currency';
import type { Candidate, CandidateStatus, InteractionType } from '@/types';

type TabType = 'details' | 'interactions';

const stages = [
  { value: 'discovery', label: 'Discovery', variant: 'secondary' },
  { value: 'proposal', label: 'Proposal', variant: 'warning' },
  { value: 'negotiation', label: 'Negotiation', variant: 'warning' },
  { value: 'closed_won', label: 'Closed (Won)', variant: 'success' },
  { value: 'closed_lost', label: 'Closed (Lost)', variant: 'destructive' }
] as const;

const candidateStatuses: { value: CandidateStatus; label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' }[] = [
  { value: 'new', label: 'New', variant: 'secondary' },
  { value: 'screening', label: 'Screening', variant: 'warning' },
  { value: 'interviewing', label: 'Interviewing', variant: 'warning' },
  { value: 'offered', label: 'Offered', variant: 'success' },
  { value: 'accepted', label: 'Accepted', variant: 'success' },
  { value: 'rejected', label: 'Rejected', variant: 'destructive' },
  { value: 'withdrawn', label: 'Withdrawn', variant: 'destructive' }
];

const commonSkills = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Python',
  'Java',
  'C#',
  'AWS',
  'Azure',
  'DevOps',
  'Agile',
  'Project Management'
];

export default function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const { candidates, updateCandidate } = useCandidates();
  const { users, currentUser } = useUsers();
  const { opportunities } = useOpportunities();
  const [isInteractionDialogOpen, setIsInteractionDialogOpen] = useState(false);
  const { interactions, createInteraction } = useInteractions({ 
    candidateId: id // This will filter interactions to only those with this candidateId
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'new' as CandidateStatus,
    currentRole: '',
    currentCompany: '',
    expectedSalary: undefined as number | undefined,
    noticePeriod: '',
    resumeUrl: '',
    skills: [] as string[],
    notes: '',
    assignedTo: '',
    opportunityId: null as string | null
  });

  const candidate = candidates.find(c => c.id === id);
  const opportunity = opportunities.find(o => o.id === candidate?.opportunityId);

  useEffect(() => {
    if (candidate) {
      setFormData({
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone || '',
        status: candidate.status,
        currentRole: candidate.currentRole || '',
        currentCompany: candidate.currentCompany || '',
        expectedSalary: candidate.expectedSalary,
        noticePeriod: candidate.noticePeriod || '',
        resumeUrl: candidate.resumeUrl || '',
        skills: candidate.skills || [],
        notes: candidate.notes || '',
        assignedTo: candidate.assignedTo || '',
        opportunityId: candidate.opportunityId || null
      });
    }
  }, [candidate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    try {
      await updateCandidate(id, formData);
    } catch (error) {
      console.error('Error saving candidate:', error);
    }
  };

  const handleAddInteraction = async (data: {
    type: InteractionType;
    title: string;
    description: string;
    date: string;
  }) => {
    if (!id || !currentUser) return;
    
    await createInteraction({
      ...data,
      userId: currentUser.id,
      candidateId: id,
    });
  };

  if (!candidate) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => navigate('/candidates')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Candidates
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{candidate.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={candidateStatuses.find(s => s.value === candidate.status)?.variant}>
                {candidateStatuses.find(s => s.value === candidate.status)?.label}
              </Badge>
              {candidate.currentRole && (
                <Badge variant="secondary">{candidate.currentRole}</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'details', name: 'Details' },
            { id: 'interactions', name: 'Interactions' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className={cn(
          "col-span-2 space-y-6",
          activeTab !== 'details' && 'hidden'
        )}>
          <Card>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <FormField label="Name">
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Email">
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </FormField>

                  <FormField label="Phone">
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Current Role">
                    <Input
                      value={formData.currentRole}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentRole: e.target.value }))}
                    />
                  </FormField>

                  <FormField label="Current Company">
                    <Input
                      value={formData.currentCompany}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentCompany: e.target.value }))}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Expected Salary">
                    <Input
                      type="number"
                      value={formData.expectedSalary || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        expectedSalary: e.target.value ? Number(e.target.value) : undefined 
                      }))}
                    />
                  </FormField>

                  <FormField label="Notice Period">
                    <Input
                      value={formData.noticePeriod}
                      onChange={(e) => setFormData(prev => ({ ...prev, noticePeriod: e.target.value }))}
                      placeholder="e.g., 2 weeks"
                    />
                  </FormField>
                </div>

                <FormField label="Status">
                  <Select
                    value={formData.status}
                    onValueChange={(value: CandidateStatus) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      {candidateStatuses.find(s => s.value === formData.status)?.label}
                    </SelectTrigger>
                    <SelectContent>
                      {candidateStatuses.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Resume URL">
                  <Input
                    type="url"
                    value={formData.resumeUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, resumeUrl: e.target.value }))}
                  />
                </FormField>

                <FormField label="Skills">
                  <TagInput
                    value={formData.skills}
                    onChange={(skills) => setFormData(prev => ({ ...prev, skills }))}
                    suggestions={commonSkills}
                    placeholder="Add skills..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Type custom skills or select from suggestions
                  </p>
                </FormField>

                <FormField label="Assigned To">
                  <Select
                    value={formData.assignedTo}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value }))}
                  >
                    <SelectTrigger>
                      {users.find(u => u.id === formData.assignedTo)?.name || 'Select User'}
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Notes">
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={4}
                  />
                </FormField>
              </div>

              <div className="flex justify-end">
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-6">
            <FormField label="Attachments">
              <AttachmentUpload
                entityType="candidates"
                entityId={id}
                attachments={candidate.attachments}
                uploadedBy={currentUser.id}
                onUpload={(attachment) => {
                  updateCandidate(id, {
                    attachments: [...(candidate.attachments || []), attachment]
                  });
                }}
                onDelete={(attachment) => {
                  updateCandidate(id, {
                    attachments: candidate.attachments?.filter(a => a.id !== attachment.id) || []
                  });
                }}
              />
            </FormField>
          </Card>

        </div>

        <div className={cn(
          activeTab !== 'interactions' && 'hidden',
          'col-span-2'
        )}>
          <Card className="p-6">
            <InteractionTimeline
              interactions={interactions}
              onAddInteraction={() => setIsInteractionDialogOpen(true)}
            />
          </Card>
        </div>

        <div className={cn(
          "space-y-6",
          activeTab !== 'details' && 'hidden'
        )}>
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {!candidate.opportunityId && (
                <Button className="w-full justify-start" variant="secondary">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Associate with Opportunity
                </Button>
              )}
              {candidate.resumeUrl && (
                <Button 
                  className="w-full justify-start" 
                  variant="secondary"
                  onClick={() => window.open(candidate.resumeUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Resume
                </Button>
              )}
            </div>
          </Card>

          {opportunity && (
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Opportunity Details</h3>
              <div className="space-y-2">
                <div>
                  <div className="text-sm text-gray-500">Title</div>
                  <div className="font-medium">{opportunity.title}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Stage</div>
                  <Badge variant={stages.find(s => s.value === opportunity.stage)?.variant}>
                    {stages.find(s => s.value === opportunity.stage)?.label}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Value</div>
                  <div className="font-medium">{formatCurrency(opportunity.value)}</div>
                </div>
                <div className="pt-2">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => navigate(`/opportunities/${opportunity.id}`)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Opportunity
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      <InteractionDialog
        open={isInteractionDialogOpen}
        onOpenChange={setIsInteractionDialogOpen}
        onSubmit={handleAddInteraction}
      />
    </div>
  );
}