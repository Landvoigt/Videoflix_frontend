import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { VideoData } from '@interfaces/video.interface';
import videojs from 'video.js';

@Component({
  selector: 'app-video-test',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-test.component.html',
  styleUrl: './video-test.component.scss'
})
export class VideoTestComponent implements AfterViewInit {
  @ViewChild('videoPlayer', { static: false }) videoPlayer!: ElementRef;
  @Input() video: VideoData;
  videoJsPlayer: any;

  videoPlayTimeout: any;

  thumbnailVisible: boolean = true;

  hovering: boolean = false;
  isFullscreen: boolean;

  stopTimeout: any;

  ngAfterViewInit(): void {
    this.initPlayer();
  }

  initPlayer(): void {
    const videoElement = this.videoPlayer.nativeElement;
    this.videoJsPlayer = videojs(videoElement, {
      controls: true,
      preload: 'auto',
      muted: true,
      fluid: true,
      disablePictureInPicture: true,
      sources: [
        {
          src: this.video.hlsPlaylistUrl,
          type: 'application/x-mpegURL'
        }
      ]
    });

    this.videoJsPlayer.ready(() => {
      console.log('VideoJS Player is ready');
    });
  }

  onHover(): void {
    clearTimeout(this.videoPlayTimeout);
    this.videoPlayTimeout = setTimeout(() => {
      if (this.videoJsPlayer.readyState() >= 2 && !this.isFullscreen) {
        this.thumbnailVisible = false;
        this.playVideo();
        this.hovering = true;
        this.stopVideoAfterTimeout();
      }
    }, 1000);
  }

  stopVideoAfterTimeout(): void {
    clearTimeout(this.stopTimeout);
    this.stopTimeout = setTimeout(() => {
      if (this.videoJsPlayer && !this.isFullscreen) {
        this.videoJsPlayer.pause();
        this.videoJsPlayer.currentTime(0);
      }
    }, 30000);
  }

  onLeave(): void {
    this.hovering = false;
    clearTimeout(this.videoPlayTimeout);
    clearTimeout(this.stopTimeout);
    if (!this.isFullscreen) {
      this.thumbnailVisible = true;
      this.stopVideo();
    }
  }

  playVideo(): void {
    if (this.videoJsPlayer) {
      this.videoJsPlayer.muted(false);
      this.videoJsPlayer.play();
    }
  }

  stopVideo(): void {
    if (this.videoJsPlayer) {
      this.videoJsPlayer.pause();
      this.videoJsPlayer.currentTime(0);
    }
  }

  playVideoWithPromiseHandling(): void {
    if (this.videoJsPlayer) {
      this.videoJsPlayer.muted(true);

      const playPromise = this.videoJsPlayer.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.thumbnailVisible = false;
          })
          .catch((error: any) => {
            console.error('Unable to auto-play video:', error);
          });
      }
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
      if (this.videoJsPlayer) {
        this.videoJsPlayer.muted(false);
        this.videoJsPlayer.currentTime(0);
      }
    } else {
      this.hovering = false;
      this.stopVideo();
      this.thumbnailVisible = true;
    }
  }

  ngOnDestroy(): void {
    if (this.videoJsPlayer) {
      this.videoJsPlayer.dispose();
    }
  }
}