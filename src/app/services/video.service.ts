import Hls from 'hls.js';
import { ElementRef, HostListener, inject, Injectable, NgZone, Renderer2, RendererFactory2 } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  
  //videoPlayer: ElementRef;
  //descriptionUrl: string = "";
  //titleUrl: string = "";
  //videoDataGcs: VideoData[] = []; 
  constructor(
    private http: HttpClient, 
    
  ) {}

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
}
