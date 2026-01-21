'use client';

import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser, isLoading } = useAuth();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onRegister = async (data: RegisterValues) => {
    try {
      setError('');
      await registerUser(data);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-4 relative overflow-hidden bg-background">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[420px] z-10"
        >
          <div className="glass-card p-10 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl text-center">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/30">
              <Mail className="h-8 w-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
            <p className="text-muted-foreground mb-8">
              Nós enviamos um link de verificação para{' '}
              <span className="text-white font-medium">{registerForm.getValues('email')}</span>.
            </p>
            <p className="text-sm text-gray-400 mb-8">
              Por favor, clique no link no email para verificar sua conta e fazer login.
            </p>
            <Button
              asChild
              variant="outline"
              className="w-full bg-white/5 border-white/10 hover:bg-white/10 hover:text-white transition-all h-11"
            >
              <Link href="/login">Back to Login</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 relative overflow-hidden bg-background">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px] z-10"
      >
        <div className="glass-card p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400 mb-2">
              Criar Conta
            </h1>
            <p className="text-muted-foreground">
              Junte-se a Nós para Começar a Criar Novos Vídeos Incríveis
            </p>
          </div>

          <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">
                Nome
              </Label>
              <Input
                id="name"
                placeholder="Dayvd Costa"
                {...registerForm.register('name')}
                disabled={isLoading}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 transition-all"
              />
              {registerForm.formState.errors.name && (
                <p className="text-sm text-red-400">{registerForm.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@exemplo.com"
                {...registerForm.register('email')}
                disabled={isLoading}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 transition-all"
              />
              {registerForm.formState.errors.email && (
                <p className="text-sm text-red-400">
                  {registerForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                {...registerForm.register('password')}
                disabled={isLoading}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 transition-all"
              />
              {registerForm.formState.errors.password && (
                <p className="text-sm text-red-400">
                  {registerForm.formState.errors.password.message}
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-linear-to-r from-primary to-secondary hover:opacity-90 transition-opacity h-11 font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando Conta...
                </>
              ) : (
                <>
                  Criar Conta <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Link
              href="/login"
              className="text-primary hover:text-primary/80 font-medium transition-colors hover:underline underline-offset-4"
            >
              Entrar
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
