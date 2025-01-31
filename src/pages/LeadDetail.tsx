import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLeads } from "@/lib/hooks/useLeads";
import { useUsers } from "@/lib/hooks/useUsers";
import { useInteractions } from "@/lib/hooks/useInteractions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import { InteractionTimeline } from "@/components/interactions/InteractionTimeline";
import { InteractionDialog } from "@/components/interactions/InteractionDialog";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { AttachmentUpload } from "@/components/ui/AttachmentUpload";
import { ArrowLeft, Mail, Phone, Target } from "lucide-react";
import type { Lead, LeadStatus, InteractionType } from "@/types";

const leadSources = [
  "Website",
  "Referral",
  "Cold Call",
  "LinkedIn",
  "Conference",
  "Other",
];

const leadStatuses: {
  value: LeadStatus;
  label: string;
  variant: "default" | "secondary" | "success" | "warning" | "destructive";
}[] = [
  { value: "new", label: "New", variant: "secondary" },
  { value: "contacted", label: "Contacted", variant: "warning" },
  { value: "qualified", label: "Qualified", variant: "success" },
  { value: "unqualified", label: "Unqualified", variant: "destructive" },
];

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { leads, updateLead } = useLeads();
  const { users, currentUser } = useUsers();
  const [isInteractionDialogOpen, setIsInteractionDialogOpen] = useState(false);
  const { interactions, createInteraction } = useInteractions({ leadId: id });
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    status: "new" as LeadStatus,
    source: "",
    notes: "",
    assignedTo: "",
  });

  const lead = leads.find((l) => l.id === id);

  useEffect(() => {
    if (lead) {
      setFormData({
        companyName: lead.companyName,
        contactName: lead.contactName,
        email: lead.email,
        phone: lead.phone || "",
        status: lead.status,
        source: lead.source,
        notes: lead.notes || "",
        assignedTo: lead.assignedTo || "",
      });
    }
  }, [lead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await updateLead(id, formData);
    } catch (error) {
      console.error("Error saving lead:", error);
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
      leadId: id,
    });
  };

  if (!lead) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => navigate("/leads")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {lead.companyName}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={
                  leadStatuses.find((s) => s.value === lead.status)?.variant
                }
              >
                {leadStatuses.find((s) => s.value === lead.status)?.label}
              </Badge>
              {lead.source && <Badge variant="secondary">{lead.source}</Badge>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <FormField label="Company Name">
                  <Input
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        companyName: e.target.value,
                      }))
                    }
                    required
                  />
                </FormField>

                <FormField label="Contact Name">
                  <Input
                    value={formData.contactName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contactName: e.target.value,
                      }))
                    }
                    required
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Email">
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      required
                    />
                  </FormField>

                  <FormField label="Phone">
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Status">
                    <Select
                      value={formData.status}
                      onValueChange={(value: LeadStatus) =>
                        setFormData((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        {leadStatuses.find((s) => s.value === formData.status)
                          ?.label || "Select Status"}
                      </SelectTrigger>
                      <SelectContent>
                        {leadStatuses.map((status) => (
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
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, source: value }))
                      }
                    >
                      <SelectTrigger>
                        {formData.source || "Select Source"}
                      </SelectTrigger>
                      <SelectContent>
                        {leadSources.map((source) => (
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
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, assignedTo: value }))
                    }
                  >
                    <SelectTrigger>
                      {users.find((u) => u.id === formData.assignedTo)?.name ||
                        "Select User"}
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
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
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={4}
                  />
                </FormField>
              </div>

              <div className="flex justify-end">
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </Card>

          <Card className="p-6">
            <InteractionTimeline
              interactions={interactions}
              onAddInteraction={() => setIsInteractionDialogOpen(true)}
            />
          </Card>

          <Card className="p-6">
            <AttachmentUpload
              entityType="leads" // or "opportunities" or "candidates"
              entityId={id}
              attachments={lead.attachments}
              uploadedBy={currentUser.id}
              onUpload={(attachment) => {
                updateLead(id, {
                  attachments: [...(lead.attachments || []), attachment]
                });
              }}
              onDelete={(attachment) => {
                updateLead(id, {
                  attachments: lead.attachments?.filter(a => a.id !== attachment.id) || []
                });
              }}
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="secondary">
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button className="w-full justify-start" variant="secondary">
                <Phone className="h-4 w-4 mr-2" />
                Log Call
              </Button>
              <Button className="w-full justify-start" variant="secondary">
                <Target className="h-4 w-4 mr-2" />
                Convert to Opportunity
              </Button>
            </div>
          </Card>
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