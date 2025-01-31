import { format } from 'date-fns';
import { MessageSquare, Phone, Video, Mail, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUsers } from '@/lib/hooks/useUsers';
import type { Interaction } from '@/types';

interface InteractionTimelineProps {
  interactions: Interaction[];
  onAddInteraction: () => void;
}

const interactionIcons = {
  email: Mail,
  call: Phone,
  meeting: Video,
  note: MessageSquare,
};

const interactionColors = {
  email: 'text-blue-500 bg-blue-50',
  call: 'text-green-500 bg-green-50',
  meeting: 'text-purple-500 bg-purple-50',
  note: 'text-gray-500 bg-gray-50',
};

export function InteractionTimeline({ interactions, onAddInteraction }: InteractionTimelineProps) {
  const { users } = useUsers();

  return (
    <div className="flow-root">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Interactions</h3>
        <Button onClick={onAddInteraction} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Interaction
        </Button>
      </div>

      <ul role="list" className="-mb-8">
        {interactions.map((interaction, idx) => {
          const Icon = interactionIcons[interaction.type];
          const colorClass = interactionColors[interaction.type];
          const user = users.find(u => u.id === interaction.userId);
          const isLast = idx === interactions.length - 1;

          return (
            <li key={interaction.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-3">
                  <div className={`relative px-1.5 py-1.5 rounded-full ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">
                          {user?.name || 'Unknown User'}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {format(new Date(interaction.date), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-gray-900">{interaction.title}</h4>
                      <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">
                        {interaction.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}