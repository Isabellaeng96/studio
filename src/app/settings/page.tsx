// src/app/settings/page.tsx
"use client";

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { ChangePasswordForm } from './components/change-password-form';
import { UserProfileCard } from './components/user-profile-card';
import { UsersTable } from './components/users-table';
import { UserForm } from './components/user-form';
import { useAuth } from '@/context/AuthContext';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
    const { users, addUser, updateUser, deleteUser } = useAppContext();
    const { role } = useAuth();
    const canManageUsers = role === 'Administrador';

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua conta e da equipe.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <UserProfileCard />
        </div>
        <div className="lg:col-span-2">
            <ChangePasswordForm />
        </div>
      </div>

      {canManageUsers && (
        <>
        <Separator />
        
        <div className="flex flex-col gap-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                <h2 className="text-2xl font-bold tracking-tight">Gerenciamento de Usuários</h2>
                <p className="text-muted-foreground">
                    Adicione, edite ou remova membros da sua equipe.
                </p>
                </div>
                <div className="flex items-center gap-2">
                    <UserForm onSave={addUser} roles={['Administrador', 'Gerente de Estoque', 'Operador de Campo', 'Visitante']} sectors={['Engenharia', 'Manutenção', 'Administrativo', 'Diretoria']}>
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
                roles={['Administrador', 'Gerente de Estoque', 'Operador de Campo', 'Visitante']} 
                sectors={['Engenharia', 'Manutenção', 'Administrativo', 'Diretoria']}
            />
        </div>
        </>
      )}
    </div>
  );
}
