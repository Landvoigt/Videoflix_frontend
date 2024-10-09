import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { VideoData } from '@interfaces/video.interface';
import { VideoService } from '@services/video.service';
import { VideoComponent } from '@video/video.component';

@Component({
  selector: 'app-slideshow',
  standalone: true,
  imports: [CommonModule, VideoComponent],
  templateUrl: './slideshow.component.html',
  styleUrl: './slideshow.component.scss'
})
export class SlideshowComponent implements OnInit, OnDestroy {
  @Input() videoData: VideoData[];
  @Input() animationClass: string;

  @ViewChild('slide', { static: false }) slide!: ElementRef<HTMLDivElement>;

  thumbnails: string[] = [];
  loadedImages = 0;
  imagesLoaded = false;

  loading: boolean = false;
  hovering: boolean = false;

  showLeftArrow: boolean = false;
  showRightArrow: boolean = true;

  constructor(private renderer: Renderer2, private videoService: VideoService) { }

  ngOnInit(): void {
    this.thumbnails = this.videoService.getThumbnailUrls().concat(this.videoService.getThumbnailUrls());
    window.addEventListener('resize', this.onResize.bind(this));
  }

  onImageLoad() {
    this.loadedImages++;
    if (this.loadedImages === this.thumbnails.length) {
      this.imagesLoaded = true;
    }
  }

  scroll(direction: 'left' | 'right'): void {
    const screenWidth = window.innerWidth;
    const videoWidth = 313;
    const gapWidth = screenWidth * 0.5;
    const scrollAmount = videoWidth + gapWidth;

    if (this.slide && this.slide.nativeElement) {
      const scrollcontainer = this.slide.nativeElement;
      const maxScrollLeft = scrollcontainer.scrollWidth - scrollcontainer.clientWidth;

      if (direction === 'left') {
        scrollcontainer.scrollLeft = Math.max(scrollcontainer.scrollLeft - scrollAmount, 0);
      } else {
        scrollcontainer.scrollLeft = Math.min(scrollcontainer.scrollLeft + scrollAmount, maxScrollLeft);
      }
    }
  }

  onResize() {
    if (!this.hovering) {
      const screenWidth = window.innerWidth;
      const videoWidth = 313;
      const gapWidth = screenWidth * 0.5;
      const scrollAmount = videoWidth + gapWidth;

      const scrollcontainer = this.slide?.nativeElement;
      const currentScroll = scrollcontainer.scrollLeft;

      const videoIndex = Math.round(currentScroll / scrollAmount);

      const maxScrollLeft = scrollcontainer.scrollWidth - scrollcontainer.clientWidth;
      const newScrollLeft = videoIndex * scrollAmount;

      scrollcontainer.scrollLeft = Math.min(newScrollLeft, maxScrollLeft);

      this.checkScroll();
    }
  }

  checkScroll() {
    const screenWidth = window.innerWidth;
    const scrollcontainer = this.slide?.nativeElement;
    const videoWidth = 313;
    const gapWidth = window.innerWidth * 0.5;
    const scrollAmount = videoWidth + gapWidth;

    this.showLeftArrow = scrollcontainer.scrollLeft > 0;

    const maxScrollLeft = scrollcontainer.scrollWidth - scrollcontainer.clientWidth;
    const isAtEnd = scrollcontainer.scrollLeft + scrollAmount >= maxScrollLeft;

    this.showRightArrow = screenWidth > 768 ? scrollcontainer.scrollWidth > scrollcontainer.scrollLeft + scrollcontainer.clientWidth : !isAtEnd;
  }

  onElementHover(event: MouseEvent): void {
    this.hovering = true;
    const screenWidth = window.innerWidth;

    if (screenWidth > 768) {
      const targetElement = event.currentTarget as HTMLElement;
      const rect = targetElement.getBoundingClientRect();
      const containerRect = this.slide.nativeElement.getBoundingClientRect();
      let translateX = 0;

      if (rect.x <= containerRect.left + 30 && this.showLeftArrow) {
        translateX = (containerRect.left - rect.x) + 30;
      } else if ((rect.x + rect.width) >= containerRect.right - 50 && this.showRightArrow) {
        translateX = -((rect.x + rect.width) - containerRect.right + 30);
      }

      if (translateX !== 0) {
        this.renderer.addClass(targetElement, 'transition-slow');
        this.renderer.setStyle(targetElement, 'transform', `translateX(${translateX}px)`);
        this.renderer.setStyle(targetElement, 'z-index', '1000');
      }
    }
  }

  onElementLeave(event: MouseEvent): void {
    const screenWidth = window.innerWidth;

    if (screenWidth > 768) {
      const targetElement = event.currentTarget as HTMLElement;
      this.renderer.removeClass(targetElement, 'transition-slow');
      this.renderer.removeStyle(targetElement, 'transform');
      this.renderer.removeStyle(targetElement, 'z-index');
    }

    this.hovering = false;
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize.bind(this));
  }
}