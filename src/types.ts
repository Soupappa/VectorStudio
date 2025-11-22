export interface CanvasElement {
  id: string;
  name: string;
  svg: string;
  x: number;
  y: number;
  scale: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  opacity: number;
  flipX: boolean;
  flipY: boolean;
  color?: string;
  groupId?: string;
  children?: string[];
}

export interface SavedLogo {
  id: string;
  name: string;
  svg: string;
  brief?: string;
  tags: string[];
  created_at: string;
}

export interface SavedFragment {
  id: string;
  name: string;
  svg: string;
  category: string;
  tags: string[];
  is_system: boolean;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  thumbnail_svg?: string;
  canvas_elements: CanvasElement[];
  created_at: string;
  updated_at: string;
}
