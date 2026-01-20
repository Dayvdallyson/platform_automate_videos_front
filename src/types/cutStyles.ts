import { Briefcase, Flame, GraduationCap, Laugh, LucideIcon, Mic2 } from 'lucide-react';

export interface CutStyle {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
  gradient: string;
}

export const cutStyles: CutStyle[] = [
  {
    id: 'viral',
    title: 'Viral',
    icon: Flame,
    description:
      'Hooks explosivos que capturam atenção nos primeiros 3 segundos. Cortes rápidos, transições impactantes e edição dinâmica para maximizar retenção e viralização.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    id: 'podcast',
    title: 'Podcast',
    icon: Mic2,
    description:
      'Fluxo conversacional natural com cortes suaves entre falas. Preserva a autenticidade do diálogo enquanto remove pausas longas e momentos sem conteúdo.',
    gradient: 'from-purple-500 to-indigo-500',
  },
  {
    id: 'educacional',
    title: 'Educacional',
    icon: GraduationCap,
    description:
      'Estrutura clara com introdução, desenvolvimento e conclusão. Destaca pontos-chave, adiciona contexto visual e mantém o espectador engajado do início ao fim.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'humor',
    title: 'Humor',
    icon: Laugh,
    description:
      'Timing cômico perfeito com cortes precisos. Captura reações genuínas, piadas e momentos engraçados com edição que amplifica o impacto humorístico.',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'negocios',
    title: 'Negócios',
    icon: Briefcase,
    description:
      'Conteúdo profissional focado em valor e resultados. Extrai insights acionáveis, dicas práticas e conhecimento de alto impacto para audiências corporativas.',
    gradient: 'from-emerald-500 to-teal-500',
  },
];
