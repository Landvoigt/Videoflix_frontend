import { Component, ElementRef, Input, ViewChild, HostListener, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { VideoService } from '@services/video.service';
import { fadeInSlow, fadeOutSuperSlow } from '@utils/animations';
import { ProfileService } from '@services/profile.service';
import { VideoData } from '@interfaces/video.interface';

@Component({
  selector: 'app-video',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video.component.html',
  styleUrl: './video.component.scss',
  animations: [fadeInSlow, fadeOutSuperSlow]
})

export class VideoComponent implements OnDestroy, AfterViewInit {
  @ViewChild('videoPlayer', { static: false }) videoPlayer: ElementRef<HTMLVideoElement>
  @Input() video: VideoData;

  videoJsPlayer: any;

  videoStartTimeout: any;
  videoStopTimeout: any;

  hovering: boolean = false;
  fullscreen: boolean = false;

  thumbnailVisible: boolean = true;
  panelVisible: boolean = false;
  infoVisible: boolean = false;

  constructor(public videoService: VideoService, private profileService: ProfileService) { }

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
    this.panelVisible = true;
    clearTimeout(this.videoStartTimeout);
    this.videoStartTimeout = setTimeout(() => {
      if (this.videoJsPlayer.readyState() >= 2 && !this.fullscreen) {
        this.thumbnailVisible = false;
        this.playVideo();
        this.hovering = true;
        this.stopVideoAfterTimeout();
      }
    }, 1000);
  }

  onLeave(): void {
    this.hovering = false;
    this.panelVisible = false;
    clearTimeout(this.videoStartTimeout);
    clearTimeout(this.videoStopTimeout);
    if (!this.fullscreen) {
      this.thumbnailVisible = true;
      this.stopVideo();
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
    this.fullscreen = !!(document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement);

    if (this.fullscreen) {
      if (this.videoJsPlayer) {
        this.videoJsPlayer.muted(false);
        this.videoJsPlayer.currentTime(0);
      }
    } else {
      this.hovering = false;
      this.panelVisible = false;
      this.stopVideo();
      this.thumbnailVisible = true;
    }
  }

  stopVideoAfterTimeout(): void {
    clearTimeout(this.videoStopTimeout);
    this.videoStopTimeout = setTimeout(() => {
      if (this.videoJsPlayer && !this.fullscreen) {
        this.videoJsPlayer.pause();
        this.videoJsPlayer.currentTime(0);
      }
    }, 30000);
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

  liked(): boolean {
    const likedList = this.profileService.currentProfileSubject.value?.liked_list ?? [];
    return likedList.includes(this.video.hlsPlaylistUrl);
  }

  showInfo() {
    this.infoVisible = true;
  }

  hideInfo() {
    this.infoVisible = false;
  }

  ngOnDestroy(): void {
    if (this.videoJsPlayer) {
      this.videoJsPlayer.dispose();
    }
  }
}