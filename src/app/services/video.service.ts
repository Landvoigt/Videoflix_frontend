import { ElementRef, Injectable, Renderer2, RendererFactory2, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { VideoData } from '@interfaces/video.interface';
import { AlertService } from './alert.service';
import Hls from 'hls.js';
import { RestService } from './rest.service';
import { Profile } from 'src/models/profile.model';
import { ErrorService } from './error.service';
import { ProfileService } from './profile.service';

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  private loadingAppSubject = new BehaviorSubject<boolean>(true);
  loadingApp$ = this.loadingAppSubject.asObservable();

  private videoDataSubject = new BehaviorSubject<VideoData[]>([]);
  videoData$: Observable<VideoData[]> = this.videoDataSubject.asObservable();

  private apiVideoBaseUrl = "http://localhost:8000/api/video/";

  elementRef: ElementRef;
  renderer: Renderer2;

  @ViewChild('videoPlayerMain', { static: false }) videoPlayer: ElementRef<HTMLVideoElement>;

  hls: Hls | null = null;
  audioEnabled: boolean = false;
  currentVideo: string;
  maxDuration: number;
  thumbnailUrls: any;

  videoDataLoaded: boolean = false;
  updatingViewList: boolean = false;

  constructor(
    private http: HttpClient,
    public rendererFactory: RendererFactory2,
    private errorService: ErrorService,
    private alertService: AlertService,
    private restService: RestService,
    private profileService: ProfileService) {

    this.renderer = rendererFactory.createRenderer(null, null);
  }

  fetchVideoData(): void {
    this.http.get<VideoData[]>(`${this.apiVideoBaseUrl}info/`, { headers: this.restService.getHeaders() }).pipe(
      tap((data: VideoData[]) => {
        this.videoDataSubject.next(data);
        this.thumbnailUrls = data.map(video => video.posterUrlGcs);
        this.videoDataLoaded = true;
        this.loadingAppSubject.next(false);
      }),
      catchError(this.errorService.handleApiError)
    ).subscribe();
  }

  getVideoDataByCategory(category: string): Observable<VideoData[]> {
    return this.videoData$.pipe(
      map((data: VideoData[]) => {
        if (!category) {
          return data;
        }
        return data.filter(video => video.category === category);
      })
    );
  }

  getVideoDataByUrls(urls: string[]): Observable<VideoData[]> {
    return this.videoData$.pipe(
      map((data: VideoData[]) => {
        if (!urls || urls.length === 0) {
          return [];
        }

        return data.filter(video => urls.includes(video.hlsPlaylistUrl));
      })
    );
  }

  getPreviewVideoData(): Observable<VideoData | undefined> {
    return this.videoData$.pipe(
      map(videoData => {
        if (videoData.length === 0) {
          return undefined;
        }
        const randomIndex = Math.floor(Math.random() * videoData.length);
        return videoData[randomIndex];
      }),
      catchError(this.errorService.handleApiError)
    );
  }

  playPreviewVideo(videoElement: ElementRef<HTMLVideoElement>, videoUrl: string): void {
    const video: HTMLVideoElement = videoElement.nativeElement;

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
    video.pause();
    video.currentTime = 0;

    setTimeout(() => {
      video.play();
      if (!this.audioEnabled) {
        this.addTimeUpdateListener(video);
      }
    }, 1500);
  }

  intervalId: any;
  public addTimeUpdateListener(video: HTMLVideoElement): void {
    video.addEventListener('timeupdate', () => {
      if (video.currentTime >= this.maxDuration) {
        clearInterval(this.intervalId);
        video.pause();
        video.currentTime = 0;
        this.intervalId = setInterval(() => {
          video.play();
        }, 10000);
      }
    });
  }

  logWindowSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
  }

  toggleVideoInViewList(url: string) {
    if (!url) return;

    const currentProfile = this.profileService.currentProfileSubject.value;

    if (currentProfile.liked_list && !currentProfile.liked_list.includes(url)) {
      this.updatingViewList = true;
      currentProfile.liked_list.push(url);
      this.updateViewList(currentProfile);
    } else if (currentProfile.liked_list.includes(url)) {
      currentProfile.liked_list = currentProfile.liked_list.filter(listUrl => listUrl !== url);
      this.updatingViewList = true;
      this.updateViewList(currentProfile);
    }
  }

  updateViewList(profile: Profile) {
    this.restService.updateProfile(profile.id, { liked_list: profile.liked_list })
      .subscribe((profile: Profile) => {
        if (profile) {
          this.updatingViewList = false;
        } else {
          this.alertService.showAlert('View List could not be updated', 'error');
          this.updatingViewList = false;
        }
      });
  }

  fadeAudio(videoElement: HTMLVideoElement, fadeIn: boolean) {
    const fadeInDuration = 1000;
    const fadeOutDuration = 50;
    const fadeSteps = 50;

    const fadeInterval = fadeIn ? fadeInDuration / fadeSteps : fadeOutDuration / fadeSteps;
    const volumeStep = 1 / fadeSteps;

    if (fadeIn) {
      videoElement.muted = false;
      let currentVolume = 0;
      videoElement.volume = currentVolume;

      const fadeInInterval = setInterval(() => {
        if (currentVolume < 1) {
          currentVolume += volumeStep;
          videoElement.volume = Math.min(currentVolume, 1);
        } else {
          clearInterval(fadeInInterval);
        }
      }, fadeInterval);
    } else {
      let currentVolume = videoElement.volume;

      const fadeOutInterval = setInterval(() => {
        if (currentVolume > 0) {
          currentVolume -= volumeStep;
          videoElement.volume = Math.max(currentVolume, 0);
        } else {
          clearInterval(fadeOutInterval);
          videoElement.muted = true;
        }
      }, fadeInterval);
    }
  }

  setLoadingApp(isLoading: boolean): void {
    this.loadingAppSubject.next(isLoading);
  }

  getScreenSize(): string {
    const width: number = window.innerWidth;
    const height: number = window.innerHeight;

    if (width >= 1920 && height >= 1080) {
      return '1080p';
    } else if (width >= 1280 && height >= 720) {
      return '720p';
    } else if (width >= 854 && height >= 480) {
      return '480p';
    } else {
      return '360p';
    }
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
}