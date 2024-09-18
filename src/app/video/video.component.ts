import { Component, ElementRef, Input, ViewChild, HostListener, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Hls from 'hls.js';
import 'video.js/dist/video-js.css';
import { VideoService } from '@services/video.service';
import { fadeInSlow, fadeOutSlow } from '@utils/animations';
import { ProfileService } from '@services/profile.service';
import { VideoData } from '@interfaces/video.interface';

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

  @Input() video: VideoData;

  hls: Hls | null = new Hls({ maxLoadingDelay: 1000 });
  duration: string = '00:00';

  hoverTimeout: any;
  hoverTimeoutVideo: any;
  thumbnailTimeout: any;
  playTimeout: any;

  thumbnailVisible: boolean = true;
  infoVisible: boolean = false;

  hovering: boolean = false;
  hoveringInProgress: boolean = false;
  isFullscreen: boolean = false;

  constructor(public videoService: VideoService, private profileService: ProfileService) { }

  ngOnInit(): void {
    this.addResizeListener();
  }

  ngAfterViewInit() {
    this.addMetadataListener();
  }

  setupPlayer(): void {
    const video: HTMLVideoElement = this.videoPlayer.nativeElement;
    if (!this.video.hlsPlaylistUrl) return;

    if (Hls.isSupported()) {
      this.setupHlsPlayer(this.video.hlsPlaylistUrl, video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      this.setupDefaultPlayer(this.video.hlsPlaylistUrl, video);
    }
  }

  setupHlsPlayer(videoUrl: string, video: HTMLVideoElement) {
    this.destroyHls();

    if (video.canPlayType('application/vnd.apple.mpegURL')) {
      this.setupDefaultPlayer(videoUrl, video);
    } else {
      this.hls = new Hls();
      this.hls.loadSource(videoUrl);
      this.hls.attachMedia(video);

      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        this.playVideoWithDelay(video, 1000);
      });

      this.hls.on(Hls.Events.ERROR, (event, data) => {
        this.handleHlsError(event, data);
      });

      this.hls.on(Hls.Events.LEVEL_LOADED, () => {
        this.hideThumbnail();
      });
    }
  }

  setupDefaultPlayer(videoUrl: string, video: HTMLVideoElement) {
    video.src = videoUrl;

    video.addEventListener('loadedmetadata', () => {
      this.playVideoWithPromiseHandling(video);
    }, { once: true });

    video.addEventListener('playing', () => {
      this.hideThumbnail();
    }, { once: true });
  }

  playVideoWithDelay(video: HTMLVideoElement, delay: number = 0) {
    this.playTimeout = setTimeout(() => {
      this.playVideoWithPromiseHandling(video);
    }, delay);
  }

  playVideoWithPromiseHandling(video: HTMLVideoElement) {
    video.play().then(() => {
      this.hideThumbnail();
    }).catch((error) => {
      console.error('Unable to auto-play video:', error);
    });
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
    if (!this.isFullscreen && !this.hoveringInProgress) {
      this.hoveringInProgress = true;
      this.videoPlayer.nativeElement.muted = true;

      this.hoverTimeoutVideo = setTimeout(() => {
        this.hovering = true;
        this.setupPlayer();
        this.startHoverTimeout();
      }, 750);
    }
  }

  onLeave() {
    if (!this.isFullscreen) {
      this.clearAllTimeouts();
      this.stopVideoPlayer();
      this.hovering = false;
      this.thumbnailVisible = true;
      this.videoPlayer.nativeElement.currentTime = 0;
      this.hoveringInProgress = false;
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
    this.isFullscreen = !!document.fullscreenElement;
    if (this.isFullscreen) {
      clearTimeout(this.hoverTimeout);
      this.hovering = false;
      this.mutePreviewVideo();
      this.videoPlayer.nativeElement.muted = false;
      this.videoPlayer.nativeElement.currentTime = 0;
    } else {
      this.stopVideoPlayer();
      this.unmutePreviewVideo();
      this.thumbnailVisible = true;
      this.hovering = false;
      this.hoveringInProgress = false;
    }
  }

  startHoverTimeout() {
    this.hoverTimeout = setTimeout(() => {
      this.videoPlayer.nativeElement.pause();
    }, 25000);
  }

  handleHlsError(event: any, data: any) {
    if (data.fatal) {
      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          console.error('Network error occurred. Details:', data);
          break;
        case Hls.ErrorTypes.MEDIA_ERROR:
          console.error('Media error occurred. Details:', data);
          this.hls.recoverMediaError();
          break;
        default:
          console.error('Fatal error occurred. Details:', data);
          break;
      }
    } else if (data.details === Hls.ErrorDetails.LEVEL_LOAD_ERROR) {
      console.log('Non-fatal level load error occurred, continuing...');
    } else {
      console.error('Unhandled non-fatal error occurred. Details:', data);
    }
  }

  showInfo() {
    this.infoVisible = true;
  }

  hideInfo() {
    this.infoVisible = false;
  }

  mutePreviewVideo() {
    const previewVideo: HTMLVideoElement = document.getElementById('previewVideo') as HTMLVideoElement;
    if (previewVideo) {
      previewVideo.muted = true;
    }
  }

  unmutePreviewVideo() {
    const previewVideo: HTMLVideoElement = document.getElementById('previewVideo') as HTMLVideoElement;
    if (previewVideo) {
      previewVideo.muted = false;
      previewVideo.currentTime = 0;
    }
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${this.pad(minutes)}:${this.pad(secs)}`;
  }

  pad(value: number): string {
    return value.toString().padStart(2, '0');
  }

  getUrl(url: string): string {
    return url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'));
  }

  liked(): boolean {
    const likedList = this.profileService.currentProfileSubject.value?.liked_list ?? [];
    return likedList.includes(this.video.hlsPlaylistUrl);
  }

  clearAllTimeouts() {
    if (this.hoverTimeoutVideo) {
      clearTimeout(this.hoverTimeoutVideo);
      this.hoverTimeoutVideo = null;
    }
    if (this.thumbnailTimeout) {
      clearTimeout(this.thumbnailTimeout);
      this.thumbnailTimeout = null;
    }
    if (this.playTimeout) {
      clearTimeout(this.playTimeout);
      this.playTimeout = null;
    }
  }

  addResizeListener() {
    window.addEventListener('resize', this.videoService.getScreenSize.bind(this));
  }

  removeResizeListener() {
    window.removeEventListener('resize', this.videoService.getScreenSize.bind(this));
  }

  addMetadataListener() {
    const videoElement: HTMLVideoElement = this.videoPlayer.nativeElement;
    videoElement.addEventListener('loadedmetadata', this.loadedMetadataHandler);
  }

  removeMetadataListener() {
    const videoElement: HTMLVideoElement = this.videoPlayer.nativeElement;
    videoElement.removeEventListener('loadedmetadata', this.loadedMetadataHandler);
  }

  hideThumbnail() {
    setTimeout(() => {
      this.thumbnailVisible = false;
    }, 700);
  }

  destroyHls() {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
  }

  private loadedMetadataHandler = () => {
    const videoElement: HTMLVideoElement = this.videoPlayer.nativeElement;
    const seconds = videoElement.duration;
    this.duration = this.formatDuration(seconds);
  }

  ngOnDestroy(): void {
    this.destroyHls();
    this.clearAllTimeouts();
    this.removeResizeListener();
    this.removeMetadataListener();
  }
}