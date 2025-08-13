// src/app/settings/components/sector-email-card.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import { PlusCircle, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const emailSchema = z.object({
  email: z.string().email("Por favor, insira um e-mail válido."),
});

type EmailFormValues = z.infer<typeof emailSchema>;

export function SectorEmailCard() {
  const {
    availableSectors,
    sectorEmailConfig,
    addEmailToSector,
    removeEmailFromSector,
  } = useAppContext();

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
  });

  const handleAddEmail = (sector: string, data: EmailFormValues) => {
    addEmailToSector(sector, data.email);
    form.reset({ email: "" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Destinatários de Alertas por Setor</CardTitle>
        <CardDescription>
          Configure quais endereços de e-mail receberão os alertas de estoque
          mínimo para cada setor. Pode ser um ou mais e-mails.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-3">
        {availableSectors.map((sector) => (
          <div key={sector} className="flex flex-col gap-4 rounded-lg border p-4">
            <h3 className="font-semibold">{sector}</h3>
            <div className="flex-1 space-y-2">
                {sectorEmailConfig[sector]?.length > 0 ? (
                    sectorEmailConfig[sector].map((email) => (
                    <div key={email} className="flex items-center justify-between gap-2 rounded-md bg-secondary px-2 py-1">
                        <span className="text-sm text-secondary-foreground truncate">{email}</span>
                        <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeEmailFromSector(sector, email)}
                        >
                        <X className="h-4 w-4" />
                        </Button>
                    </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">Nenhum e-mail configurado.</p>
                )}
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => handleAddEmail(sector, data))}
                className="flex items-start gap-2"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder="novo.email@exemplo.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="icon">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </form>
            </Form>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
