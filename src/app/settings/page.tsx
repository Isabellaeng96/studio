// src/app/settings/page.tsx
"use client";

import { ChangePasswordForm } from './components/change-password-form';
import { UserProfileCard } from './components/user-profile-card';
import { AlertSettingsCard } from './components/alert-settings-card';
import { SectorEmailCard } from './components/sector-email-card';


export default function SettingsPage() {
  
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua conta e do sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 flex flex-col gap-8">
          <UserProfileCard />
          <ChangePasswordForm />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-8">
            <SectorEmailCard />
        </div>
      </div>
      <div>
        <AlertSettingsCard />
      </div>
    </div>
  );
}
