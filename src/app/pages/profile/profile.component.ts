import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { UserService } from '../../services/user.service';
import { IUser } from '../../interfaces';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  public profileService = inject(ProfileService);
  public userService = inject(UserService);

  public userForm: Partial<IUser> = {
    name: '',
    lastname: '',
    email: '',
    photo: '',
    username: '',
  };

  public idForm: Partial<IUser> = {
    id: 0,
    email: '',
  };

  public passwordForm = {
    email: '',
    newPassword: '',
  };

  previewUrl: string | null = null;
  selectedFile: File | null = null;
  isUploadingPhoto: boolean = false;

  statusMessage = '';
  statusType: 'success' | 'error' | '' = '';

  constructor() {
    // Carga inicial de datos del usuario
    this.profileService.getUserInfoSignal().subscribe(() => {
      const user = this.profileService.user$();
      this.userForm = {
        name: user.name || '',
        lastname: user.lastname || '',
        email: user.email || '',
        username: user.username || '',
        photo: user.photo || '',
      };
      this.idForm = {
        id: user.id || 0,
        email: user.email || '',
      };
      this.passwordForm.email = user.email || '';
    });
  }

  // ------ Mensajes de estado simples (sin SweetAlert) ------
  showStatus(message: string, type: 'success' | 'error' | '' = '') {
    this.statusMessage = message;
    this.statusType = type;

    if (type === 'success') {
      setTimeout(() => {
        this.statusMessage = '';
        this.statusType = '';
      }, 3000);
    }
  }

  // ------ Manejo de selección de foto ------
  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];

    if (!file) {
      return;
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      this.showStatus(
        'Solo se permiten archivos de imagen (JPG, PNG, etc.).',
        'error'
      );
      this.selectedFile = null;
      this.previewUrl = null;
      input.value = '';
      return;
    }

    // Validar tamaño (2 MB aprox.)
    const maxSizeMB = 2;
    if (file.size > maxSizeMB * 1024 * 1024) {
      this.showStatus(
        `La imagen no debe superar los ${maxSizeMB}MB.`,
        'error'
      );
      this.selectedFile = null;
      this.previewUrl = null;
      input.value = '';
      return;
    }

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  // ------ Sube a Cloudinary y actualiza el usuario ------
  confirmPhotoUpload() {
    if (!this.selectedFile) {
      this.showStatus('Primero selecciona una imagen.', 'error');
      return;
    }

    this.isUploadingPhoto = true;
    this.showStatus('', '');

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
          throw new Error('No se recibió la URL de la imagen.');
        }

        // 1) Guardar la URL en el formulario
        this.userForm.photo = data.secure_url;

        // 2) Actualizar usuario en el backend
        this.updateUser(false); // false: no limpiar preview aquí

        // 3) Mensaje
        this.showStatus('Foto actualizada correctamente.', 'success');
      })
      .catch((err) => {
        console.error('Upload error:', err);
        this.showStatus(
          'Error al subir la foto. Inténtalo de nuevo.',
          'error'
        );
      })
      .finally(() => {
        this.isUploadingPhoto = false;
      });
  }

  // ------ Actualizar datos personales ------
  updateUser(resetPreview: boolean = true) {
    this.userService.updateOrSave(this.userForm).subscribe({
      next: () => {
        this.showStatus('Datos personales actualizados.', 'success');

        this.profileService.getUserInfoSignal().subscribe(() => {
          const updatedUser = this.profileService.user$();
          this.userForm = {
            name: updatedUser.name || '',
            lastname: updatedUser.lastname || '',
            email: updatedUser.email || '',
            username: updatedUser.username || '',
            photo: updatedUser.photo || '',
          };
          this.idForm = {
            id: updatedUser.id || 0,
            email: updatedUser.email || '',
          };

          if (resetPreview) {
            this.previewUrl = null;
            this.selectedFile = null;
          }
        });
      },
      error: (err: any) => {
        const msg =
          err.error?.description || err.message || 'Error al actualizar los datos.';
        this.showStatus(msg, 'error');
      },
    });
  }

  // ------ Actualizar contraseña ------
  updatePassword() {
    const length = this.passwordForm.newPassword.length;
    if (length < 8 || length > 16) {
      this.showStatus(
        'La contraseña debe tener entre 8 y 16 caracteres.',
        'error'
      );
      return;
    }

    this.profileService
      .updatePassword(this.passwordForm.email, this.passwordForm.newPassword)
      .subscribe({
        next: () => {
          this.showStatus('Contraseña actualizada correctamente.', 'success');
          this.passwordForm.newPassword = '';
        },
        error: (err: any) => {
          const msg =
            err.error?.description ||
            err.message ||
            'Error al actualizar la contraseña.';
          this.showStatus(msg, 'error');
        },
      });
  }
}
