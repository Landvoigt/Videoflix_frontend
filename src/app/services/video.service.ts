import { ElementRef, Injectable, ViewChild } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class VideoService {

  
 private apiUrl = 'http://localhost:8000';

  
constructor(private http: HttpClient) {}




// getVideoUrls(videoKey: string, resolution: string): Observable<string[]> {
//   const apiUrl = `${this.apiUrl}/get-video-url/?video_key=${videoKey}&resolution=${resolution}`;

//   return this.http.get<any>(apiUrl).pipe(
//     map(data => {
//       if (data && data.video_url) {
//         return [data.video_url];
//       } else {
//         throw new Error('Invalid response format from server');
//       }
//     }),
//     catchError(error => {
//       console.error('Error fetching video URL:', error);
//       return throwError('Failed to fetch video URL');
//     })
//   );
// }





// getPosterUrls(): Observable<{ poster_urls: string[] }> {
//   return this.http.get<{ poster_urls: string[] }>(`${this.apiUrl}/get_poster_urls/`);
// }







  // private hoverSubject = new BehaviorSubject<boolean>(false);
  // hoverState$ = this.hoverSubject.asObservable();
  // getVideoDetails(videoKey: string, resolution: string): Observable<any> {
  //   return this.http.get<any>(`${this.apiUrl}?video_key=${videoKey}&resolution=${resolution}`);
  // }
}
