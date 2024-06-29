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
    const tspans = document.querySelectorAll<SVGTSpanElement>('tspan');
    tspans.forEach((tspan: SVGTSpanElement, index: number) => {
      tspan.style.animation = 'none'; // Reset animation
      tspan.getBBox(); // Trigger reflow to restart the animation
      tspan.style.animationDelay = `${index * 0.1}s`;
      tspan.style.animation = ''; // Re-apply animation
      tspan.classList.add('animating');
    });

    const animationDuration = (this.letters.length * 0.1 + 1.9) * 1000; // duration of the animation + delay for the last element
    this.timeoutId = setTimeout(() => {
      this.isAnimating = false;
      if (this.isHovering) {
        this.startAnimation();
      }
    }, animationDuration);
  }

  ngOnDestroy() {
    clearTimeout(this.timeoutId);
  }
}