import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { AppLayoutComponent } from './components/app-layout/app-layout.component';
import { SigUpComponent } from './pages/auth/sign-up/signup.component';
import { UsersComponent } from './pages/users/users.component';
import { AuthGuard } from './guards/auth.guard';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';
import { AdminRoleGuard } from './guards/admin-role.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { GuestGuard } from './guards/guest.guard';
import { IRoleType } from './interfaces';
import { ProfileComponent } from './pages/profile/profile.component';
import { RedactarHistoriaComponent } from './pages/redactar-historia/redactar-historia.component';
import { CrearHistoriaComponent } from './pages/crear-historia/crear-historia.component';
import { GenresComponent } from './pages/genres/genres.component';
import { PasswordComponent } from './pages/auth/password/password.component';
import { UserAdminComponent } from './pages/user-admin/user-admin.component';
import { MensajesComponent } from './pages/timeline/timeline.component';
import { PersonajesComponent } from './pages/personajes/personajes.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [GuestGuard],
  },
  {
    path: 'signup',
    component: SigUpComponent,
    canActivate: [GuestGuard],
  },
  {
    path: 'password',
    component: PasswordComponent,
    canActivate: [GuestGuard],
  },
  {
    path: 'access-denied',
    component: AccessDeniedComponent,
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'app',
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'app',
        redirectTo: 'users',
        pathMatch: 'full',
      },
      {
        path: 'users',
        component: UsersComponent,
        canActivate: [AdminRoleGuard],
        data: {
          authorities: [
            IRoleType.admin,
            IRoleType.superAdmin
          ],
          name: 'Users',
          showInSidebar: false
        }
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: {
          authorities: [
            IRoleType.admin,
            IRoleType.superAdmin,
            IRoleType.user
          ],
          name: 'Dashboard',
          showInSidebar: false
        }
      },
      {
        path: 'profile',
        component: ProfileComponent,
        data: {
          authorities: [
            IRoleType.admin,
            IRoleType.superAdmin,
            IRoleType.user
          ],
          name: 'profile',
          showInSidebar: false
        }
      },
       {
  path: 'linetime',
  component: MensajesComponent,
  canActivate: [AuthGuard],
  data: {
    authorities: [IRoleType.admin, IRoleType.superAdmin, IRoleType.user],
    showInSidebar: true
  }
},
      {
        path: "redactarhistoria/:id",
        component: RedactarHistoriaComponent,
        canActivate:[AuthGuard],
        data: { 
          authorities: [
            IRoleType.admin, 
            IRoleType.superAdmin,
            IRoleType.user
          ],
          name: 'Redactar Historia',
          showInSidebar: true
        }
      },
      {
        path: "crearhistoria",
        component: CrearHistoriaComponent,
        canActivate:[AuthGuard],
        data: { 
          authorities: [
            IRoleType.admin, 
            IRoleType.superAdmin,
            IRoleType.user
          ],
          name: 'Crear Historia',
          showInSidebar: true
        }
      },
      {
        path: 'genres',
        component: GenresComponent,
        canActivate:[AdminRoleGuard],
        data: { 
          authorities: [
            IRoleType.admin, 
            IRoleType.superAdmin
          ],
          name: 'Géneros',
          showInSidebar: true
        }
      },
      {
        path: 'Administración de usuarios',
        component: UserAdminComponent,
        canActivate:[AdminRoleGuard],
        data: { 
          authorities: [
            IRoleType.admin, 
            IRoleType.superAdmin
          ],
          name: 'Administración de usuarios',
          showInSidebar: true
        }
      },
        {
  path: 'personajes',
  component: PersonajesComponent,
  canActivate: [AuthGuard],
  data: {
    authorities: [IRoleType.admin, IRoleType.superAdmin, IRoleType.user],
    showInSidebar: true
  }
},
    ],
  },
];
