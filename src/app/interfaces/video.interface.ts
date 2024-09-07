export interface Video {
    id: number;
    title: string;
    description: string;
    video_url: string;
    hls_playlist: string;
    videoUrlGcs: string;
    age: string;
    resolution: string;
    release_date: string
  }
  
  export interface VideoData {
    subfolder: string;
    description: string;
    title: string;
    posterUrlGcs?: string;
    category: string;
    age: string;
    resolution: string;
    release_date: string
  }