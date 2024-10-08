import { ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoData } from '@interfaces/video.interface';
import { VideoComponent } from '@video/video.component';
import { VideoService } from '@services/video.service';
import { AuthService } from 'src/app/auth/auth.service';
import { SlideshowComponent } from './slideshow/slideshow.component';
import { ProfileService } from '@services/profile.service';
import { fadeInOut, fadeInSuperSlow } from '@utils/animations';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, VideoComponent, SlideshowComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  animations: [fadeInSuperSlow, fadeInOut]
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('previewVideo', { static: true }) previewVideo!: ElementRef<HTMLVideoElement>;
  @ViewChildren(SlideshowComponent) slideshows: QueryList<SlideshowComponent>;

  videoData: VideoData[] = [];

  previewVideoUrl: string = '';
  previewVideoData!: VideoData;
  previewVideoKey: string;

  loading: boolean = true;
  isFullscreen: boolean = false;
  previewVideoPlaying: boolean = false;

  constructor(
    public authService: AuthService,
    private profileService: ProfileService,
    public videoService: VideoService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadVideos();
  }

  loadVideos() {
    this.videoData = this.videoService.getVideoData();

    if (this.videoData.length === 0) {
      this.videoService.fetchVideoData(true);
    } else {
      this.setRandomPreviewVideo(this.videoData);
    }
    
    this.loading = false;
  }

  setRandomPreviewVideo(videoData: VideoData[]): void {
    if (this.previewVideo) {
      const randomIndex = Math.floor(Math.random() * videoData.length);
      this.previewVideoData = videoData[randomIndex];
      this.previewVideoUrl = this.previewVideoData.hlsPlaylistUrl.replace("master", this.videoService.getVideoElementResolution(this.previewVideo.nativeElement));
      this.previewVideoKey = this.previewVideoData.subfolder;
      this.cdr.detectChanges();
      this.setupPreviewVideo(this.previewVideoData.subfolder);
    }
  }

  setupPreviewVideo(videoKey: string): void {
    this.videoService.currentVideo = videoKey;
    this.videoService.maxDuration = 15;
    this.videoService.playPreviewVideo(this.previewVideo, this.previewVideoUrl);
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
    const videoElement = this.previewVideo.nativeElement;
    if (this.isFullscreen && this.previewVideoPlaying) {
      this.previewVideo.nativeElement.muted = false;
      this.videoService.fadeAudio(videoElement, true);
    } else {
      this.videoService.fadeAudio(videoElement, false);
      videoElement.muted = true;
      videoElement.currentTime = 0;
      this.videoService.maxDuration = 15;
      this.previewVideoPlaying = false;
    }
  }

  playPreviewVideo() {
    this.previewVideoPlaying = true;
    this.videoService.currentVideo = this.previewVideoKey;
    this.videoService.playPreviewVideo(this.previewVideo, this.previewVideoUrl);
    this.previewVideo.nativeElement.muted = false;
    //this.videoService.fadeAudio(this.previewVideo.nativeElement, true);
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
      this.videoService.toggleVideoInViewList(this.previewVideoUrl);
    }
  }

  getOddVideoData() {
    return this.videoData.filter((_, index) => index % 2 !== 0);
  }

  getEvenVideoData() {
    return this.videoData.filter((_, index) => index % 2 === 0);
  }

  liked(): boolean {
    const likedList = this.profileService.currentProfileSubject.value?.liked_list ?? [];
    return likedList.includes(this.previewVideoUrl);
  }

  ngOnDestroy(): void {
    clearInterval(this.videoService.intervalId);
  }
}