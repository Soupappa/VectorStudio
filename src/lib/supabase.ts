import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  thumbnail_svg?: string;
  created_at: string;
  updated_at: string;
}

export interface Logo {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  svg_content: string;
  brief?: string;
  tags: string[];
  created_at: string;
}

export interface Fragment {
  id: string;
  user_id?: string;
  name: string;
  svg_content: string;
  category: string;
  tags: string[];
  is_system: boolean;
  created_at: string;
}

export interface Composition {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  canvas_data: {
    elements: CanvasElement[];
    viewport: { x: number; y: number; zoom: number };
  };
  final_svg?: string;
  created_at: string;
  updated_at: string;
}

export interface CanvasElement {
  id: string;
  type: 'fragment' | 'logo';
  svg_content: string;
  transform: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  };
  style: {
    fill?: string;
    stroke?: string;
    opacity: number;
  };
}

export interface Animation {
  id: string;
  user_id: string;
  name: string;
  type: 'rotation' | 'pulse' | 'oscillation' | 'breathing' | 'orbit';
  svg_content: string;
  original_svg?: string;
  parameters: Record<string, any>;
  created_at: string;
}
