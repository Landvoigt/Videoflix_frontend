import { ElementRef, Injectable, Renderer2, RendererFactory2, ViewChild } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { VideoData } from '@interfaces/video.interface';
import { AlertService } from './alert.service';
import Hls from 'hls.js';

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  private videoDataSubject = new BehaviorSubject<VideoData[]>([]);
  videoData$: Observable<VideoData[]> = this.videoDataSubject.asObservable();

  private apiVideoBaseUrl = "http://localhost:8000/api/video/";

  elementRef: ElementRef;
  renderer: Renderer2;

  @ViewChild('videoPlayerMain', { static: false }) videoPlayer: ElementRef<HTMLVideoElement>;

  private hls: Hls | null = null;
  private videoUrl: string = '';
  private audioEnabled: boolean = false;
  currentVideo: string;

  constructor(
    public rendererFactory: RendererFactory2,
    private http: HttpClient,
    private authService: AuthService,
    private alertService: AlertService) {

    this.renderer = rendererFactory.createRenderer(null, null);
  }

  fetchVideoData(): void {
    this.http.get<VideoData[]>(`${this.apiVideoBaseUrl}info/`, { headers: this.getHeaders() }).pipe(
      tap((data: VideoData[]) => this.videoDataSubject.next(data)),
      catchError(this.handleError)
    ).subscribe();
  }

  getVideoData(category: string): Observable<VideoData[]> {
    return this.videoData$.pipe(
      map((data: VideoData[]) => {
        if (!category) {
          return data;
        }
        return data.filter(video => video.category === category);
      })
    );
  }

  fetchPlaylist(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiVideoBaseUrl}playlist/`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getPlaylist(): Observable<VideoData[]> {
    return this.fetchPlaylist().pipe(
      switchMap((playlistTitles: string[]) =>
        this.videoData$.pipe(
          map((videoData: VideoData[]) =>
            videoData.filter((data: VideoData) => playlistTitles.includes(data.subfolder))
          )
        )
      ),
      catchError(this.handleError)
    );
  }

  getRandomVideoData(): Observable<VideoData | undefined> {
    return this.videoData$.pipe(
      map(videoData => {
        if (videoData.length === 0) {
          return undefined;
        }
        const randomIndex = Math.floor(Math.random() * videoData.length);
        return videoData[randomIndex];
      }),
      catchError(this.handleError)
    );
  }

  getVideoUrl(videoKey: string, resolution: string): Observable<string> {
    const apiUrl = `${this.apiVideoBaseUrl}preview/?video_key=${videoKey}&resolution=${resolution}`;
    return this.http.get<{ video_url: string }>(apiUrl).pipe(
      map(response => {
        if (response && response.video_url) {
          return response.video_url;
        } else {
          throw new Error('Invalid response format from server');
        }
      }),
      catchError(this.handleError)
    );
  }

  getVideoElementResolution(video: HTMLVideoElement): string {
    const width = video.clientWidth;

    if (width >= 1920) {
      return '1080p';
    } else if (width >= 1280) {
      return '720p';
    } else if (width >= 854) {
      return '480p';
    } else {
      return '360p';
    }
  }


  playRandomVideo(videoElement: ElementRef<HTMLVideoElement>, videoUrl: string): void {
    this.videoUrl = videoUrl; // Store the current video URL
    const video: HTMLVideoElement = videoElement.nativeElement;
    // Ensure video is initially muted for autoplay policies
    if (!this.audioEnabled) {
      video.muted = true;
    }

    if (Hls.isSupported()) {
      this.setupHls(video, videoUrl);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      this.setupNativeHls(video, videoUrl);
    } else {
      console.error('HLS not supported');
    }
  }

  private setupHls(video: HTMLVideoElement, videoUrl: string): void {
    if (this.hls) {
      this.hls.destroy();
    }
    this.hls = new Hls();
    this.hls.loadSource(videoUrl);
    this.hls.attachMedia(video);
    this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
      this.showPosterAndDelayPlay(video);
    });
  }

  private setupNativeHls(video: HTMLVideoElement, videoUrl: string): void {
    video.src = videoUrl;
    video.addEventListener('loadedmetadata', () => {
      this.showPosterAndDelayPlay(video);
    });
  }

  private showPosterAndDelayPlay(video: HTMLVideoElement): void {
    video.pause(); // Ensure the video doesn't start immediately
    video.currentTime = 0; // Reset the video to the start
    video.volume = 0; // Mute the audio initially for fade-in effect

    setTimeout(() => {
      video.play();
      if (!this.audioEnabled) {
        this.addTimeUpdateListener(video);
      } else {
        this.fadeInAudio(video);
      }
      // this.addTimeUpdateListener(video);
    }, 1500); // Delay of 1500ms before starting playback
  }

  private fadeInAudio(video: HTMLVideoElement): void {
    const fadeDuration = 3000; // 3 seconds for fade-in
    const fadeInterval = 50; // Interval for increasing volume
    const volumeStep = fadeInterval / fadeDuration; // Increment for each interval

    video.muted = false;

    const fadeIn = setInterval(() => {
      if (video.volume < 1.0) {
        video.volume = Math.min(video.volume + volumeStep, 1.0); // Increment volume
      } else {
        clearInterval(fadeIn); // Stop the interval once volume is at maximum
      }
    }, fadeInterval);
  }

  private addTimeUpdateListener(video: HTMLVideoElement): void {
    const maxDuration = 30;
    video.addEventListener('timeupdate', () => {
      if (video.currentTime >= maxDuration) {
        video.pause();
        video.currentTime = 0;
        this.restartVideoAfterPause(video);
      }
    });
  }

  private restartVideoAfterPause(video: HTMLVideoElement): void {
    // Pause for 10 seconds before restarting the video
    setTimeout(() => {
      this.showPosterAndDelayPlay(video); // Restart video
    }, 10000); // 10 seconds pause
  }


  public enableAudio(videoElement: ElementRef<HTMLVideoElement>): void {
    const video: HTMLVideoElement = videoElement.nativeElement;

    if (!this.audioEnabled) {
      this.fadeInAudio(video);
      this.audioEnabled = true; // Set to true to indicate audio has been enabled
    }
  }









  logWindowSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
  }


  private getHeaders(): HttpHeaders {
    const authToken = this.authService.getAuthenticationToken();
    let headers: { [key: string]: string } = {
      'Content-Type': 'application/json'
    };

    if (authToken) {
      headers['Authorization'] = authToken;
    }

    return new HttpHeaders(headers);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 401) {
      this.alertService.showAlert('Not authorized', 'error');
    }
    return throwError(() => { });
  }
}













// positionRightMostVideo(id: string): number {
//   console.log('id',id);
//   const childElement = this.elementRef.nativeElement.querySelector(`#${id}`);
//   console.log('childElement',childElement);
//   if (childElement) {
//     const elementRect = childElement.getBoundingClientRect();
//     const elementXPosition = elementRect.x;
//     const elementWidth = elementRect.width;
//     const displayWidth = window.innerWidth;
//     const rightmostXPosition = elementWidth - (displayWidth - elementXPosition) ;
//     return (rightmostXPosition * -1) - 80;
//   }
//   return 0;
// }