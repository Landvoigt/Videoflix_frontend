import { Component, ElementRef, Input, ViewChild, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import Hls from 'hls.js';
import 'video.js/dist/video-js.css';
import { VideoService } from '@services/video.service';

@Component({
  selector: 'app-video',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video.component.html',
  styleUrl: './video.component.scss'
})

export class VideoComponent implements OnInit, OnDestroy {
  @ViewChild('videoPlayer', { static: true }) videoPlayer: ElementRef<HTMLVideoElement>

  @Input() title: string;
  @Input() description: string;
  @Input() category: string;
  @Input() posterUrlGcs: string;

  hls: Hls | null = null;
  isFullscreen: boolean = false;
  hoverClass: boolean = false;
  hoverTimeout: any;
  videoUrl: string = '';

  @HostListener('document:fullscreenchange', ['$event'])
  @HostListener('document:webkitfullscreenchange', ['$event'])
  @HostListener('document:mozfullscreenchange', ['$event'])
  @HostListener('document:MSFullscreenChange', ['$event'])
  handleFullscreenChange(event: Event) {
    this.onFullscreenChange(event);
  }

  constructor(private videoService: VideoService) { }

  ngOnInit(): void {
    this.getScreenSize();
    window.addEventListener('resize', this.getScreenSize.bind(this));
  }

  setupPlayer(fileName: any, resolution: string): void {
    const video: HTMLVideoElement = this.videoPlayer.nativeElement;
    this.videoService.getVideoUrl(fileName, resolution).subscribe({
      next: (videoUrl: string) => {
        if (!videoUrl) {
          console.error(`${resolution} video URL is not set`);
          return;
        }

        if (Hls.isSupported()) {
          this.setupHlsPlayer(videoUrl, video);
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          this.setupDefaultPlayer(videoUrl, video);
          return;
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
    this.hls = new Hls();
    this.hls.loadSource(videoUrl);
    this.hls.attachMedia(video);
    this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play();
    });
    this.hls.on(Hls.Events.ERROR, (event, data) => {
      console.error('HLS error:', data);
    });
  }

  setupDefaultPlayer(videoUrl: string, video: HTMLVideoElement) {
    video.src = videoUrl;
    video.addEventListener('loadedmetadata', () => {
      video.play();
    });

    video.removeEventListener('loadedmetadata', onloadedmetadata);
    video.addEventListener('loadedmetadata', onloadedmetadata);
  }

  onFullscreenChange(event: Event) {
    this.isFullscreen = !!(document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement);

    if (this.isFullscreen) {
      this.stopHoverTimeout();
      this.hoverClass = false;
      const video: HTMLVideoElement = this.videoPlayer.nativeElement;
      video.currentTime = 0;
    } else {
      this.stopVideoPlayer();
      this.hoverClass = true;
    }
  }

  stopVideoPlayer(): void {
    const video: HTMLVideoElement = this.videoPlayer.nativeElement;

    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    } else {
      video.pause();
      video.src = '';
    }
  }

  onHover() {
    const preViewName = this.getUrl(this.posterUrlGcs);

    setTimeout(() => {
      this.hoverClass = true;
    }, 0);

    const resolution = this.getScreenSize();
    this.setupPlayer(preViewName, resolution);
    this.startHoverTimeout();
  }

  onLeave() {
    this.hoverClass = false;
    this.videoPlayer.nativeElement.pause();
    this.videoPlayer.nativeElement.currentTime = 0;
    if (!this.isFullscreen) {
      this.stopVideoPlayer();
    }
    this.clearHoverTimeout();
  }

  startHoverTimeout() {
    this.hoverTimeout = setTimeout(() => {
      this.hoverClass = true;
      const video: HTMLVideoElement = this.videoPlayer.nativeElement;
      video.currentTime = 0;
      video.pause();
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
    const width = window.innerWidth;
    const height = window.innerHeight;
    let resolution: string;

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

  getUrl(url: string): string {
    return url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'));
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