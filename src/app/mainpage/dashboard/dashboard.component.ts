import { ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoData } from '@interfaces/video.interface';
import { VideoComponent } from '@video/video.component';
import { Observable } from 'rxjs';
import { VideoService } from '@services/video.service';
import { AuthService } from 'src/app/auth/auth.service';
import { SlideshowComponent } from './slideshow/slideshow.component';
import { ProfileService } from '@services/profile.service';
import { fadeInSuperSlow } from '@utils/animations';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, VideoComponent, SlideshowComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  animations: [fadeInSuperSlow]
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('previewVideo', { static: true }) previewVideo!: ElementRef<HTMLVideoElement>;

  previewVideoData$: Observable<VideoData | undefined>;
  videoData: VideoData[] = [];

  videoUrl: string = '';
  currentVideo!: VideoData;
  previewVideoKey: string;

  loading: boolean = false;
  isFullscreen: boolean = false;

  constructor(
    public authService: AuthService,
    private profileService: ProfileService,
    public videoService: VideoService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.getPreviewVideoData();
    this.getVideoDataByCategory();
  }

  getPreviewVideoData(): void {
    this.previewVideoData$ = this.videoService.getPreviewVideoData();
    this.previewVideoData$.subscribe({
      next: (videoData: VideoData | undefined) => {
        if (videoData) {
          this.currentVideo = videoData;
          this.videoUrl = videoData.hlsPlaylistUrl.replace("master", this.videoService.getVideoElementResolution(this.previewVideo.nativeElement));
          this.previewVideoKey = videoData.subfolder;
          this.cdr.detectChanges();
          this.setupPreviewVideo(videoData.subfolder);
        }
      },
      error: (error) => {
        console.error('Error getting random video:', error);
      }
    });
  }

  getVideoDataByCategory(): void {
    this.loading = true;
    this.videoService.getVideoDataByCategory(null).subscribe({
      next: (data: VideoData[]) => {
        this.videoData = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading films:', error);
        this.loading = false;
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

  @HostListener('document:fullscreenchange', ['$event'])
  @HostListener('document:webkitfullscreenchange', ['$event'])
  @HostListener('document:mozfullscreenchange', ['$event'])
  @HostListener('document:MSFullscreenChange', ['$event'])
  handleFullscreenChange(event: Event) {
    this.onFullscreenChange(event);
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
      this.previewVideo.nativeElement.currentTime = 0;
      this.videoService.maxDuration = 15;
    }
  }

  playPreviewVideo() {
    this.videoService.currentVideo = this.previewVideoKey;
    this.videoService.playPreviewVideo(this.previewVideo, this.videoUrl);
    this.previewVideo.nativeElement.muted = true;
    this.videoService.maxDuration = 100000;
    this.requestFullScreen(this.previewVideo.nativeElement);
  }

  toggleMute() {
    const videoElement = this.previewVideo.nativeElement;

    if (videoElement.muted) {
      this.videoService.fadeAudio(videoElement, true);
    } else {
      this.videoService.fadeAudio(videoElement, false);
    }
  }

  toggleVideoInViewList() {
    if (!this.videoService.updatingViewList) {
      this.videoService.toggleVideoInViewList(this.videoUrl);
    }
  }

  liked(): boolean {
    const likedList = this.profileService.currentProfileSubject.value?.liked_list ?? [];
    return likedList.includes(this.videoUrl);
  }

  ngOnDestroy(): void {
    clearInterval(this.videoService.intervalId);
  }
}