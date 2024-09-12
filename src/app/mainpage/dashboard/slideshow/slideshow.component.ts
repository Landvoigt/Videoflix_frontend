import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
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
export class SlideshowComponent implements OnInit {
  @Input() videoData: VideoData[];
  @Input() lineId: string;
  @Input() animationClass: string;
  
  @ViewChild('line', { static: false }) line!: ElementRef<HTMLDivElement>;
  
  thumbnails: string[] = [];
  
  loading: boolean = false;
  showLeftArrow: boolean = false;
  showRightArrow: boolean = true;

  constructor(private renderer: Renderer2, private videoService: VideoService) {
    console.log(this.videoData);
  }

  ngOnInit(): void {
    this.thumbnails = this.videoService.posterUrls.concat(this.videoService.posterUrls);
  }

  scrollLeft(): void {
    if (this.line && this.line.nativeElement) {
      this.line.nativeElement.scrollLeft -= 700;
    }
    this.checkScroll();
  }

  scrollRight(): void {
    if (this.line && this.line.nativeElement) {
      this.line.nativeElement.scrollLeft += 700;
    }
    this.checkScroll();
  }

  checkScroll() {
    const scrollcontainer = this.line?.nativeElement;
    this.showLeftArrow = scrollcontainer.scrollLeft > 0;
    this.showRightArrow = scrollcontainer.scrollWidth > scrollcontainer.scrollLeft + scrollcontainer.clientWidth;
  }

  onElementHover(event: MouseEvent): void {
    const targetElement = event.currentTarget as HTMLElement;
    const rect = targetElement.getBoundingClientRect();
    const containerRect = this.line.nativeElement.getBoundingClientRect();
    let translateX = 0;

    if (rect.x <= containerRect.left + 5) {
      translateX = (containerRect.left - rect.x) + 50;
    } else if ((rect.x + rect.width) >= containerRect.right - 50) {
      translateX = -((rect.x + rect.width) - containerRect.right + 50);
    }

    if (translateX !== 0) {
      this.renderer.addClass(targetElement, 'transition-slow');
      this.renderer.setStyle(targetElement, 'transform', `translateX(${translateX}px)`);
      this.renderer.setStyle(targetElement, 'z-index', '1000');
    }
  }

  onElementLeave(event: MouseEvent): void {
    const targetElement = event.currentTarget as HTMLElement;
    this.renderer.removeClass(targetElement, 'transition-slow');
    this.renderer.removeStyle(targetElement, 'transform');
    this.renderer.removeStyle(targetElement, 'z-index');
  }
}