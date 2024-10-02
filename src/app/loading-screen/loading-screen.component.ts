import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { VideoService } from '@services/video.service';
import { fadeInOut } from '@utils/animations';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-loading-screen',
  standalone: true,
  imports: [],
  templateUrl: './loading-screen.component.html',
  styleUrl: './loading-screen.component.scss',
  animations: [fadeInOut]
})
export class LoadingScreenComponent implements OnDestroy, AfterViewInit {
  @ViewChild('loadingOverlay', { static: true }) loadingOverlay!: ElementRef;
  private loadingTimeout!: any;
  private hideLoadingTimeout!: any;
  private loadingSubscription!: Subscription;

  constructor(private videoService: VideoService, private router: Router) { }

  ngAfterViewInit() {
    this.loadingSubscription = this.videoService.loadingApp$.subscribe(isLoading => {
      if (isLoading) {
        this.showLoadingAnimation();
        this.startLoadingTimeout();
      } else {
        this.hideLoadingAnimation();
        this.clearLoadingTimeout();
      }
    });

    if (!this.videoService.videoDataLoaded) {
      this.videoService.fetchVideoData();
    }
  }

  showLoadingAnimation() {
    this.loadingOverlay.nativeElement.classList.add('active');
  }

  hideLoadingAnimation() {
    this.hideLoadingTimeout = setTimeout(() => {
      this.loadingOverlay.nativeElement.classList.remove('active');
    }, 500);
  }

  startLoadingTimeout() {
    this.loadingTimeout = setTimeout(() => {
      this.router.navigate(['/error']);
      this.videoService.setLoadingApp(false);
    }, 10000);
  }

  clearLoadingTimeout() {
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
  }

  ngOnDestroy() {
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
    if (this.hideLoadingTimeout) {
      clearTimeout(this.hideLoadingTimeout);
    }
  }
}