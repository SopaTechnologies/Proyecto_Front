import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mahou-landing-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mahou-landing-page.component.html',
  styleUrl: './mahou-landing-page.component.scss',
})
export class LandingPageComponent {

  // para mostrar / ocultar el botón de subir
  showScrollTop = false;

  constructor(private router: Router) {}

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToSignup(): void {
    this.router.navigate(['/signup']);
  }

  // se dispara cada vez que haces scroll
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.showScrollTop = window.scrollY > 300;
  }

  // acción del botón: subir rápido arriba
  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
}
