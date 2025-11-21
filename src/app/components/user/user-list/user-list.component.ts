import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IUser2 } from '../../../interfaces'; // ajusta la ruta si hace falta

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent {
  @Input() title: string = 'Lista de usuarios';
  @Input() users: IUser2[] = [];

  // Para UserAdminComponent (bien tipado)
  @Output() editUser = new EventEmitter<IUser2>();

  // Para UsersComponent (dejamos any para evitar choque IUser / IUser2)
  @Output() callModalAction = new EventEmitter<any>();
  @Output() callDeleteAction = new EventEmitter<any>();

  // ---- Helpers de presentación ----
  getRoleLabel(roleName?: string | null): string {
    switch (roleName) {
      case 'SUPER_ADMIN':
        return 'Administrador';
      case 'ADMIN':
        return 'Moderador';
      case 'USER':
        return 'Usuario';
      default:
        return 'Usuario';
    }
  }

  getRoleClass(roleName?: string | null): string {
    switch (roleName) {
      case 'SUPER_ADMIN':
        return 'chip--role-super';
      case 'ADMIN':
        return 'chip--role-admin';
      case 'USER':
        return 'chip--role-user';
      default:
        return 'chip--role-user';
    }
  }

  getInitials(u: IUser2): string {
    const name = (u.name || '').trim();
    const last = (u.lastname || '').trim();
    const n1 = name ? name[0].toUpperCase() : '';
    const n2 = last ? last[0].toUpperCase() : '';
    const initials = (n1 + n2) || (u.username?.[0]?.toUpperCase() ?? '?');
    return initials;
  }

  // ---- Acciones ----
  onEdit(user: IUser2) {
    // Admin
    this.editUser.emit(user);
    // Pantalla vieja (UsersComponent)
    this.callModalAction.emit(user);
  }

  onDelete(user: IUser2) {
    // Pantalla vieja (UsersComponent)
    this.callDeleteAction.emit(user);
  }
}
