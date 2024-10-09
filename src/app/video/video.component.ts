import { Component, ElementRef, Input, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import videojs from 'video.js';
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
  volumeInterval: any;

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
    this.initializePlayer(videoElement);
    this.attachEventListeners();
    this.setInitialVolume(0.4);
  }

  initializePlayer(videoElement: HTMLElement): void {
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
  }

  attachEventListeners(): void {
    this.videoJsPlayer.on('fullscreenchange', this.handleFullscreenChange.bind(this));
  }

  handleFullscreenChange(): void {
    if (this.videoJsPlayer.isFullscreen()) {
      this.onEnterFullscreen();
      this.fullscreen = true;
    } else {
      this.onExitFullscreen();
      this.fullscreen = false;
      clearInterval(this.volumeInterval);
    }
  }

  setInitialVolume(volume: number): void {
    this.videoJsPlayer.volume(volume);
  }

  fadeInVolume(): void {
    const targetVolume = 1;
    const increment = 0.05;
    const interval = 1000;
    let currentVolume = 0.4;

    this.startPlaybackWithInitialVolume(currentVolume);
    this.clearVolumeInterval();

    this.volumeInterval = setInterval(() => {
      currentVolume = Math.min(currentVolume + increment, targetVolume);
      this.adjustVolume(currentVolume, targetVolume);
    }, interval);
  }

  startPlaybackWithInitialVolume(volume: number): void {
    this.videoJsPlayer.muted(false);
    this.setInitialVolume(volume);
    this.videoJsPlayer.play();
  }

  adjustVolume(currentVolume: number, targetVolume: number): void {
    if (currentVolume < targetVolume) {
      this.videoJsPlayer.volume(currentVolume);
    } else {
      this.clearVolumeInterval();
    }
  }

  clearVolumeInterval(): void {
    if (this.volumeInterval) {
      clearInterval(this.volumeInterval);
    }
  }

  onEnterFullscreen(): void {
    if (!this.videoJsPlayer) return;
    this.prepareFullscreen();
    this.fadeInVolume();
  }

  onExitFullscreen(): void {
    if (!this.videoJsPlayer) return;
    this.resetPanel();
    this.stopVideo();
    this.showThumbnail();
  }

  onHover(): void {
    this.clearVolumeFade();
    this.showPanel();
    this.clearVideoStartTimeout();
    this.startVideoAfterDelay();
  }

  onLeave(): void {
    this.resetHoverState();
    this.clearVideoStartTimeout();
    this.clearVideoStopTimeout();
    this.clearVolumeFade();
    if (!this.fullscreen) {
      this.showThumbnail();
      this.stopVideo();
    }
  }

  stopVideoAfterTimeout(): void {
    this.clearVideoStopTimeout();
    this.videoStopTimeout = setTimeout(() => {
      if (this.videoJsPlayer && !this.fullscreen) {
        this.pauseAndResetVideo();
      }
    }, 30000);
  }

  private prepareFullscreen(): void {
    this.videoJsPlayer.muted(true);
    this.videoJsPlayer.currentTime(0);
  }

  private resetPanel(): void {
    this.hovering = false;
    this.panelVisible = false;
  }

  private showPanel(): void {
    this.panelVisible = true;
  }

  private resetHoverState(): void {
    this.hovering = false;
    this.panelVisible = false;
  }

  private showThumbnail(): void {
    this.thumbnailVisible = true;
  }

  private startVideoAfterDelay(): void {
    this.videoStartTimeout = setTimeout(() => {
      if (this.videoJsPlayer.readyState() >= 2 && !this.fullscreen) {
        this.hideThumbnail();
        this.fadeInVolume();
        this.hovering = true;
        this.stopVideoAfterTimeout();
      }
    }, 1000);
  }

  private hideThumbnail(): void {
    this.thumbnailVisible = false;
  }

  private pauseAndResetVideo(): void {
    this.videoJsPlayer.pause();
    this.videoJsPlayer.currentTime(0);
  }

  private clearVideoStartTimeout(): void {
    clearTimeout(this.videoStartTimeout);
  }

  private clearVideoStopTimeout(): void {
    clearTimeout(this.videoStopTimeout);
  }

  private clearVolumeFade(): void {
    clearInterval(this.volumeInterval);
  }

  stopVideo(): void {
    if (!this.videoJsPlayer) return;
    this.videoJsPlayer.pause();
    this.videoJsPlayer.currentTime(0);
  }

  liked(): boolean {
    const likedList = this.profileService.currentProfileSubject.value?.liked_list ?? [];
    return likedList.includes(this.video.hlsPlaylistUrl);
  }

  showInfo(): void {
    this.infoVisible = true;
  }

  hideInfo(): void {
    this.infoVisible = false;
  }

  ngOnDestroy(): void {
    if (this.videoJsPlayer) { this.videoJsPlayer.dispose(); }
  }
}