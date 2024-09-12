import { ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoData } from '@interfaces/video.interface';
import { VideoComponent } from '@video/video.component';
import { Observable } from 'rxjs';
import { VideoService } from '@services/video.service';
import { AuthService } from 'src/app/auth/auth.service';
import { SlideshowComponent } from './slideshow/slideshow.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, VideoComponent, SlideshowComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('previewVideo', { static: true }) previewVideo!: ElementRef<HTMLVideoElement>;

  previewVideoData$: Observable<VideoData | undefined>;
  videoData: VideoData[] = [];

  videoUrl: string = '';
  currentVideo!: VideoData;
  previewVideoKey: string;


  loading: boolean = false;
  muted: boolean = true;
  isFullscreen: boolean = false;

  constructor(public authService: AuthService, public videoService: VideoService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.getPreviewVideoData();
    this.getVideoData();
    this.muted = true;
  }

  getPreviewVideoData(): void {
    this.previewVideoData$ = this.videoService.getPreviewVideoData();
    this.previewVideoData$.subscribe({
      next: (video: VideoData | undefined) => {
        if (video) {
          this.getVideoUrl(video.subfolder, this.videoService.getVideoElementResolution(this.previewVideo.nativeElement));
          this.currentVideo = video;
        }
      },
      error: (error) => {
        console.error('Error getting random video:', error);
      }
    });
  }

  getVideoData(): void {
    this.loading = true;
    this.videoService.getVideoData(null).subscribe({
      next: (data: VideoData[]) => {
        this.videoData = data;
        console.log(this.videoData);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading films:', error);
        this.loading = false;
      }
    });
  }

  getVideoUrl(videoKey: string, resolution: string): void {
    this.videoService.getVideoUrl(videoKey, resolution).subscribe({
      next: (url: string) => {
        this.videoUrl = url;
        this.cdr.detectChanges();
        this.previewVideoKey = videoKey;
        this.setupPreviewVideo(videoKey);
      },
      error: (err) => {
        console.error('Error:', err);
      }
    });
  }

  setupPreviewVideo(videoKey: string): void {
    this.videoService.currentVideo = videoKey;
    this.videoService.maxDuration = 15;
    this.videoService.playPreviewVideo(this.previewVideo, this.videoUrl);
    this.previewVideo.nativeElement.muted = true;
  }

  requestFullScreen(video: HTMLVideoElement): void {
    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  }

  onFullscreenChange(event: Event) {
    this.isFullscreen = !!(document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement);
    if (this.isFullscreen) {
      this.previewVideo.nativeElement.muted = false;
    } else {
      this.previewVideo.nativeElement.muted = true;
      this.muted = true;
      this.previewVideo.nativeElement.currentTime = 0;
      this.videoService.maxDuration = 15;
    }
  }

  playPreviewVideo() {
    this.videoService.currentVideo = this.previewVideoKey;
    this.videoService.playPreviewVideo(this.previewVideo, this.videoUrl);
    this.previewVideo.nativeElement.muted = false;
    this.videoService.maxDuration = 100000;
    this.requestFullScreen(this.previewVideo.nativeElement);
  }

  toggleMute() {
    this.previewVideo.nativeElement.muted = !this.previewVideo.nativeElement.muted;
    this.muted = this.previewVideo.nativeElement.muted;
  }

  /// brauchen wir das?
  @HostListener('document:fullscreenchange', ['$event'])
  @HostListener('document:webkitfullscreenchange', ['$event'])
  @HostListener('document:mozfullscreenchange', ['$event'])
  @HostListener('document:MSFullscreenChange', ['$event'])
  handleFullscreenChange(event: Event) {
    this.onFullscreenChange(event);
  }

  ngOnDestroy(): void {
    clearInterval(this.videoService.intervalId);
  }
}