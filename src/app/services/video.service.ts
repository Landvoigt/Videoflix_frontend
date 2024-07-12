import { ElementRef, Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Hls from 'hls.js';

@Injectable({
  providedIn: 'root'
})
export class VideoService {

  videoUrls: string[] = [];
  videoUrl: string = '';
  posterUrls: string[] = [];
  videoData: { videoUrlGcs: string; posterUrlGcs: string }[] = [];
  videoPlayer:ElementRef;
  
  constructor(private http: HttpClient, private ngZone: NgZone) {}

  loadAllVideoUrls(videoPlayer: ElementRef): void {
    const apiUrl = `http://localhost:8000/get-all-video-urls/`;

    this.http.get<{ video_urls: string[] }>(apiUrl).subscribe({
      next: (response) => {
        this.videoUrls = response.video_urls;
        this.setupVideoPlayer(videoPlayer, this.videoUrl);
        this.createVideoData();
      },
      error: (error) => {
        console.error('Error fetching video URLs:', error);
      }
    });
  }

  createVideoData(): void {
    this.videoData = this.videoUrls.map((videoUrl, index) => ({
      videoUrlGcs: videoUrl || '/assets/img/barni/startvideo.png',
      posterUrlGcs: this.posterUrls[index] || '/assets/img/barni/am_gang.png'
    }));
  }

  getVideoUrl(videoPlayer: ElementRef, videoKey: string, resolution: string): void {
    const apiUrl = `http://localhost:8000/get-video-url/?video_key=${videoKey}&resolution=${resolution}`;

    this.http.get<any>(apiUrl).subscribe({
      next: (data) => {
        if (data && data.video_url) {
          this.videoUrl = data.video_url;  // Hauptvideo
          this.videoUrls.push(data.video_url);
          this.setupVideoPlayer(videoPlayer, this.videoUrl);
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
