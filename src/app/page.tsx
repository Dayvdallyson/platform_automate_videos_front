import { AddVideoForm } from '@/components/AddVideoForm';
import { ProcessedVideoList } from '@/components/ProcessedVideoList';
import { SocialConnectionsPanel } from '@/components/SocialConnectionsPanel';
import { StyleCarousel } from '@/components/StyleCarousel';
import { VideoList } from '@/components/VideoList';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Video } from 'lucide-react';

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

      <div className="max-w-5xl mx-auto px-4 py-16">
        <section className="mb-12">
          <AddVideoForm />
        </section>

        <Separator className="bg-border/50 mb-10" />

        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="w-full max-w-md mx-auto glass-card rounded-xl p-1.5 mb-8 py-10">
            <TabsTrigger
              value="videos"
              className="py-6 flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 transition-all"
            >
              <Video className="h-4 w-4 mr-2" />
              Vídeos Originais
            </TabsTrigger>
            <TabsTrigger
              value="processed"
              className="py-6 flex-1 rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-secondary/25 transition-all"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Cortes Gerados
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="videos" className="m-0">
              <VideoList />
            </TabsContent>

            <TabsContent value="processed" className="m-0 space-y-6">
              <SocialConnectionsPanel />

              <ProcessedVideoList />
            </TabsContent>
          </div>
        </Tabs>
      </div>

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
