// src/app/settings/page.tsx
"use client";

import { ChangePasswordForm } from './components/change-password-form';
import { UserProfileCard } from './components/user-profile-card';
import { useAuth } from '@/context/AuthContext';
import { AlertSettingsCard } from './components/alert-settings-card';
import { SectorEmailCard } from './components/sector-email-card';

export default function SettingsPage() {
  const { role } = useAuth();
  
  const isAdmin = role === 'Administrador';

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua conta e do sistema.
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

       <AlertSettingsCard />

       <SectorEmailCard />

       {isAdmin && (
         <div className="flex flex-col gap-8">
            {/* Seção de gerenciamento de usuários removida temporariamente */}
         </div>
      )}
    </div>
  );
}
