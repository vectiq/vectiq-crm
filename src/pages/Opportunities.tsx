import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOpportunities } from '@/lib/hooks/useOpportunities';
import { useUsers } from '@/lib/hooks/useUsers';
import { useLeads } from '@/lib/hooks/useLeads';
import { useClients } from '@/lib/hooks/useClients';
import { useInteractions } from '@/lib/hooks/useInteractions';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, Th, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { SlidePanel } from '@/components/ui/SlidePanel';
import { InteractionTimeline } from '@/components/interactions/InteractionTimeline';
import { InteractionDialog } from '@/components/interactions/InteractionDialog';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/Select';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Plus, Briefcase, Edit, Trash2, Building2, Target } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils/currency';
import type { Opportunity, OpportunityStage, InteractionType } from '@/types';

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

export default function Opportunities() {
  const navigate = useNavigate();
  const { opportunities, isLoading, createOpportunity, updateOpportunity, deleteOpportunity } = useOpportunities();
  const { users } = useUsers();
  const { leads } = useLeads();
  const { clients } = useClients();
  const { currentUser } = useUsers();
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isInteractionDialogOpen, setIsInteractionDialogOpen] = useState(false);
  const { interactions, createInteraction } = useInteractions({ 
    opportunityId: selectedOpportunity?.id 
  });
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

  const handleOpenCreateDialog = useCallback(() => {
    setSelectedOpportunity(null);
    setFormData({
      title: '',
      value: 0,
      stage: 'discovery',
      probability: 20,
      expectedCloseDate: '',
      assignedTo: 'none',
      leadId: 'none',
      clientId: 'none',
      products: [],
      notes: ''
    });
    setIsDialogOpen(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clean up form data before saving
    const cleanData = {
      ...formData,
      assignedTo: formData.assignedTo === 'none' ? null : formData.assignedTo,
      leadId: formData.leadId === 'none' ? null : formData.leadId,
      clientId: formData.clientId === 'none' ? null : formData.clientId
    };
    
    try {
      if (selectedOpportunity) {
        await updateOpportunity(selectedOpportunity.id, cleanData);
      } else {
        await createOpportunity(cleanData);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving opportunity:', error);
    }
  };

  const handleEdit = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setFormData({
      title: opportunity.title,
      value: opportunity.value,
      stage: opportunity.stage,
      probability: opportunity.probability,
      expectedCloseDate: opportunity.expectedCloseDate,
      assignedTo: opportunity.assignedTo || 'none',
      leadId: opportunity.leadId || 'none',
      clientId: opportunity.clientId || 'none',
      products: opportunity.products || [],
      notes: opportunity.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleAddInteraction = async (data: {
    type: InteractionType;
    title: string;
    description: string;
    date: string;
  }) => {
    if (!selectedOpportunity || !currentUser) return;
    
    await createInteraction({
      ...data,
      userId: currentUser.id,
      opportunityId: selectedOpportunity.id,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this opportunity?')) {
      await deleteOpportunity(id);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Opportunities</h1>
        <Button onClick={handleOpenCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          New Opportunity
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <tr>
              <Th>Title</Th>
              <Th>Value</Th>
              <Th>Stage</Th>
              <Th>Probability</Th>
              <Th>Source</Th>
              <Th>Assigned To</Th>
              <Th>Expected Close</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </TableHeader>
          <TableBody>
            {opportunities.map((opportunity) => {
              const stage = stages.find(s => s.value === opportunity.stage);
              const assignedUser = users.find(u => u.id === opportunity.assignedTo);
              const lead = leads.find(l => l.id === opportunity.leadId);
              const client = clients.find(c => c.id === opportunity.clientId);
              
              return (
                <tr 
                  key={opportunity.id} 
                  className="group hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/opportunities/${opportunity.id}`)}
                >
                  <Td className="font-medium">{opportunity.title}</Td>
                  <Td>{formatCurrency(opportunity.value)}</Td>
                  <Td>
                    <Badge variant={stage?.variant || 'default'}>
                      {stage?.label || opportunity.stage}
                    </Badge>
                  </Td>
                  <Td>{opportunity.probability}%</Td>
                  <Td>
                    {lead ? (
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-indigo-500" />
                        {lead.companyName}
                      </div>
                    ) : client ? (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-emerald-500" />
                        {client.name}
                      </div>
                    ) : null}
                  </Td>
                  <Td>
                    {assignedUser ? (
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {assignedUser.name[0]}
                          </span>
                        </div>
                        <span>{assignedUser.name}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Unassigned</span>
                    )}
                   </Td>
                  <Td>
                    {opportunity.expectedCloseDate ? 
                      format(new Date(opportunity.expectedCloseDate), 'MMM d, yyyy') :
                      'N/A'
                    }
                  </Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" size="sm" onClick={() => handleEdit(opportunity)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="sm" onClick={(event) => {event.stopPropagation(); handleDelete(opportunity.id);}}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <SlidePanel
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={selectedOpportunity ? selectedOpportunity.title : 'New Opportunity'}
        icon={<Briefcase className="h-5 w-5 text-indigo-500" />}
        subtitle={selectedOpportunity && (
          <span className="flex items-center gap-2 mt-2">
            <Badge variant={stages.find(s => s.value === selectedOpportunity.stage)?.variant || 'default'}>
              {stages.find(s => s.value === selectedOpportunity.stage)?.label}
            </Badge>
            <Badge variant="secondary">{formatCurrency(selectedOpportunity.value)}</Badge>
            <Badge variant="secondary">{selectedOpportunity.probability}% Probability</Badge>
          </span>
        )}
      >
        <div className="divide-y divide-gray-200">
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
                  <SelectItem value="none">Unassigned</SelectItem>
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

          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {selectedOpportunity ? 'Update' : 'Create'} Opportunity
            </Button>
          </div>
        </form>
        
        {selectedOpportunity && (
          <div className="p-6">
            <InteractionTimeline
              interactions={interactions}
              onAddInteraction={() => setIsInteractionDialogOpen(true)}
            />
          </div>
        )}
        </div>
      </SlidePanel>
      
      <InteractionDialog
        open={isInteractionDialogOpen}
        onOpenChange={setIsInteractionDialogOpen}
        onSubmit={handleAddInteraction}
      />
    </div>
  );
}