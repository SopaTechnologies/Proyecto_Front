import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { IUser2 } from '../../../app/interfaces/index';
import { HttpClient } from '@angular/common/http';
import { UserListComponent } from '../../components/user/user-list/user-list.component';

@Component({
  selector: 'app-user-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, UserListComponent],
  templateUrl: './user-admin.component.html',
  styleUrl: './user-admin.component.scss',
})
export class UserAdminComponent {
  public signUpError: string = '';
  public validSignup: boolean = false;

  @ViewChild('name') nameModel!: NgModel;
  @ViewChild('lastname') lastnameModel!: NgModel;
  @ViewChild('email') emailModel!: NgModel;
  @ViewChild('photo') photoModel!: NgModel;
  @ViewChild('username') usernameModel!: NgModel;
  @ViewChild('password') passwordModel!: NgModel;
  @ViewChild('role') roleModel!: NgModel;
  @ViewChild('photoInput') photoInput!: any;

  public user: IUser2 = { role: { name: '' } };

  get roleName(): string {
    return this.user.role?.name || '';
  }

  set roleName(value: string) {
    if (!this.user.role) this.user.role = { name: '' };
    this.user.role.name = value;
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient,
    public userService: UserService
  ) {}

  // --- Foto de perfil ---
  previewUrl: string | null = null;
  selectedFile: File | null = null;
  isUploadingPhoto: boolean = false;

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];

    if (!file) {
      return;
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      this.signUpError =
        'Solo se permiten archivos de imagen (JPG, PNG, etc.).';
      this.validSignup = false;
      this.selectedFile = null;
      this.previewUrl = null;
      if (this.photoInput) {
        this.photoInput.nativeElement.value = null;
      }
      return;
    }

    // Validar tamaño (~2 MB)
    const maxSizeMB = 2;
    if (file.size > maxSizeMB * 1024 * 1024) {
      this.signUpError = `La imagen no debe superar los ${maxSizeMB}MB.`;
      this.validSignup = false;
      this.selectedFile = null;
      this.previewUrl = null;
      if (this.photoInput) {
        this.photoInput.nativeElement.value = null;
      }
      return;
    }

    this.signUpError = '';
    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  confirmPhotoUpload() {
    if (!this.selectedFile) {
      this.signUpError = 'Primero selecciona una imagen para subir.';
      this.validSignup = false;
      return;
    }

    this.isUploadingPhoto = true;
    this.signUpError = '';
    this.validSignup = false;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('upload_preset', 'user_photos_unsi');
    formData.append('cloud_name', 'dmbdlq4cx');

    fetch('https://api.cloudinary.com/v1_1/dmbdlq4cx/image/upload', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.secure_url) {
          throw new Error('No se recibió la URL de la imagen desde el servidor.');
        }

        // Guardar URL de foto en el usuario
        this.user.photo = data.secure_url;
        this.validSignup = true;
        this.signUpError = '';
      })
      .catch((err) => {
        console.error('Upload error:', err);
        this.signUpError =
          'Error al subir la foto. Inténtalo de nuevo más tarde.';
        this.validSignup = false;
      })
      .finally(() => {
        this.isUploadingPhoto = false;
      });
  }

  resetForm() {
    this.previewUrl = null;
    this.selectedFile = null;
    this.user = { role: { name: '' } };
    this.signUpError = '';
    this.validSignup = false;
    if (this.photoInput) {
      this.photoInput.nativeElement.value = null;
    }
  }

  public handleSignup(event: Event) {
    event.preventDefault();

    this.signUpError = '';
    this.validSignup = false;

    // Validar email
    if (!this.emailModel?.valid) {
      this.emailModel.control.markAsTouched();
      this.signUpError =
        'Por favor indique un correo válido para actualizar el usuario.';
      return;
    }

    // Validar contraseña si viene (opcional al editar)
    if (this.user.password && this.user.password.trim() !== '') {
      const c = this.user.password.length;
      if (c < 8 || c > 16) {
        this.signUpError =
          'La contraseña debe tener entre 8 y 16 caracteres.';
        return;
      }
    }

    this.ne();
  }

  ne() {
    const payload = {
      email: this.user.email,
      username: this.user.username,
      lastname: this.user.lastname,
      password: this.user.password,
      name: this.user.name,
      photo: this.user.photo,
      status: this.user.status,
      role: {
        name: this.user.role?.name || '',
      },
    };

    this.userService.updateOrSave(payload as IUser2).subscribe({
      next: (response: any) => {
        this.validSignup = true;
        this.signUpError = '';
        this.ngOnInit();
        this.resetForm();
      },
      error: (err: any) => {
        this.validSignup = false;
        this.signUpError = err.error?.description || err.message || 'Error al guardar el usuario.';
      },
    });
  }

  ngOnInit() {
    this.userService.getAll();
  }

  changePage(page: number) {
    if (page >= 1 && page <= (this.userService.search?.totalPages ?? 1)) {
      this.userService.search.page = page;
      this.userService.getAll();
    }
  }

  onEditUser(user: any) {
    this.user = { ...user };
    this.roleName = user.role?.name || '';
    // Limpiar preview cuando se edita
    this.previewUrl = null;
    this.selectedFile = null;
    if (this.photoInput) {
      this.photoInput.nativeElement.value = null;
    }
  }
}
