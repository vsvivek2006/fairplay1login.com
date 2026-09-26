export interface AIModelOption {
  id: string;
  name: string;
  provider: string;
  badge: string;
  description: string;
  contextWindow: string;
  speed: string;
  isDefault?: boolean;
}

export const AVAILABLE_MODELS: AIModelOption[] = [
  {
    id: 'openai/gpt-oss-120b',
    name: 'OpenAI GPT-OSS 120B',
    provider: 'OpenAI / Groq',
    badge: 'Recommended • Flagship',
    description: 'High-order reasoning, deep odds strategy, verified cricket betting expertise, high CTR formatting',
    contextWindow: '131k',
    speed: '~3s',
    isDefault: true,
  },
  {
    id: 'qwen/qwen3.8-27b',
    name: 'Qwen 3.8 27B',
    provider: 'Alibaba / Groq',
    badge: 'Ultra-Fast • Editorial',
    description: 'Sub-2s generation speed, punchy promotional structure, agile betting guides',
    contextWindow: '128k',
    speed: '~2s',
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'OpenAI GPT-OSS 20B',
    provider: 'OpenAI / Groq',
    badge: 'Agile & Compact',
    description: 'Lightweight and sharp generation for match previews, session alerts and quick FAQs',
    contextWindow: '128k',
    speed: '~1.5s',
  },
];

export const DEFAULT_MODEL_ID = 'openai/gpt-oss-120b';

export function getValidModel(modelId?: string): string {
  if (!modelId) return DEFAULT_MODEL_ID;
  const match = AVAILABLE_MODELS.find((m) => m.id === modelId);
  return match ? match.id : DEFAULT_MODEL_ID;
}
