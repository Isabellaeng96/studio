
"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { QrCode, VideoOff } from 'lucide-react';
import type { Material } from '@/types';

interface QrCodeScannerProps {
  onScan: (materialId: string) => void;
  materials: Material[];
}

export function QrCodeScanner({ onScan, materials }: QrCodeScannerProps) {
  const [open, setOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number>();
  const { toast } = useToast();
  
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        streamRef.current = stream;
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Erro ao acessar a câmera: ", err);
        setHasCameraPermission(false);
        toast({
            variant: "destructive",
            title: "Acesso à Câmera Negado",
            description: "Por favor, habilite a permissão da câmera nas configurações do seu navegador.",
        });
      }
    } else {
        setHasCameraPermission(false);
    }
  }, [toast]);
  
  const parseQrCodeData = (data: string): { [key: string]: string } => {
    const lines = data.split('\n');
    const result: { [key: string]: string } = {};
    lines.forEach(line => {
        const parts = line.split(': ');
        if (parts.length === 2) {
            result[parts[0].toLowerCase()] = parts[1];
        }
    });
    return result;
  };
  
  const tick = useCallback(() => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          const parsedData = parseQrCodeData(code.data);
          const materialId = parsedData['código'];

          if (materialId) {
             const materialExists = materials.some(m => m.id === materialId);
             if (materialExists) {
                onScan(materialId);
                toast({
                  title: "Material Adicionado",
                  description: `Item ${materials.find(m => m.id === materialId)?.name} adicionado à lista.`
                });
                setOpen(false); // Close dialog on successful scan
             } else {
                 toast({
                     variant: "destructive",
                     title: "QR Code Inválido",
                     description: `O material com o código ${materialId} não foi encontrado no sistema.`
                 });
             }
          }
        }
      }
    }
    animationFrameId.current = requestAnimationFrame(tick);
  }, [onScan, toast, materials]);

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [open, startCamera, stopCamera]);
  
  useEffect(() => {
    if (open && hasCameraPermission) {
        animationFrameId.current = requestAnimationFrame(tick);
    }
    return () => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
    }
  }, [open, hasCameraPermission, tick]);


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
            <QrCode className="mr-2 h-4 w-4" />
            Escanear QR Code
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Escanear QR Code do Material</DialogTitle>
          <DialogDescription>
            Aponte a câmera para o QR Code do material para adicioná-lo à lista de retirada.
          </DialogDescription>
        </DialogHeader>
        <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
            {hasCameraPermission === null && <p>Solicitando permissão da câmera...</p>}
            {hasCameraPermission === false && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <VideoOff className="h-16 w-16" />
                    <p className="mt-2 text-center">Acesso à câmera necessário.<br/>Por favor, habilite a permissão nas configurações do seu navegador.</p>
                </div>
            )}
            <video ref={videoRef} className="h-full w-full" autoPlay playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
