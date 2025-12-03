import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sopa-landing-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sopa-landing-page.component.html',
  styleUrl: './sopa-landing-page.component.scss',
})
export class SopaLandingPageComponent {
  // para mostrar / ocultar el botón de subir
  showScrollTop = false;

  constructor(private router: Router) {}

  // volver al landing principal de Mahou
  goToMahou(): void {
    this.router.navigate(['/']);
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
