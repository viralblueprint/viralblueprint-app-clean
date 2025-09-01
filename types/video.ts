export interface Video {
  id?: string;
  url?: string;
  platform?: string;
  views: number;
  likes?: number;
  comments?: number;
  post_type?: string;
  hook?: string;
  written_hook?: string;
  verbal_hook?: string;
  visual_hook_type?: string;
  audio_hook_type?: string;
  written_hook_type?: string;
}

export interface Industry {
  name: string;
  value?: string;
  label?: string;
}