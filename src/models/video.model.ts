export interface Video {
  id: number;
  title: string;
  description: string;
  video_url: string;
  hls_playlist: string;
  videoUrlGcs: string
}