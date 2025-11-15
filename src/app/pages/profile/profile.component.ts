import { Component, inject, ViewChild } from "@angular/core";
import { ProfileService } from "../../services/profile.service";
import { CommonModule } from "@angular/common";
import { FormsModule, NgModel } from "@angular/forms";
import { IUser } from "../../interfaces";

import Swal from "sweetalert2";
import { UserService } from "../../services/user.service";
@Component({
  selector: "app-profile",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./profile.component.html",
  styleUrl: "./profile.component.scss",
})
export class ProfileComponent {
  public profileService = inject(ProfileService);

  public userService = inject(UserService);

  @ViewChild("email") emailModel!: NgModel;
  @ViewChild("password") passwordModel!: NgModel;

  public userForm: Partial<IUser> = {
    name: "",
    lastname: "",
    email: "",
    photo: "",
    username: ""
  };

  public idForm: Partial<IUser> ={
    id: 0,
    email:""
  }

  previewUrl: string | null = null;
  selectedFile: File | null = null;
  isUploadingPhoto: boolean = false;

  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
  confirmPhotoUpload() {
    if (!this.selectedFile) return;

    this.isUploadingPhoto = true;

    const formData = new FormData();
    formData.append("file", this.selectedFile);
    formData.append("upload_preset", "user_photos_unsi");
    formData.append("cloud_name", "dmbdlq4cx");

    fetch("https://api.cloudinary.com/v1_1/dmbdlq4cx/image/upload", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        this.userForm.photo = data.secure_url;
        Swal.fire({
          title: "Foto publicada!!",
          text: "Foto subida correctamente!!",
          icon: "success",
        });
      })
      .catch((err) => console.error("Upload error:", err))
      .finally(() => {
        this.isUploadingPhoto = false;
      });
  }

  public passwordForm = {
    email: "",
    newPassword: "",
  };

  constructor() {
    this.profileService.getUserInfoSignal();
  }

  ngOnInit() {
    setTimeout(() => {
      const user = this.profileService.user$();
      this.userForm = {
        name: user.name || "",
        lastname: user.lastname || "",
        email: user.email || "",
        username: user.username || "",
      };
      this.idForm = {
        id: user.id || 0,
        email: user.email || "",
      }
      this.passwordForm.email = user.email || "";
    }, 100);
  }

  updateUser() {
    this.userService.updateOrSave(this.userForm).subscribe({
      next: (response: any) => {
        Swal.fire({
          title:
            response.message || "Usuario actualizado correctamente!!",
          text: "Operación completada exitosamente!!",
          icon: "success",
          confirmButtonText: "ok",
        });
        this.ngOnInit();
      },
      error: (err: any) => {
        const rr = err.error?.description || err.message;
        Swal.fire({
          title: "Error",
          text: rr,
          icon: "error",
        });
      },
    });
  }

  updatePassword() {
    const c = this.passwordForm.newPassword.length;
    if (c < 8 || c > 16) {
      Swal.fire({
        title: "Error",
        text: "La contraseña debe ser mayor o igual 8 caracteres y menor o igual a 16 !!",
        icon: "warning",
      });
      return;
    }
    this.profileService
      .updatePassword(this.passwordForm.email, this.passwordForm.newPassword)
      .subscribe();
  }
}
