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
  volumeInterval:any;

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
    this.videoJsPlayer.on('fullscreenchange', () => {
      if (this.videoJsPlayer.isFullscreen()) {
        this.onEnterFullscreen();
        this.fullscreen = true;
      } else {
        this.onExitFullscreen();
        this.fullscreen = false;
        clearInterval(this.volumeInterval); 
    }
    });
    this.videoJsPlayer.volume(0.4);
  }


fadeInVolume(): void {
  const targetVolume = 1;
  const increment = 0.05;
  const interval = 1000;
  let currentVolume = 0.4; 
  this.videoJsPlayer.muted(false);
  this.videoJsPlayer.volume(currentVolume);
  this.videoJsPlayer.play();

  if (this.volumeInterval) {
      clearInterval(this.volumeInterval);
  }

  this.volumeInterval = setInterval(() => {
      if (currentVolume < targetVolume) {
          currentVolume += increment;
          this.videoJsPlayer.volume(currentVolume);
      } else {
          clearInterval(this.volumeInterval); 
      }
  }, interval);
}


onEnterFullscreen(): void {
  if (this.videoJsPlayer) {
    this.videoJsPlayer.muted(true);
    this.videoJsPlayer.currentTime(0); 
    this.fadeInVolume();
  }
}

onExitFullscreen(): void {
    if (this.videoJsPlayer) {
      this.hovering = false;
    this.panelVisible = false;
    this.stopVideo();
    this.thumbnailVisible = true;
    }
}


  onHover(): void {
    if (this.volumeInterval) {
      clearInterval(this.volumeInterval);
  }
    this.panelVisible = true;
    clearTimeout(this.videoStartTimeout);
    this.videoStartTimeout = setTimeout(() => {
      if (this.videoJsPlayer.readyState() >= 2 && !this.fullscreen) {
        this.thumbnailVisible = false;
        this.fadeInVolume();
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
    clearInterval(this.volumeInterval);
    if (!this.fullscreen) {
      clearInterval(this.volumeInterval);
      this.thumbnailVisible = true;
      this.stopVideo();
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