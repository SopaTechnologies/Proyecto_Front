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
import { RedactarHistoriaComponent } from './components/histories/redactar-historia/redactar-historia.component';
import { CrearHistoriaComponent } from './components/histories/crear-historia/crear-historia.component';
import { GenresComponent } from './pages/genres/genres.component';
import { PasswordComponent } from './pages/auth/password/password.component';
import { UserAdminComponent } from './pages/user-admin/user-admin.component';
import { MensajesComponent } from './pages/timeline/timeline.component';
import { PersonajesComponent } from './pages/personajes/personajes.component';
import { HistoriesCardComponent } from './pages/histories/histories.component';

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
      // {
      //   path: 'users',
      //   component: UsersComponent,
      //   canActivate: [AdminRoleGuard],
      //   data: {
      //     authorities: [
      //       IRoleType.admin,
      //       IRoleType.superAdmin
      //     ],
      //     name: 'Users',
      //     showInSidebar: false
      //   }
      // },
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
        path: 'profile',
        component: ProfileComponent,
        data: {
          authorities: [
            IRoleType.admin,
            IRoleType.superAdmin,
            IRoleType.user
          ],
          name: 'Perfil',
          showInSidebar: false
        }
      },
       {
  path: 'Linea de tiempo',
  component: MensajesComponent,
  canActivate: [AuthGuard],
  data: {
    authorities: [IRoleType.admin, IRoleType.superAdmin, IRoleType.user],
    showInSidebar: true
  }
},
      {
        path: "histories",
        component: HistoriesCardComponent,
        canActivate:[AuthGuard],
        data: { 
          authorities: [
            IRoleType.admin, 
            IRoleType.superAdmin,
            IRoleType.user
          ],
          name: 'Historias',
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
