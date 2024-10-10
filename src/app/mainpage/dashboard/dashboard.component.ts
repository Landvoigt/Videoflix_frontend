import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoData } from '@interfaces/video.interface';
import { VideoComponent } from '@video/video.component';
import { VideoService } from '@services/video.service';
import { AuthService } from 'src/app/auth/auth.service';
import { SlideshowComponent } from './slideshow/slideshow.component';
import { ProfileService } from '@services/profile.service';
import { fadeInOut, fadeInOutSuperSlow, fadeInSuperSlow, fadeOutSuperSlow } from '@utils/animations';
import videojs from 'video.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, VideoComponent, SlideshowComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  animations: [fadeInSuperSlow, fadeOutSuperSlow, fadeInOut, fadeInOutSuperSlow]
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('previewVideo', { static: true }) previewVideo!: ElementRef<HTMLVideoElement>;
  videoJsPlayer: any;

  videoData: VideoData[] = [];
  previewVideoData!: VideoData;

  volumeInterval: any;
  fadeOutTimeout: any;
  restartTimeout: any;

  previewVideoPlaying: boolean = false;
  thumbnailVisible: boolean = true;
  loading: boolean = true;
  fullscreen: boolean = false;

  constructor(
    public authService: AuthService,
    private profileService: ProfileService,
    public videoService: VideoService) { }

  ngOnInit(): void {
    this.loadVideos();

    this.videoJsPlayer.ready(() => {
      setTimeout(() => {
        this.playPreviewVideo();
        this.scheduleStop();
      }, 2500);
    });
  }

  loadVideos() {
    this.videoData = this.videoService.getVideoData();

    if (this.videoData.length === 0) {
      this.videoService.fetchVideoData(true);
    } else {
      this.getRandomPreviewVideo(this.videoData);
      this.initPlayer();
    }

    this.loading = false;
  }

  getRandomPreviewVideo(videoData: VideoData[]): void {
    if (this.previewVideo) {
      const randomIndex = Math.floor(Math.random() * videoData.length);
      this.previewVideoData = videoData[randomIndex];
    }
  }

  initPlayer(): void {
    const videoElement = this.previewVideo.nativeElement;
    this.initializePlayer(videoElement);
    this.attachEventListeners();
    this.setInitialVolume(0.4);
  }

  initializePlayer(videoElement: HTMLElement): void {
    this.videoJsPlayer = videojs(videoElement, {
      controls: false,
      preload: 'auto',
      muted: true,
      fluid: true,
      disablePictureInPicture: true,
      sources: [
        {
          src: this.previewVideoData.hlsPlaylistUrl,
          type: 'application/x-mpegURL'
        }
      ]
    });
  }

  scheduleStop(): void {
    this.clearTimeouts();

    this.fadeOutTimeout = setTimeout(() => {
      this.fadeOutVolumeAndStop();
    }, 30000);
  }

  fadeOutVolumeAndStop(): void {
    const fadeOutDuration = 3000;
    const steps = 10;
    const intervalDuration = fadeOutDuration / steps;
    let currentVolume = this.videoJsPlayer.volume();
    const volumeDecrement = currentVolume / steps;

    this.thumbnailVisible = true;

    this.volumeInterval = setInterval(() => {
      currentVolume = Math.max(currentVolume - volumeDecrement, 0);
      this.videoJsPlayer.volume(currentVolume);

      if (currentVolume <= 0) {
        clearInterval(this.volumeInterval);
        this.videoJsPlayer.pause();
        this.scheduleReplay();
      }
    }, intervalDuration);
  }

  scheduleReplay(): void {
    this.restartTimeout = setTimeout(() => {
      this.restartVideo();
    }, 10000);
  }

  restartVideo(): void {
    this.clearTimeouts();
    this.thumbnailVisible = false;
    this.videoJsPlayer.currentTime(0);
    this.fadeInVolume();
    this.scheduleStop();
  }

  attachEventListeners(): void {
    this.videoJsPlayer.on('fullscreenchange', this.handleFullscreenChange.bind(this));
  }

  handleFullscreenChange(): void {
    if (this.videoJsPlayer.isFullscreen()) {
      this.onEnterFullscreen();
      this.fullscreen = true;
      this.videoJsPlayer.controls(true);
    } else {
      this.onExitFullscreen();
      this.fullscreen = false;
      this.videoJsPlayer.controls(false);
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
  }

  playPreviewVideo(): void {
    this.clearVolumeFade();
    this.startVideoAfterDelay();
  }

  enterFullscreen() {
    this.videoJsPlayer.requestFullscreen();
  }

  private clearVolumeFade(): void {
    clearInterval(this.volumeInterval);
  }

  private startVideoAfterDelay(): void {
    if (this.videoJsPlayer.readyState() >= 2 && !this.fullscreen) {
      this.videoJsPlayer.play().catch((error: any) => {
        if (error.name === 'AbortError') {
          console.log('Video play was interrupted due to background media restrictions.');
        } else {
          console.error('Error during video playback:', error);
        }
      });
      this.fadeInVolume();
      this.hideThumbnail();
    }
  }

  private hideThumbnail(): void {
    this.thumbnailVisible = false;
  }

  private prepareFullscreen(): void {
    this.videoJsPlayer.muted(true);
    this.videoJsPlayer.currentTime(0);
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

  setInitialVolume(volume: number): void {
    this.videoJsPlayer.volume(volume);
  }

  clearVolumeInterval(): void {
    if (this.volumeInterval) {
      clearInterval(this.volumeInterval);
    }
  }

  toggleMute() {
    const videoElement = this.previewVideo.nativeElement;
    if (videoElement.muted) {
      this.videoService.fadeAudio(videoElement, true);
    } else {
      this.videoService.fadeAudio(videoElement, false);
    }
  }

  unmutePreviewVideoAudio() {
    const videoElement = this.previewVideo.nativeElement;
    this.videoService.fadeAudio(videoElement, true);
  }

  mutePreviewVideoAudio() {
    const videoElement = this.previewVideo.nativeElement;
    this.videoService.fadeAudio(videoElement, false);
  }

  toggleVideoInViewList() {
    if (!this.videoService.updatingViewList) {
      this.videoService.toggleVideoInViewList(this.previewVideoData.hlsPlaylistUrl);
    }
  }

  clearTimeouts() {
    clearTimeout(this.fadeOutTimeout);
    clearTimeout(this.restartTimeout);
    clearInterval(this.volumeInterval);
  }

  getOddVideoData() {
    return this.videoData.filter((_, index) => index % 2 !== 0);
  }

  getEvenVideoData() {
    return this.videoData.filter((_, index) => index % 2 === 0);
  }

  liked(): boolean {
    const likedList = this.profileService.currentProfileSubject.value?.liked_list ?? [];
    return likedList.includes(this.previewVideoData.hlsPlaylistUrl);
  }

  ngOnDestroy(): void {
    this.clearTimeouts();
  }
}