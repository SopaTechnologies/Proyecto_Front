import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LayoutService } from '../../../../services/layout.service';
import { AuthService } from '../../../../services/auth.service';
import { SvgIconComponent } from '../../../svg-icon/svg-icon.component';
import { routes } from '../../../../app.routes';

type NavSection = 'historias' | 'menu' | 'juego' | null;

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    SvgIconComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  public layoutService = inject(LayoutService);
  public authService = inject(AuthService);

  public permittedRoutes: Route[] = [];
  public appRoutes: any;

  // Secciones del nav
  public activeSection: NavSection = null;

  public historiasRoutes: Route[] = [];
  public menuRoutes: Route[] = [];
  public juegoRoutes: Route[] = [];

  constructor(private router: Router) {
    this.appRoutes = routes.find(route => route.path === 'app');
    this.permittedRoutes = this.authService.getPermittedRoutes(this.appRoutes?.children || []);

    this.buildGroups();
  }

  private buildGroups(): void {
    // Ajusta estos nombres a como tengas definidas las rutas en app.routes
    const historiasPaths = ['histories', 'forum', 'Linea de tiempo', 'personajes'];
    const menuPaths = ['dashboard', 'profile', 'Administración de usuarios', 'users'];
    const juegoPaths = ['game', 'game-lobby', 'game-board'];

    this.historiasRoutes = this.filterRoutes(historiasPaths);
    this.menuRoutes = this.filterRoutes(menuPaths);
    this.juegoRoutes = this.filterRoutes(juegoPaths);
  }

  private filterRoutes(allowedPaths: string[]): Route[] {
    return this.permittedRoutes.filter(
      route => !!route.path && allowedPaths.includes(route.path as string)
    );
  }

  public setActiveSection(section: NavSection): void {
    this.activeSection = this.activeSection === section ? null : section;
  }

  public logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
