import { ElementRef, Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Hls from 'hls.js';
import { Observable } from 'rxjs';

interface Video {
  id: number;
  title: string;
  description: string;
  video_url: string;
  hls_playlist: string;
  video_file:string;
}
interface VideosResponse {
  videos: Video[];
}
interface MainDataForMainpage {
  title: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class VideoService {

  videoUrls: string[] = [];
  videoUrl: string = '';
  posterUrls: string[] = [];
  videoData: { videoUrlGcs: string; posterUrlGcs: string;title: string; description: string }[] = [];
  videoPlayer:ElementRef;
  randomVideo: string;

  constructor(private http: HttpClient, private ngZone: NgZone) {
   
  }

  private apiUrl = 'http://localhost:8000/api/videos/';

  getAllVideos(): Observable<VideosResponse> {
    return this.http.get<VideosResponse>(this.apiUrl);
  }

 

  loadAllVideoUrls(videoPlayer: ElementRef): void {
    const apiUrl = `http://localhost:8000/get-all-video-urls/`;

    this.http.get<{ video_urls: string[] }>(apiUrl).subscribe({
      next: (response) => {
        this.videoUrls = response.video_urls;
        this.setupVideoPlayer(videoPlayer, this.videoUrl);
        this.createVideoData();
        this.getRandomVideoUrl();
          },
      error: (error) => {
        console.error('Error fetching video URLs:', error);
      }
    });
   
  }


  getRandomVideoUrl(): string {
    const randomIndex = Math.floor(Math.random() * this.videoUrls.length);
    console.log('videoUrls[randomIndex]: ', this.videoUrls[randomIndex]);
      const randomDataName = this.getDirectoryNameFromUrl(this.videoUrls[randomIndex]);
      this.getVideoUrl(randomDataName,'360p');
    return this.videoUrls[randomIndex];
  }


  getDirectoryNameFromUrl(url: string): string {
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 2];
  }


  getPosterFileName(videoUrlGcs: string): string {
    if (!videoUrlGcs) {
      return 'default-poster.jpg'; 
    }
    const urlParts = videoUrlGcs.split('/');
    const lastPart = urlParts[urlParts.length - 2]; 
    const fileName = lastPart + '.jpg'; 
    return fileName;
  }
  
  

  createVideoData(): void {
    this.getAllVideos().subscribe({
      next: (data) => {
        this.videoData = data.videos.map((video) => ({
          videoUrlGcs: video.hls_playlist,
          posterUrlGcs: (video.hls_playlist ? `https://storage.googleapis.com/videoflix-videos/video-posters/${this.getPosterFileName(video.hls_playlist)}` : '/assets/img/default-poster.png'),
          title: video.title,
          description: video.description,
        }));
        console.log('this.videoData:', this.videoData);
      },
      error: (error) => {
        console.error('Error fetching video data:', error);
      }
    });
  }
  
  

  getVideoUrl( videoKey: string, resolution: string): void {
    const apiUrl = `http://localhost:8000/get-video-url/?video_key=${videoKey}&resolution=${resolution}`;
    this.http.get<any>(apiUrl).subscribe({
      next: (data) => {
        if (data && data.video_url) {
          this.videoUrl = data.video_url;  // Hauptvideo
          this.videoUrls.push(data.video_url);
          this.setupVideoPlayer(this.videoPlayer, this.videoUrl);
          console.log('this.videoUrllllll',this.videoUrl);
      
          
        } else {
          console.error('Invalid response format from server');
        }
      },
      error: (error) => {
        console.error('Error fetching video URL:', error);
      }
    });
  }



  loadPosterUrls(): void {
    const apiUrl = 'http://localhost:8000/get_poster_urls/';

    this.http.get<any>(apiUrl).subscribe({
      next: (response) => {
        this.posterUrls = response.poster_urls;
      },
      error: (error) => {
        console.error('Error fetching poster URLs:', error);
      }
    });
  }

  setupVideoPlayer(videoPlayer: ElementRef, videoUrl:any): void {
    videoPlayer = this.videoPlayer;
    if (!videoPlayer) {
      console.error('Video player element is undefined');
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(videoPlayer.nativeElement);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoPlayer.nativeElement.play();
        });
      } else if (videoPlayer.nativeElement.canPlayType('application/vnd.apple.mpegurl')) {
        videoPlayer.nativeElement.src = videoUrl;
        videoPlayer.nativeElement.addEventListener('loadedmetadata', () => {
          videoPlayer.nativeElement.play();
        });
      } else {
        console.error('HLS is not supported in this browser');
      }
    });
   
  }

}
