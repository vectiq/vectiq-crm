import { useState } from 'react';
import { SlidePanel } from '@/components/ui/SlidePanel';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/Select';
import { MessageSquare } from 'lucide-react';
import type { InteractionType } from '@/types';

interface InteractionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    type: InteractionType;
    title: string;
    description: string;
    date: string;
  }) => Promise<void>;
}

export function InteractionDialog({
  open,
  onOpenChange,
  onSubmit,
}: InteractionDialogProps) {
  const [formData, setFormData] = useState({
    type: 'note' as InteractionType,
    title: '',
    description: '',
    date: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDThh:mm
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <SlidePanel
      open={open}
      onClose={() => onOpenChange(false)}
      title="Add Interaction"
      icon={<MessageSquare className="h-5 w-5 text-indigo-500" />}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-4">
          <FormField label="Type">
            <Select
              value={formData.type}
              onValueChange={(value: InteractionType) => 
                setFormData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="note">Note</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Title">
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Brief summary of the interaction"
              required
            />
          </FormField>

          <FormField label="Description">
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={4}
              required
            />
          </FormField>

          <FormField label="Date">
            <Input
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </FormField>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit">
            Add Interaction
          </Button>
        </div>
      </form>
    </SlidePanel>
  );
}