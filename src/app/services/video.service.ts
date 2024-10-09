import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { VideoData } from '@interfaces/video.interface';
import { AlertService } from './alert.service';
import { RestService } from './rest.service';
import { Profile } from 'src/models/profile.model';
import { ErrorService } from './error.service';
import { ProfileService } from './profile.service';

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  private appLoadingSubject = new BehaviorSubject<boolean>(true);
  appLoading$ = this.appLoadingSubject.asObservable();

  private videoLoadingSubject = new BehaviorSubject<boolean>(false);
  videoLoading$ = this.videoLoadingSubject.asObservable();

  private videoData: VideoData[] = [];
  private thumbnailUrls: string[];

  private apiVideoBaseUrl = "http://localhost:8000/api/video/";

  updatingViewList: boolean = false;
  videoDataLoaded: boolean = false;

  constructor(
    private http: HttpClient,
    private errorService: ErrorService,
    private alertService: AlertService,
    private restService: RestService,
    private profileService: ProfileService) { }

  fetchVideoData(forceReload: boolean = false): void {
    if (this.videoData.length === 0 || forceReload) {
      this.http.get<VideoData[]>(`${this.apiVideoBaseUrl}info/`)
        .pipe(catchError(this.errorService.handleApiError))
        .subscribe((data: VideoData[]) => {
          this.videoData = data;
          this.thumbnailUrls = data.map(video => video.posterUrlGcs);
          setTimeout(() => {
            this.videoDataLoaded = true;
            this.setAppLoading(false);
          }, 1000);
        });
    }
  }

  toggleVideoInViewList(url: string) {
    if (!url) return;

    const currentProfile = this.profileService.currentProfileSubject.value;

    if (currentProfile.liked_list && !currentProfile.liked_list.includes(url)) {
      this.updatingViewList = true;
      currentProfile.liked_list.push(url);
      this.updateViewList(currentProfile);
    } else if (currentProfile.liked_list.includes(url)) {
      currentProfile.liked_list = currentProfile.liked_list.filter(listUrl => listUrl !== url);
      this.updatingViewList = true;
      this.updateViewList(currentProfile);
    }
  }

  updateViewList(profile: Profile) {
    this.restService.updateProfile(profile.id, { liked_list: profile.liked_list })
      .subscribe((profile: Profile) => {
        if (profile) {
          this.updatingViewList = false;
        } else {
          this.alertService.showAlert('View List could not be updated', 'error');
          this.updatingViewList = false;
        }
      });
  }

  fadeAudio(videoElement: HTMLVideoElement, fadeIn: boolean) {
    const fadeInDuration = 1000;
    const fadeOutDuration = 50;
    const fadeSteps = 50;

    const fadeInterval = fadeIn ? fadeInDuration / fadeSteps : fadeOutDuration / fadeSteps;
    const volumeStep = 1 / fadeSteps;

    if (fadeIn) {
      videoElement.muted = false;
      let currentVolume = 0;
      videoElement.volume = currentVolume;

      const fadeInInterval = setInterval(() => {
        if (currentVolume < 1) {
          currentVolume += volumeStep;
          videoElement.volume = Math.min(currentVolume, 1);
        } else {
          clearInterval(fadeInInterval);
        }
      }, fadeInterval);
    } else {
      let currentVolume = videoElement.volume;

      const fadeOutInterval = setInterval(() => {
        if (currentVolume > 0) {
          currentVolume -= volumeStep;
          videoElement.volume = Math.max(currentVolume, 0);
        } else {
          clearInterval(fadeOutInterval);
          videoElement.muted = true;
        }
      }, fadeInterval);
    }
  }

  setAppLoading(isLoading: boolean): void {
    this.appLoadingSubject.next(isLoading);
  }

  setVideoLoading(isLoading: boolean): void {
    this.videoLoadingSubject.next(isLoading);
  }

  getVideoData(): VideoData[] {
    return this.videoData;
  }

  getThumbnailUrls(): string[] {
    return this.thumbnailUrls;
  }

  getVideoDataByCategory(category: string): VideoData[] {
    return this.videoData.filter(video => video.category === category);
  }

  getVideoDataByUrls(urls: string[]): VideoData[] {
    if (!urls || urls.length === 0) {
      return [];
    }

    return this.videoData.filter(video => urls.includes(video.hlsPlaylistUrl));
  }
}