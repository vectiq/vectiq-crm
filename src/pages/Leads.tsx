import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '@/lib/hooks/useLeads';
import { useUsers } from '@/lib/hooks/useUsers';
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
import { Plus, Target, Edit, Trash2, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';
import type { Lead, LeadStatus, InteractionType } from '@/types';

const leadSources = [
  'Website',
  'Referral',
  'Cold Call',
  'LinkedIn',
  'Conference',
  'Other'
];

const leadStatuses: { value: LeadStatus; label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' }[] = [
  { value: 'new', label: 'New', variant: 'secondary' },
  { value: 'contacted', label: 'Contacted', variant: 'warning' },
  { value: 'qualified', label: 'Qualified', variant: 'success' },
  { value: 'unqualified', label: 'Unqualified', variant: 'destructive' }
];

export default function Leads() {
  const navigate = useNavigate();
  const { leads, isLoading, createLead, updateLead, deleteLead } = useLeads();
  const { users } = useUsers();
  const { currentUser } = useUsers();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isInteractionDialogOpen, setIsInteractionDialogOpen] = useState(false);
  const { interactions, createInteraction } = useInteractions({ 
    leadId: selectedLead?.id 
  });
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    status: 'new' as LeadStatus,
    source: '',
    notes: '',
    assignedTo: ''
  });

  const handleOpenCreateDialog = useCallback(() => {
    setSelectedLead(null);
    setFormData({
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      status: 'new',
      source: '',
      notes: '',
      assignedTo: ''
    });
    setIsDialogOpen(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (selectedLead) {
        await updateLead(selectedLead.id, formData);
      } else {
        await createLead(formData);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving lead:', error);
    }
  };

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setFormData({
      companyName: lead.companyName,
      contactName: lead.contactName,
      email: lead.email,
      phone: lead.phone || '',
      status: lead.status,
      source: lead.source,
      notes: lead.notes || '',
      assignedTo: lead.assignedTo || ''
    });
    setIsDialogOpen(true);
  };

  const handleAddInteraction = async (data: {
    type: InteractionType;
    title: string;
    description: string;
    date: string;
  }) => {
    if (!selectedLead || !currentUser) return;
    
    await createInteraction({
      ...data,
      userId: currentUser.id,
      leadId: selectedLead.id,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      await deleteLead(id);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
        <Button onClick={handleOpenCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          New Lead
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <tr>
              <Th>Company</Th>
              <Th>Contact</Th>
              <Th>Status</Th>
              <Th>Source</Th>
              <Th>Assigned To</Th>
              <Th>Created</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => {
              const status = leadStatuses.find(s => s.value === lead.status);
              const assignedUser = users.find(u => u.id === lead.assignedTo);
              
              return (
                <tr 
                  key={lead.id} 
                  className="group hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/leads/${lead.id}`)}
                >
                  <Td className="font-medium">{lead.companyName}</Td>
                  <Td>
                    <div>
                      <div className="font-medium">{lead.contactName}</div>
                      <div className="text-sm text-gray-500 space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <Badge variant={status?.variant || 'default'}>
                      {status?.label || lead.status}
                    </Badge>
                  </Td>
                  <Td>{lead.source}</Td>
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
                    {lead.createdAt?.toDate ? 
                      format(lead.createdAt.toDate(), 'MMM d, yyyy') :
                      'N/A'
                    }
                  </Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" size="sm" onClick={() => handleEdit(lead)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleDelete(lead.id)}>
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
        title={selectedLead ? `Edit ${selectedLead.companyName}` : 'New Lead'}
        icon={<Target className="h-5 w-5 text-indigo-500" />}
        subtitle={selectedLead && (
          <span className="flex items-center gap-2 mt-2">
            <Badge variant={leadStatuses.find(s => s.value === selectedLead.status)?.variant || 'default'}>
              {leadStatuses.find(s => s.value === selectedLead.status)?.label}
            </Badge>
            {selectedLead.source && (
              <Badge variant="secondary">{selectedLead.source}</Badge>
            )}
          </span>
        )}
      >
        <div className="divide-y divide-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <FormField label="Company Name">
              <Input
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                required
              />
            </FormField>

            <FormField label="Contact Name">
              <Input
                value={formData.contactName}
                onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
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
              <FormField label="Status">
                <Select
                  value={formData.status}
                  onValueChange={(value: LeadStatus) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    {leadStatuses.find(s => s.value === formData.status)?.label || 'Select Status'}
                  </SelectTrigger>
                  <SelectContent>
                    {leadStatuses.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Source">
                <Select
                  value={formData.source}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}
                >
                  <SelectTrigger>
                    {formData.source || 'Select Source'}
                  </SelectTrigger>
                  <SelectContent>
                    {leadSources.map(source => (
                      <SelectItem key={source} value={source}>
                        {source}
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
              {selectedLead ? 'Update' : 'Create'} Lead
            </Button>
          </div>
        </form>
        
        {selectedLead && (
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