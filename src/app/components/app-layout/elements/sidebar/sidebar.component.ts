import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LayoutService } from '../../../../services/layout.service';
import { AuthService } from '../../../../services/auth.service';
import { SvgIconComponent } from '../../../svg-icon/svg-icon.component';
import { routes } from '../../../../app.routes';

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
  public isCollapsed: boolean = false;
  appRoutes: any;

  constructor(private router: Router) {
    this.appRoutes = routes.find(route => route.path === 'app');
    this.permittedRoutes = this.authService.getPermittedRoutes(this.appRoutes?.children || []);
  }

 toggleSidebar() {
  this.isCollapsed = !this.isCollapsed;
  const pageBody = document.querySelector('.page-body');
  if (this.isCollapsed) {
    pageBody?.classList.add('sidebar-collapsed');
  } else {
    pageBody?.classList.remove('sidebar-collapsed');
  }
}

  public logout(): void {
    this.authService.logout(); 
    this.router.navigateByUrl('/login'); 
  }
}
