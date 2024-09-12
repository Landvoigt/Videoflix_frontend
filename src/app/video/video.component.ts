import { Component, ElementRef, Input, ViewChild, HostListener, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Hls from 'hls.js';
import 'video.js/dist/video-js.css';
import { VideoService } from '@services/video.service';
import { fadeInSlow, fadeOutSlow } from '@utils/animations';

@Component({
  selector: 'app-video',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video.component.html',
  styleUrl: './video.component.scss',
  animations: [fadeInSlow, fadeOutSlow]
})

export class VideoComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('videoPlayer', { static: true }) videoPlayer: ElementRef<HTMLVideoElement>

  @Input() title: string;
  @Input() description: string;
  @Input() category: string;
  @Input() posterUrlGcs: string;
  @Input() age: string;
  @Input() resolution: string;
  @Input() release_date: string;

  hls: Hls | null = null;

  videoUrl: string = '';
  duration: string = '00:00';

  hoverTimeout: any;
  hoverTimeoutVideo: any;
  thumbnailTimeout: any;
  playTimeout: any;

  thumbnailVisible: boolean = true;
  infoVisible: boolean = false;

  hovering: boolean = false;
  isFullscreen: boolean = false;

  constructor(private videoService: VideoService) { }

  ngOnInit(): void {
    this.getScreenSize();
    window.addEventListener('resize', this.getScreenSize.bind(this));
  }

  ngAfterViewInit() {
    const videoElement = this.videoPlayer.nativeElement;
    videoElement.addEventListener('loadedmetadata', () => {
      const seconds = videoElement.duration;
      this.duration = this.formatDuration(seconds);
    });
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${this.pad(minutes)}:${this.pad(secs)}`;
  }

  pad(value: number): string {
    return value.toString().padStart(2, '0');
  }

  setupPlayer(fileName: any, resolution: string): void {
    const video: HTMLVideoElement = this.videoPlayer.nativeElement;
    this.videoService.getVideoUrl(fileName, resolution).subscribe({
      next: (videoUrl: string) => {
        if (videoUrl) {
          if (Hls.isSupported()) {
            this.setupHlsPlayer(videoUrl, video);
            return;
          }

          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            this.setupDefaultPlayer(videoUrl, video);
            return;
          }
        }
      },
      error: (error) => {
        console.error('Error setting up video player:', error);
      }
    });
  }

  setupHlsPlayer(videoUrl: string, video: HTMLVideoElement) {
    if (this.hls) {
      this.hls.destroy();
    }

    if (video.canPlayType('application/vnd.apple.mpegURL')) {
      video.src = videoUrl;
      video.play();
    } else {
      this.hls = new Hls();
      this.hls.loadSource(videoUrl);
      this.hls.attachMedia(video);
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setTimeout(() => video.play().catch(err => console.error('Playback error:', err)), 500);
      });
    }
  }

  setupDefaultPlayer(videoUrl: string, video: HTMLVideoElement) {
    video.src = videoUrl;

    video.addEventListener('loadedmetadata', () => {
      video.play().catch(error => {
        console.error('Error attempting to play the video:', error);
      });
    }, { once: true });
  }

  onFullscreenChange(event: Event) {
    this.isFullscreen = !!(document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement);

    if (this.isFullscreen) {
      this.stopHoverTimeout();
      this.hovering = false;
      const video: HTMLVideoElement = this.videoPlayer.nativeElement;
      video.currentTime = 0;
      video.muted = false;
      clearTimeout(this.hoverTimeout);
    } else {
      this.stopVideoPlayer();
      this.hovering = true;
    }
  }

  stopVideoPlayer(): void {
    const video: HTMLVideoElement = this.videoPlayer.nativeElement;
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    } else {
      setTimeout(() => {
        video.pause();
        video.src = '';
      }, 100);
    }
  }

  onHover() {
    const preViewName = this.getUrl(this.posterUrlGcs);
    this.videoPlayer.nativeElement.muted = true;
    this.hoverTimeoutVideo = setTimeout(() => {
      this.hovering = true;
      const resolution = this.getScreenSize();
      this.setupPlayer(preViewName, resolution);
      this.startHoverTimeout();
    }, 900);
    this.thumbnailTimeout = setTimeout(() => {
      this.thumbnailVisible = false;
    }, 1500);
  }

  onLeave() {
    clearTimeout(this.hoverTimeoutVideo);
    clearTimeout(this.thumbnailTimeout);
    this.stopVideoPlayer();
    this.hovering = false;
    this.thumbnailVisible = true;
    this.videoPlayer.nativeElement.currentTime = 0;
    if (!this.isFullscreen) {
      this.stopVideoPlayer();
    }
    this.clearHoverTimeout();
  }

  startHoverTimeout() {
    this.hoverTimeout = setTimeout(() => {
      this.hovering = true;
      const video: HTMLVideoElement = this.videoPlayer.nativeElement;
      video.currentTime = 0;
      video.pause()
    }, 25000);
  }

  stopHoverTimeout() {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
  }

  clearHoverTimeout() {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
  }

  getScreenSize(): string {
    let resolution: string;
    const width: number = window.innerWidth;
    const height: number = window.innerHeight;

    if (width >= 1920 && height >= 1080) {
      resolution = '1080p';
    } else if (width >= 1280 && height >= 720) {
      resolution = '720p';
    } else if (width >= 854 && height >= 480) {
      resolution = '480p';
    } else {
      resolution = '360p';
    }
    return resolution;
  }

  showInfo() {
    this.infoVisible = true;
  }

  hideInfo() {
    this.infoVisible = false;
  }

  getUrl(url: string): string {
    return url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'));
  }

  @HostListener('document:fullscreenchange', ['$event'])
  @HostListener('document:webkitfullscreenchange', ['$event'])
  @HostListener('document:mozfullscreenchange', ['$event'])
  @HostListener('document:MSFullscreenChange', ['$event'])
  handleFullscreenChange(event: Event) {
    this.onFullscreenChange(event);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.getScreenSize.bind(this));

    if (this.hls) {
      this.hls.destroy();
    }
    const video: HTMLVideoElement = this.videoPlayer.nativeElement;
    video.removeEventListener('loadedmetadata', () => video.play());
  }
}