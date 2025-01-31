import { Table, TableHeader, TableBody, Th, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useUsers } from '@/lib/hooks/useUsers';
import { format } from 'date-fns';
import { useOpportunities } from '@/lib/hooks/useOpportunities';
import { Briefcase, ExternalLink } from 'lucide-react';
import type { Candidate, CandidateStatus } from '@/types';

const candidateStatuses: { value: CandidateStatus; label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' }[] = [
  { value: 'new', label: 'New', variant: 'secondary' },
  { value: 'screening', label: 'Screening', variant: 'warning' },
  { value: 'interviewing', label: 'Interviewing', variant: 'warning' },
  { value: 'offered', label: 'Offered', variant: 'success' },
  { value: 'accepted', label: 'Accepted', variant: 'success' },
  { value: 'rejected', label: 'Rejected', variant: 'destructive' },
  { value: 'withdrawn', label: 'Withdrawn', variant: 'destructive' }
];

interface CandidatesTableProps {
  candidates: Candidate[];
  onEdit: (candidate: Candidate) => void;
  onDelete: (id: string) => void;
}

export function CandidatesTable({ candidates, onEdit, onDelete }: CandidatesTableProps) {
  const { users } = useUsers();
  const { opportunities } = useOpportunities();

  return (
    <Table>
      <TableHeader>
        <tr>
          <Th>Name</Th>
          <Th>Contact</Th>
          <Th>Status</Th>
          <Th>Current Role</Th>
          <Th>Skills</Th>
          <Th>Opportunity</Th>
          <Th>Assigned To</Th>
          <Th>Created</Th>
          <Th className="text-right">Actions</Th>
        </tr>
      </TableHeader>
      <TableBody>
        {candidates.map((candidate) => {
          const status = candidateStatuses.find(s => s.value === candidate.status);
          const assignedUser = users.find(u => u.id === candidate.assignedTo);
          const opportunity = opportunities.find(o => o.id === candidate.opportunityId);
          
          return (
            <tr key={candidate.id} className="group hover:bg-gray-50">
              <Td className="font-medium">{candidate.name}</Td>
              <Td>
                <div className="space-y-1">
                  <div className="text-sm">{candidate.email}</div>
                  {candidate.phone && (
                    <div className="text-sm text-gray-500">{candidate.phone}</div>
                  )}
                </div>
              </Td>
              <Td>
                <Badge variant={status?.variant || 'default'}>
                  {status?.label || candidate.status}
                </Badge>
              </Td>
              <Td>
                {candidate.currentRole && (
                  <div className="space-y-1">
                    <div>{candidate.currentRole}</div>
                    {candidate.currentCompany && (
                      <div className="text-sm text-gray-500">{candidate.currentCompany}</div>
                    )}
                  </div>
                )}
              </Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  {candidate.skills.slice(0, 3).map(skill => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                  {candidate.skills.length > 3 && (
                    <Badge variant="secondary">
                      +{candidate.skills.length - 3}
                    </Badge>
                  )}
                </div>
              </Td>
              <Td>
                {opportunity ? (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <span>{opportunity.title}</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/opportunities/${opportunity.id}`;
                      }}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <span className="text-gray-400">No Opportunity</span>
                )}
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
                {candidate.createdAt?.toDate ? 
                  format(candidate.createdAt.toDate(), 'MMM d, yyyy') :
                  'N/A'
                }
              </Td>
              <Td className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" size="sm" onClick={() => onEdit(candidate)}>
                    Edit
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => onDelete(candidate.id)}>
                    Delete
                  </Button>
                </div>
              </Td>
            </tr>
          );
        })}
      </TableBody>
    </Table>
  );
}