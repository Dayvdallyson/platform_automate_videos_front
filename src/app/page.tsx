import { StyleCarousel } from '@/components/StyleCarousel';
import { SubscriptionWrapper } from '@/components/SubscriptionWrapper';
import { Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <header className="relative py-16 text-center">
        <div className="inline-flex items-center gap-2 gradient-border px-4 py-1.5 mb-6">
          <Sparkles className="h-3.5 w-3.5 text-secondary" />
          <span className="text-xs font-medium text-muted-foreground">
            Criação de cortes com IA
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          <span className="text-foreground">Transforme vídeos longos em </span>
          <span className="text-gradient">cortes virais</span>
        </h1>

        <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base px-4">
          Cole um link do YouTube e deixe a IA fazer o trabalho pesado: baixar, transcrever e gerar
          automaticamente cortes prontos para TikTok, Reels e Shorts.
        </p>
      </header>

      <StyleCarousel />

      <SubscriptionWrapper />

      <footer className="border-t border-border/30 py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <span className="text-gradient font-medium">Automatize sua criação</span>
          <span className="mx-2">•</span>
          Criado por Dayvd
        </div>
      </footer>
    </main>
  );
}
