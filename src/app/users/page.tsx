
"use client";

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { UsersTable } from './components/users-table';
import { UserForm } from './components/user-form';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function UsersPage() {
  const { users, addUser, updateUser, deleteUser, availableSectors } = useAppContext();
  const { role } = useAuth();
  const router = useRouter();

  useEffect(() => {
      if(role && role !== 'Administrador') {
          router.push('/');
      }
  }, [role, router]);

  if (role !== 'Administrador') {
      return (
          <div className="flex h-full items-center justify-center">
              <p>Você não tem permissão para acessar esta página.</p>
          </div>
      );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">
            Adicione, edite ou remova usuários do sistema.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <UserForm onSave={addUser} availableSectors={availableSectors}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Usuário
            </Button>
          </UserForm>
        </div>
      </div>
      <UsersTable 
        data={users} 
        onSave={updateUser} 
        onDelete={deleteUser}
        availableSectors={availableSectors}
      />
    </div>
  );
}
