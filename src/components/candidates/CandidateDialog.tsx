import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { SlidePanel } from '@/components/ui/SlidePanel';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/Select';
import { TagInput } from '@/components/ui/TagInput';
import { UserPlus } from 'lucide-react';
import { useUsers } from '@/lib/hooks/useUsers'; 
import { useCandidates } from '@/lib/hooks/useCandidates';
import type { Candidate, CandidateStatus } from '@/types';

const candidateStatuses: { value: CandidateStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'screening', label: 'Screening' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offered', label: 'Offered' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' }
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

interface CandidateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate?: Candidate | null;
  opportunityId?: string;
  onSubmit: (data: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export function CandidateDialog({
  open,
  onOpenChange,
  candidate,
  opportunityId,
  onSubmit,
}: CandidateDialogProps) {
  const { users } = useUsers();
  const { candidates: existingCandidates } = useCandidates();
  const [isExistingCandidate, setIsExistingCandidate] = useState(false);
  const [selectedExistingCandidate, setSelectedExistingCandidate] = useState<string>('');
  const { register, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: candidate || {
      name: '',
      email: '',
      phone: '',
      status: 'new' as CandidateStatus,
      currentRole: '',
      currentCompany: '',
      expectedSalary: undefined,
      noticePeriod: '',
      resumeUrl: '',
      skills: [],
      notes: '',
      assignedTo: '',
      opportunityId: opportunityId || null
    },
  });

  useEffect(() => {
    if (open) {
      reset(candidate || {
        name: '',
        email: '',
        phone: '',
        status: 'new',
        currentRole: '',
        currentCompany: '',
        expectedSalary: undefined,
        noticePeriod: '',
        resumeUrl: '',
        skills: [],
        notes: '',
        assignedTo: '',
        opportunityId: opportunityId || null
      });
    }
  }, [open, candidate, opportunityId, reset]);

  const handleFormSubmit = async (data: any) => {
    if (isExistingCandidate && selectedExistingCandidate) {
      // Only update the opportunityId for the selected candidate
      await onSubmit({
        id: selectedExistingCandidate,
        opportunityId: opportunityId || null
      });
    } else {
      // For new candidates, submit all form data
      await onSubmit(data);
    }
    onOpenChange(false);
  };

  return (
    <SlidePanel
      open={open}
      onClose={() => onOpenChange(false)}
      title={candidate ? 'Edit Candidate' : isExistingCandidate ? 'Associate Existing Candidate' : 'New Candidate'}
      icon={<UserPlus className="h-5 w-5 text-indigo-500" />}
    >
      {!candidate && (
        <div className="p-6 border-b">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant={!isExistingCandidate ? "primary" : "secondary"}
              onClick={() => setIsExistingCandidate(false)}
            >
              Create New
            </Button>
            <Button
              type="button"
              variant={isExistingCandidate ? "primary" : "secondary"}
              onClick={() => setIsExistingCandidate(true)}
            >
              Use Existing
            </Button>
          </div>
        </div>
      )}

      {isExistingCandidate && !candidate ? (
        <div className="p-6">
          <FormField label="Select Candidate">
            <Select
              value={selectedExistingCandidate}
              onValueChange={(value) => {
                setSelectedExistingCandidate(value);
                const selected = existingCandidates.find(c => c.id === value);
                if (selected) {
                  const { id, createdAt, updatedAt, opportunityId: oldOpportunityId, ...rest } = selected;
                  reset({
                    ...rest,
                    opportunityId: opportunityId || null
                  });
                }
              }}
            >
              <SelectTrigger>
                {existingCandidates.find(c => c.id === selectedExistingCandidate)?.name || 'Select Candidate'}
              </SelectTrigger>
              <SelectContent>
                {existingCandidates
                  .filter(c => !c.opportunityId) // Only show unassigned candidates
                  .map(candidate => (
                    <SelectItem key={candidate.id} value={candidate.id}>
                      {candidate.name} - {candidate.currentRole || 'No role'}
                    </SelectItem>
                  ))}
                  {existingCandidates.filter(c => !c.opportunityId).length === 0 && (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      No available candidates
                    </div>
                  )}
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-gray-500">
              Only showing candidates not currently assigned to any opportunity
            </p>
          </FormField>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!selectedExistingCandidate}
              onClick={handleFormSubmit}
            >
              Associate Candidate
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          <div className="space-y-4">
            <FormField label="Name">
              <Input {...register('name')} required />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Email">
                <Input type="email" {...register('email')} required />
              </FormField>

              <FormField label="Phone">
                <Input type="tel" {...register('phone')} />
              </FormField>
            </div>

            <FormField label="Status">
              <Select
                value={watch('status')}
                onValueChange={(value: CandidateStatus) => setValue('status', value)}
              >
                <SelectTrigger>
                  {candidateStatuses.find(s => s.value === watch('status'))?.label}
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

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Current Role">
                <Input {...register('currentRole')} />
              </FormField>

              <FormField label="Current Company">
                <Input {...register('currentCompany')} />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Expected Salary">
                <Input type="number" {...register('expectedSalary')} />
              </FormField>

              <FormField label="Notice Period">
                <Input {...register('noticePeriod')} placeholder="e.g., 2 weeks" />
              </FormField>
            </div>

            <FormField label="Resume URL">
              <Input type="url" {...register('resumeUrl')} />
            </FormField>

            <FormField label="Skills">
              <TagInput
                value={watch('skills') || []}
                onChange={(skills) => setValue('skills', skills)}
                suggestions={commonSkills}
                placeholder="Add skills..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Type custom skills or select from suggestions
              </p>
            </FormField>

            <FormField label="Assigned To">
              <Select
                value={watch('assignedTo')}
                onValueChange={(value) => setValue('assignedTo', value)}
              >
                <SelectTrigger>
                  {users.find(u => u.id === watch('assignedTo'))?.name || 'Select User'}
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
                {...register('notes')}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={4}
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {candidate ? 'Update' : 'Create'} Candidate
            </Button>
          </div>
        </form>
      )}
    </SlidePanel>
  );
}