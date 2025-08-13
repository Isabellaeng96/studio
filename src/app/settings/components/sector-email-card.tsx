// src/app/settings/components/sector-email-card.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { PlusCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const sectorEmailSchema = z.object({
  email: z.string().email("Por favor, insira um e-mail válido."),
  sector: z.string().min(1, "Por favor, selecione um setor."),
});

type SectorEmailFormValues = z.infer<typeof sectorEmailSchema>;

export function SectorEmailCard() {
  const {
    availableSectors,
    sectorEmailConfig,
    addEmailToSector,
    removeEmailFromSector,
  } = useAppContext();
  const { toast } = useToast();

  const form = useForm<SectorEmailFormValues>({
    resolver: zodResolver(sectorEmailSchema),
    defaultValues: {
      email: "",
      sector: "",
    },
  });

  const handleAddEmail = (data: SectorEmailFormValues) => {
    addEmailToSector(data.sector, data.email);
    toast({
      title: "E-mail Adicionado",
      description: `O e-mail ${data.email} foi adicionado ao setor ${data.sector}.`,
    });
    form.reset({ email: "", sector: "" });
  };

  const handleRemoveEmail = (sector: string, email: string) => {
    removeEmailFromSector(sector, email);
    toast({
      title: "E-mail Removido",
      description: `O e-mail ${email} foi removido do setor ${sector}.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Destinatários de Alertas por Setor</CardTitle>
        <CardDescription>
          Configure os endereços de e-mail que receberão os alertas de estoque
          mínimo para cada setor.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {availableSectors.map((sector) => (
          <div key={sector} className="flex flex-col gap-3">
            <h3 className="font-semibold">{sector}</h3>
            <div className="flex-1 space-y-2">
              {sectorEmailConfig[sector]?.length > 0 ? (
                sectorEmailConfig[sector].map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between gap-2 rounded-md bg-secondary px-2 py-1"
                  >
                    <span className="truncate text-sm text-secondary-foreground">
                      {email}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRemoveEmail(sector, email)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remover e-mail</span>
                    </Button>
                  </div>
                ))
              ) : (
                <p className="py-2 text-center text-sm text-muted-foreground">
                  Nenhum e-mail configurado.
                </p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
      <Separator />
      <CardFooter className="pt-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleAddEmail)}
            className="flex w-full flex-wrap items-start gap-4 md:flex-nowrap"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="w-full flex-1">
                  <FormLabel>Novo E-mail</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="novo.email@exemplo.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="px-1 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sector"
              render={({ field }) => (
                <FormItem className="w-full md:w-auto md:min-w-[200px]">
                  <FormLabel>Setor</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                     <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o setor" />
                        </SelectTrigger>
                     </FormControl>
                     <SelectContent>
                        {availableSectors.map((sector) => (
                            <SelectItem key={sector} value={sector}>
                                {sector}
                            </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
                  <FormMessage className="px-1 text-xs" />
                </FormItem>
              )}
            />
            <div className="w-full md:w-auto">
                <FormLabel className="opacity-0 hidden md:block">Ação</FormLabel>
                <Button type="submit" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar
                </Button>
            </div>
          </form>
        </Form>
      </CardFooter>
    </Card>
  );
}