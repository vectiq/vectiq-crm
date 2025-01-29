import { useState } from 'react';
import { useUsers } from '@/lib/hooks/useUsers';
import { Button } from '@/components/ui/Button';
import { Plus, AlertTriangle } from 'lucide-react';
import { UsersTable } from '@/components/users/UsersTable';
import { UserDialog } from '@/components/users/UserDialog';
import { RatesDialog } from '@/components/users/RatesDialog';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/AlertDialog';
import type { User } from '@/types';

export default function Users() {
  const { 
    users, 
    isLoading, 
    createUser, 
    updateUser, 
    deleteUser,
  } = useUsers();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRatesUser, setSelectedRatesUser] = useState<User | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; userId: string | null }>({
    isOpen: false,
    userId: null
  });

  const handleOpenCreateDialog = () => {
    setSelectedUser(null);
    setIsUserDialogOpen(true);
  };

  const handleManageRates = (user: User) => {
    setSelectedRatesUser(user);
  };

  const handleSubmit = async (data: Omit<User, 'id'>) => {
    if (selectedUser) {
      await updateUser(selectedUser.id, data);
    } else {
      await createUser(data);
    }
    setIsUserDialogOpen(false);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsUserDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirmation({ isOpen: true, userId: id });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmation.userId) {
      await deleteUser(deleteConfirmation.userId);
      setDeleteConfirmation({ isOpen: false, userId: null });
    }
  };

  const handleSaveRates = async (updates: { salary?: SalaryItem[]; costRate?: CostRate[] }) => {
    if (selectedRatesUser) {
      await updateUser(selectedRatesUser.id, updates);
      setSelectedRatesUser(null);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <Button onClick={handleOpenCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          New User
        </Button>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
        <UsersTable 
          users={users}
          onEdit={handleEdit}
          onManageRates={handleManageRates}
          onDelete={handleDelete}
        />
      </div>

      <UserDialog
        open={isUserDialogOpen}
        onOpenChange={setIsUserDialogOpen}
        user={selectedUser}
        onSubmit={handleSubmit}
      />

      <RatesDialog
        open={!!selectedRatesUser}
        onOpenChange={(open) => !open && setSelectedRatesUser(null)}
        user={selectedRatesUser || null}
        onSave={handleSaveRates}
      />

      <AlertDialog 
        open={deleteConfirmation.isOpen} 
        onOpenChange={(open) => setDeleteConfirmation(prev => ({ ...prev, isOpen: open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <AlertDialogTitle>Delete User</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}