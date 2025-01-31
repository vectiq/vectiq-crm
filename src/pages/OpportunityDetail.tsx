import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOpportunities } from '@/lib/hooks/useOpportunities';
import { useUsers } from '@/lib/hooks/useUsers';
import { useLeads } from '@/lib/hooks/useLeads';
import { useClients } from '@/lib/hooks/useClients';
import { useCandidates } from '@/lib/hooks/useCandidates';
import { useInteractions } from '@/lib/hooks/useInteractions';
import { cn } from '@/lib/utils/styles';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/Select';
import { InteractionTimeline } from '@/components/interactions/InteractionTimeline';
import { InteractionDialog } from '@/components/interactions/InteractionDialog';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { CandidatesTable } from '@/components/candidates/CandidatesTable';
import { CandidateDialog } from '@/components/candidates/CandidateDialog';
import { ArrowLeft, Building2, Target, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import type { Opportunity, OpportunityStage, InteractionType } from '@/types';

type TabType = 'details' | 'interactions' | 'candidates';

const stages: { value: OpportunityStage; label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' }[] = [
  { value: 'discovery', label: 'Discovery', variant: 'secondary' },
  { value: 'proposal', label: 'Proposal', variant: 'warning' },
  { value: 'negotiation', label: 'Negotiation', variant: 'warning' },
  { value: 'closed_won', label: 'Closed (Won)', variant: 'success' },
  { value: 'closed_lost', label: 'Closed (Lost)', variant: 'destructive' }
];

const products = [
  'IT Consulting',
  'Software Development',
  'Cloud Migration',
  'Security Assessment',
  'Network Infrastructure',
  'Managed Services'
];

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const { opportunities, updateOpportunity } = useOpportunities();
  const { users, currentUser } = useUsers();
  const { leads } = useLeads();
  const { clients } = useClients();
  const { candidates, createCandidate, updateCandidate, deleteCandidate } = useCandidates({ opportunityId: id });
  const [isInteractionDialogOpen, setIsInteractionDialogOpen] = useState(false);
  const [isCandidateDialogOpen, setIsCandidateDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const { interactions, createInteraction } = useInteractions({ opportunityId: id });
  const [formData, setFormData] = useState({
    title: '',
    value: 0,
    stage: 'discovery' as OpportunityStage,
    probability: 0,
    expectedCloseDate: '',
    assignedTo: '',
    leadId: '',
    clientId: '',
    products: [] as string[],
    notes: ''
  });

  const opportunity = opportunities.find(o => o.id === id);

  useEffect(() => {
    if (opportunity) {
      setFormData({
        title: opportunity.title,
        value: opportunity.value,
        stage: opportunity.stage,
        probability: opportunity.probability,
        expectedCloseDate: opportunity.expectedCloseDate,
        assignedTo: opportunity.assignedTo || '',
        leadId: opportunity.leadId || '',
        clientId: opportunity.clientId || '',
        products: opportunity.products || [],
        notes: opportunity.notes || ''
      });
    }
  }, [opportunity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    try {
      await updateOpportunity(id, formData);
    } catch (error) {
      console.error('Error saving opportunity:', error);
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
      opportunityId: id,
    });
  };

  if (!opportunity) {
    return <LoadingScreen />;
  }

  const stage = stages.find(s => s.value === opportunity.stage);
  const assignedUser = users.find(u => u.id === opportunity.assignedTo);
  const lead = leads.find(l => l.id === opportunity.leadId);
  const client = clients.find(c => c.id === opportunity.clientId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => navigate('/opportunities')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Opportunities
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{opportunity.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={stage?.variant}>
                {stage?.label}
              </Badge>
              <Badge variant="secondary">
                {formatCurrency(opportunity.value)}
              </Badge>
              <Badge variant="secondary">
                {opportunity.probability}% Probability
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'details', name: 'Details' },
            { id: 'interactions', name: 'Interactions' },
            { id: 'candidates', name: 'Candidates' }
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

      <div className="space-y-6">
        <div className={cn(
          "grid grid-cols-3 gap-6",
          activeTab !== 'details' && 'hidden'
        )}>
          <div className="col-span-2">
            <Card>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <FormField label="Title">
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Value">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) }))}
                      required
                    />
                  </FormField>

                  <FormField label="Probability">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.probability}
                      onChange={(e) => setFormData(prev => ({ ...prev, probability: parseInt(e.target.value) }))}
                      required
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Stage">
                    <Select
                      value={formData.stage}
                      onValueChange={(value: OpportunityStage) => setFormData(prev => ({ ...prev, stage: value }))}
                    >
                      <SelectTrigger>
                        {stages.find(s => s.value === formData.stage)?.label || 'Select Stage'}
                      </SelectTrigger>
                      <SelectContent>
                        {stages.map(stage => (
                          <SelectItem key={stage.value} value={stage.value}>
                            {stage.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Expected Close Date">
                    <Input
                      type="date"
                      value={formData.expectedCloseDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, expectedCloseDate: e.target.value }))}
                      required
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Lead">
                    <Select
                      value={formData.leadId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, leadId: value, clientId: '' }))}
                    >
                      <SelectTrigger>
                        {leads.find(l => l.id === formData.leadId)?.companyName || 'Select Lead'}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Lead</SelectItem>
                        {leads.map(lead => (
                          <SelectItem key={lead.id} value={lead.id}>
                            {lead.companyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Client">
                    <Select
                      value={formData.clientId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value, leadId: '' }))}
                    >
                      <SelectTrigger>
                        {clients.find(c => c.id === formData.clientId)?.name || 'Select Client'}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Client</SelectItem>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>

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

                <FormField label="Products">
                  <div className="space-y-2">
                    {products.map(product => (
                      <label key={product} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.products.includes(product)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                products: [...prev.products, product]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                products: prev.products.filter(p => p !== product)
                              }));
                            }
                          }}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">{product}</span>
                      </label>
                    ))}
                  </div>
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
          </div>

          <div className={cn(
          "col-span-1",
          activeTab !== 'details' && 'hidden'
        )}>
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {opportunity.stage === 'discovery' && (
                <Button className="w-full justify-start" variant="secondary">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Create Proposal
                </Button>
              )}
              {opportunity.stage === 'closed_won' && !opportunity.clientId && (
                <Button className="w-full justify-start" variant="secondary">
                  <Building2 className="h-4 w-4 mr-2" />
                  Convert to Client
                </Button>
              )}
            </div>
          </Card>

          {lead && (
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Lead Details</h3>
              <div className="space-y-2">
                <div>
                  <div className="text-sm text-gray-500">Company</div>
                  <div className="font-medium">{lead.companyName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Contact</div>
                  <div className="font-medium">{lead.contactName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-medium">{lead.email}</div>
                </div>
                {lead.phone && (
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="font-medium">{lead.phone}</div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {client && (
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Client Details</h3>
              <div className="space-y-2">
                <div>
                  <div className="text-sm text-gray-500">Company</div>
                  <div className="font-medium">{client.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-medium">{client.email}</div>
                </div>
              </div>
            </Card>
          )}
          </div>
        </div>

        <div className={cn(
          activeTab !== 'interactions' && 'hidden'
        )}>
          <Card className="p-6">
            <InteractionTimeline
              interactions={interactions}
              onAddInteraction={() => setIsInteractionDialogOpen(true)}
            />
          </Card>
        </div>

        <div className={cn(
          activeTab !== 'candidates' && 'hidden'
        )}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Candidates</h2>
              <Button onClick={() => setIsCandidateDialogOpen(true)}>
                Add Candidate
              </Button>
            </div>
            <CandidatesTable
              candidates={candidates}
              onEdit={(candidate) => {
                setSelectedCandidate(candidate);
                setIsCandidateDialogOpen(true);
              }}
              onDelete={deleteCandidate}
            />
          </Card>
        </div>
      </div>

      <InteractionDialog
        open={isInteractionDialogOpen}
        onOpenChange={setIsInteractionDialogOpen}
        onSubmit={handleAddInteraction}
      />
      
      <CandidateDialog
        open={isCandidateDialogOpen}
        onOpenChange={setIsCandidateDialogOpen}
        candidate={selectedCandidate}
        opportunityId={id}
        onSubmit={async (data) => {
          if (selectedCandidate) {
            await updateCandidate(selectedCandidate.id, data);
          } else {
            await createCandidate(data);
          }
          setIsCandidateDialogOpen(false);
          setSelectedCandidate(null);
        }}
      />
    </div>
  );
}