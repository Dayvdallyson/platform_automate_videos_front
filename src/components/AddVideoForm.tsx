'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCreateVideo } from '@/hooks/useVideos';
import { Link as LinkIcon, Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function AddVideoForm() {
  const [url, setUrl] = useState('');
  const createVideo = useCreateVideo();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error('Please enter a video URL');
      return;
    }

    try {
      await createVideo.mutateAsync(url.trim());
      toast.success('Video added! Download started in background.');
      setUrl('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add video');
    }
  };

  return (
    <Card className="border-none bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Plus className="h-5 w-5 text-purple-400" />
          Add New Video
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="url"
              placeholder="Paste YouTube URL here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={createVideo.isPending}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
            />
          </div>
          <Button
            type="submit"
            disabled={createVideo.isPending}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25"
          >
            {createVideo.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Video
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
