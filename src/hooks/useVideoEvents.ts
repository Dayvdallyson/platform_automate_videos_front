import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export function useVideoEvents(userId: number | null) {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!userId) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
    const url = `${baseUrl}/api/sse/stream`;

    const es = new EventSource(url, { withCredentials: true });
    eventSourceRef.current = es;

    es.onerror = (error) => {
      console.error('SSE Error:', error);
    };

    es.addEventListener('video_processed', (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if (data.user_id !== userId) return;

        toast.success('Vídeo processado com sucesso!', {
          description: 'Sua lista será atualizada.',
        });

        queryClient.invalidateQueries({ queryKey: ['videos'] });
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    });

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [userId, queryClient]);
}
