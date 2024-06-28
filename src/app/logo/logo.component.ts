import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.scss'
})
export class LogoComponent implements OnDestroy {
  letters: string[] = ['V', 'I', 'D', 'E', 'O', 'F', 'L', 'I', 'X'];
  isAnimating: boolean = false;
  isHovering: boolean = false;
  timeoutId: any;

  startAnimation() {
    this.isHovering = true;
    if (!this.isAnimating) {
      this.isAnimating = true;
      this.runAnimation();
    }
  }

  stopAnimation() {
    this.isHovering = false;
  }

  runAnimation() {
    const logoTextDivs = document.querySelectorAll('.logo-text div');
    logoTextDivs.forEach((div: HTMLElement, index: number) => {
      div.style.animation = 'none'; // Reset animation
      div.style.animationDelay = `${index * 0.1}s`; // Slower delay
      setTimeout(() => {
        div.style.animation = ''; // Re-apply animation
        div.classList.add('animating');
      }, 10);
    });

    const animationDuration = (this.letters.length * 0.5 + 1) * 600; // duration of the animation + delay for the last element
    this.timeoutId = setTimeout(() => {
      if (this.isHovering) {
        this.runAnimation();
      } else {
        this.isAnimating = false;
      }
    }, animationDuration);
  }

  ngOnDestroy() {
    clearTimeout(this.timeoutId); // Cleanup on component destroy
  }
}