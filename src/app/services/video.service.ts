import Hls from 'hls.js';
import { ElementRef, HostListener, inject, Injectable, NgZone, Renderer2, RendererFactory2, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { VideoResponse } from '../interfaces/video.interface';


// export interface VideoData {
//   subfolder: string;
//   description: string;
//   title: string;
//   posterUrlGcs?: string; 
//   category: string;
// }

@Injectable({
  providedIn: 'root',
})


export class VideoService {
  elementRef: ElementRef;
  renderer: Renderer2;
  @ViewChild('videoPlayerMain', { static: false }) videoPlayer: ElementRef<HTMLVideoElement>;
  //videoPlayer: ElementRef;
  //descriptionUrl: string = "";
  //titleUrl: string = "";
  //videoDataGcs: VideoData[] = []; 
  constructor(
    private http: HttpClient,
    rendererFactory: RendererFactory2,
      
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  private apiUrl = "http://localhost:8000/poster-and-text/";

  private videoDataSubject = new BehaviorSubject<any[]>([]);
  videoData$ = this.videoDataSubject.asObservable();

  
  fetchAndStoreVideoData(): void {
    this.getVideoData().pipe(
      map(data => {
        return data.gcs_video_text_data.map((item: any) => {
          const posterUrl = data.poster_urls.find((url: string) => url.includes(item.subfolder));
          return {
            subfolder: item.subfolder,
            title: item.title,
            description: item.description,
            posterUrlGcs: posterUrl,
            category: item.category
          };
        });
      }),
      catchError(error => {
        console.error('Error fetching video data:', error);
        return [];
      })
    ).subscribe(processedData => {
      this.videoDataSubject.next(processedData);
    });
  }


 
   getStoredVideoData(): Observable<any[]> {
    return this.videoData$;
  }



  getVideoData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`);
  }


  logWindowSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    //console.log(`Aktuelle Breite: ${width}px, Aktuelle Höhe: ${height}px`);
  }



  getResolutionForVideoElement(): string {
    const video: HTMLVideoElement = this.videoPlayer.nativeElement;
    const width = video.clientWidth;

    if (width >= 1920) {
      return '1080p';
    } else if (width >= 1280) {
      return '720p';
    } else if (width >= 854) {
      return '480p';
    } else {
      return '360p';
    }
  }


  // positionRightMostVideo(id: string): number {
  //   console.log('id',id);
  //   const childElement = this.elementRef.nativeElement.querySelector(`#${id}`);
  //   console.log('childElement',childElement);
  //   if (childElement) {
  //     const elementRect = childElement.getBoundingClientRect();
  //     const elementXPosition = elementRect.x;
  //     const elementWidth = elementRect.width;
  //     const displayWidth = window.innerWidth;
  //     const rightmostXPosition = elementWidth - (displayWidth - elementXPosition) ;
  //     return (rightmostXPosition * -1) - 80;
  //   }
  //   return 0;
  // }


  
  
}
