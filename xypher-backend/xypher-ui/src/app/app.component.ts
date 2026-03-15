import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  currentBg = 0;
  private interval: any;
  private readonly totalSlides = 4;
  private readonly slideInterval = 20000;

  ngOnInit() {
    this.interval = setInterval(() => {
      this.currentBg = (this.currentBg + 1) % this.totalSlides;
    }, this.slideInterval);
  }

  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
  }

  goToSlide(index: number) {
    this.currentBg = index;
  }
}