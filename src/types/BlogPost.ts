export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[] | string;
  cover_image?: string;
  author: string;
  category: string;
  status: 'published' | 'draft';
  ai_generated?: boolean;
  seo_title?: string;
  seo_description?: string;
  tags?: string[];
  reading_time_minutes?: number;
  published_at?: string;
  created_at: string;
  updated_at?: string;
}
