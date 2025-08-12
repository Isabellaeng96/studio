// src/app/settings/components/user-profile-card.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

export function UserProfileCard() {
  const { user } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil do Usuário</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src="https://placehold.co/100x100" alt="Avatar do Usuário" data-ai-hint="user avatar" />
          <AvatarFallback className="text-3xl">
             {user?.email?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
            <p className="text-lg font-semibold">{user?.displayName || 'Usuário'}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </CardContent>
    </Card>
  );
}
