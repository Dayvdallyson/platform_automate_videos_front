'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

const API_BASE = process.env.BACKEND_FASTAPI_URL || 'http://localhost:8000';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/ `, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (res.ok) {
          setStatus('success');
        } else {
          const data = await res.json().catch(() => ({}));
          setStatus('error');
          setMessage(data.detail || 'Verification failed. Token may be invalid or expired.');
        }
      } catch {
        setStatus('error');
        setMessage('An error occurred. Please try again.');
      }
    };

    verify();
  }, [token]);

  return (
    <Card className="w-full max-w-100">
      <CardHeader className="text-center">
        <CardTitle>Verificação de Email</CardTitle>
        <CardDescription>Verificando seu endereço de email...</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-6 gap-6">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Please wait...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <div className="space-y-1">
              <h3 className="font-medium text-lg">Verificado!</h3>
              <p className="text-muted-foreground">Seu email foi verificado com sucesso.</p>
            </div>
            <Button asChild className="w-full">
              <Link href="/login">Ir para Login</Link>
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4 text-center">
            <XCircle className="h-12 w-12 text-red-500" />
            <div className="space-y-1">
              <h3 className="font-medium text-lg">Falha na Verificação</h3>
              <p className="text-muted-foreground">{message}</p>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Voltar ao Login</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center p-4">
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
