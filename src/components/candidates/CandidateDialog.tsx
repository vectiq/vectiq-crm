import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { SlidePanel } from '@/components/ui/SlidePanel';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/Select';
import { UserPlus } from 'lucide-react';
import { useUsers } from '@/lib/hooks/useUsers';
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
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <SlidePanel
      open={open}
      onClose={() => onOpenChange(false)}
      title={candidate ? 'Edit Candidate' : 'New Candidate'}
      icon={<UserPlus className="h-5 w-5 text-indigo-500" />}
    >
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
            <div className="space-y-2">
              {commonSkills.map(skill => (
                <label key={skill} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={watch('skills')?.includes(skill)}
                    onChange={(e) => {
                      const currentSkills = watch('skills') || [];
                      if (e.target.checked) {
                        setValue('skills', [...currentSkills, skill]);
                      } else {
                        setValue('skills', currentSkills.filter(s => s !== skill));
                      }
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">{skill}</span>
                </label>
              ))}
            </div>
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
    </SlidePanel>
  );
}