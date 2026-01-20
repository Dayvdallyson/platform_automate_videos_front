import { CutStyle } from '@/types/cutStyles';
import Image from 'next/image';

interface StyleCardProps {
  style: CutStyle;
}

const imageFileNames: Record<string, string> = {
  viral: 'viral.png',
  podcast: 'podcast.png',
  educacional: 'Educacional.png',
  humor: 'humor.png',
  negocios: 'Negocios.png',
};

export function StyleCard({ style }: StyleCardProps) {
  const Icon = style.icon;
  const imagePath = `/images/styles/${imageFileNames[style.id]}`;

  return (
    <div className="style-card">
      <div className="style-card-image relative">
        <Image src={imagePath} alt={style.title} fill className="object-cover" sizes="280px" />
        <div className={`absolute inset-0 bg-linear-to-br ${style.gradient} opacity-30`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="w-12 h-12 text-white/80 drop-shadow-lg" />
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1.5 rounded-lg bg-linear-to-br ${style.gradient}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-foreground">{style.title}</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{style.description}</p>
      </div>
    </div>
  );
}
