import { Component, ElementRef, inject} from '@angular/core';
import { NavigationService } from '../services/navigation.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-mainpage',
  standalone: true,
  imports: [],
  templateUrl: './mainpage.component.html',
  styleUrl: './mainpage.component.scss'
})
export class MainpageComponent {

  constructor(public navService: NavigationService, public authService: AuthService) {

  }


  elementRef = inject(ElementRef)


  ngOnInit(): void {
    const lineIds = ['line1', 'line2', 'line3'];
    lineIds.forEach(id => this.scrollElementById(id, 500));
  }


  private scrollElementById(id: string, scrollAmount: number): void {
    setTimeout(() => {
      const element: HTMLElement = this.elementRef.nativeElement.querySelector(`#${id}`);
      if (element) {
        element.scrollLeft += scrollAmount;
      }
    }, 0);
  }


  scrollingRight1() {
    const line1Element: HTMLElement = this.elementRef.nativeElement.querySelector('#line1');
    if (line1Element) {
      line1Element.scrollLeft += 700;
    }
  }


  scrollingLeft1() {
    const line1Element: HTMLElement = this.elementRef.nativeElement.querySelector('#line1');
    if (line1Element) {
      line1Element.scrollLeft += -700;
    }
  }


  scrollingRight2() {
    const line2Element: HTMLElement = this.elementRef.nativeElement.querySelector('#line2');
    if (line2Element) {
      line2Element.scrollLeft += 700;
    }
  }


  scrollingLeft2() {
    const line2Element: HTMLElement = this.elementRef.nativeElement.querySelector('#line2');
    if (line2Element) {
      line2Element.scrollLeft += -700;
    }
  }



  scrollingRight3() {
    const line3Element: HTMLElement = this.elementRef.nativeElement.querySelector('#line3');
    if (line3Element) {
      line3Element.scrollLeft += 700;
    }
  }
  
  
   scrollingLeft3() {
    const line3Element: HTMLElement = this.elementRef.nativeElement.querySelector('#line3');
    if (line3Element) {
      line3Element.scrollLeft += -700;
    }
  }
  

}


 