import { Component, ElementRef, Input, ViewChild, HostListener, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Hls from 'hls.js';
import 'video.js/dist/video-js.css';
import { VideoService } from '@services/video.service';
import { fadeInSlow, fadeOutSlow } from '@utils/animations';
import { ProfileService } from '@services/profile.service';

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

  @Input() hlsPlaylistUrl: string;
  @Input() title: string;
  @Input() description: string;
  @Input() category: string;
  @Input() posterUrlGcs: string;
  @Input() age: string;
  @Input() resolution: string;
  @Input() release_date: string;

  hls: Hls | null = null;

  // videoUrl: string;
  duration: string = '00:00';

  hoverTimeout: any;
  hoverTimeoutVideo: any;
  thumbnailTimeout: any;
  playTimeout: any;

  thumbnailVisible: boolean = true;
  infoVisible: boolean = false;

  hovering: boolean = false;
  isFullscreen: boolean = false;

  constructor(public videoService: VideoService, private profileService: ProfileService) { }

  ngOnInit(): void {
    window.addEventListener('resize', this.videoService.getScreenSize.bind(this));
  }

  ngAfterViewInit() {
    const videoElement: HTMLVideoElement = this.videoPlayer.nativeElement;
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
    // this.videoService.getVideoUrl(fileName, resolution).subscribe({
    //   next: (videoUrl: string) => {
    //     if (videoUrl) {
    //       this.videoUrl = videoUrl;
    if (!this.hlsPlaylistUrl) return;

    if (Hls.isSupported()) {
      this.setupHlsPlayer(this.hlsPlaylistUrl, video);
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      this.setupDefaultPlayer(this.hlsPlaylistUrl, video);
      return;
    }
    //   }
    // },
    // error: (error) => {
    //   console.error('Error setting up video player:', error);
    // }
    // });
  }

  setupHlsPlayer(videoUrl: string, video: HTMLVideoElement) {
    if (this.hls) {
      this.hls.destroy();
    }

    if (video.canPlayType('application/vnd.apple.mpegURL')) {
      video.src = videoUrl;
      video.addEventListener('loadedmetadata', () => {
        this.playVideoWithPromiseHandling(video);
      });
    } else {
      this.hls = new Hls();
      this.hls.loadSource(videoUrl);
      this.hls.attachMedia(video);
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        this.playTimeout = setTimeout(() => {
          this.playVideoWithPromiseHandling(video);
        }, 1000);
      });

      this.hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS Fehler:', data);
      });
    }
  }

  playVideoWithPromiseHandling(video: HTMLVideoElement) {
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          video.play();
        })
        .catch((error) => {
          console.error('Video konnte nicht automatisch abgespielt werden:', error);
        });
    } else {
      console.warn('Play-Promise wird nicht unterstützt.');
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
      this.setupPlayer(preViewName, this.videoService.getScreenSize());
      this.startHoverTimeout();
    }, 900);
    this.thumbnailTimeout = setTimeout(() => {
      this.thumbnailVisible = false;
    }, 1500);
  }

  onLeave() {
    clearTimeout(this.hoverTimeoutVideo);
    clearTimeout(this.thumbnailTimeout);
    clearTimeout(this.playTimeout);
    this.stopVideoPlayer();
    this.hovering = false;
    this.thumbnailVisible = true;
    this.videoPlayer.nativeElement.currentTime = 0;
    if (!this.isFullscreen) {
      this.stopVideoPlayer();
    }
    this.clearHoverTimeout();
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

  showInfo() {
    this.infoVisible = true;
  }

  hideInfo() {
    this.infoVisible = false;
  }

  liked(): boolean {
    const likedList = this.profileService.currentProfileSubject.value?.liked_list ?? [];
    return likedList.includes(this.hlsPlaylistUrl);
  }

  getUrl(url: string): string {
    return url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'));
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.videoService.getScreenSize.bind(this));

    if (this.hls) {
      this.hls.destroy();
    }

    const video: HTMLVideoElement = this.videoPlayer.nativeElement;
    video.removeEventListener('loadedmetadata', () => video.play());
  }
}