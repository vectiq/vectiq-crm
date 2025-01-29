import { useState, useCallback } from 'react';
import { useProjects } from '@/lib/hooks/useProjects';
import { ProjectsTable } from '@/components/projects/ProjectsTable';
import { ProjectDialog } from '@/components/projects/ProjectDialog';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Plus } from 'lucide-react';
import { useConfirm } from '@/lib/hooks/useConfirm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { Project } from '@/types';

export default function Projects() {
  const { 
    projects, 
    isLoading, 
    createProject, 
    updateProject, 
    deleteProject,
    assignUserToTask,
    removeUserFromTask,
    isCreating,
    isUpdating,
    isDeleting 
  } = useProjects();
  const [includeInactive, setIncludeInactive] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTasksDialogOpen, setIsTasksDialogOpen] = useState(false);
  const { confirm, dialog, handleClose } = useConfirm();

  // Filter projects based on active status and end date
  const filteredProjects = projects.filter(project => {
    if (includeInactive) return true;
    
    const isActive = project.isActive;
    const hasEndDate = project.endDate && project.endDate.trim() !== '';
    const endDate = hasEndDate ? new Date(project.endDate) : null;
    const isEndDateInFuture = endDate ? endDate > new Date() : true;
    
    return isActive && (!hasEndDate || isEndDateInFuture);
  }
  );

  const handleOpenCreateDialog = useCallback(() => {
    setSelectedProject(null);
    setIsDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(async (data: Project) => {
    if (selectedProject) {
      await updateProject({ ...data, id: selectedProject.id });
    } else {
      await createProject(data);
    }
    setIsDialogOpen(false);
  }, [selectedProject, updateProject, createProject]);

  const handleEdit = useCallback((project: Project) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Project',
      message: 'Are you sure you want to delete this project? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });

    if (confirmed) {
      await deleteProject(id);
    }
  }, [confirm, deleteProject]);

  const handleManageAssignments = useCallback((project: Project) => {
    setSelectedProject(project);
    setIsTasksDialogOpen(true);
  }, []);


  if (isLoading) {
    return <LoadingScreen />;
  }

  const isProcessing = isCreating || isUpdating || isDeleting;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
        </div>
        <div className="flex items-center gap-6">
          <Checkbox
            checked={includeInactive}
            onCheckedChange={(checked) => setIncludeInactive(checked)}
            label="Show inactive projects"
          />
          <Button onClick={handleOpenCreateDialog} disabled={isProcessing}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
        <ProjectsTable 
          projects={filteredProjects}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onManageAssignments={handleManageAssignments}
        />
      </div>

      <ProjectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        project={selectedProject}
        onSubmit={handleSubmit}
      />

      {dialog && (
        <ConfirmDialog
          open={dialog.isOpen}
          title={dialog.title}
          message={dialog.message}
          confirmText={dialog.confirmText}
          cancelText={dialog.cancelText}
          onConfirm={() => handleClose(true)}
          onCancel={() => handleClose(false)}
        />
      )}
    </div>
  );
}