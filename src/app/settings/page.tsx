// src/app/settings/page.tsx
import { ChangePasswordForm } from './components/change-password-form';
import { UserProfileCard } from './components/user-profile-card';

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua conta e preferências.
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
    </div>
  );
}
