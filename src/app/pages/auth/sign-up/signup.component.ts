import { CommonModule } from "@angular/common";
import { Component, ViewChild } from "@angular/core";
import { FormsModule, NgModel } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../services/auth.service";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-signup",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./signup.component.html",
  styleUrl: "./signup.component.scss",
})
export class SigUpComponent {
  public signUpError: string | null = null;

  @ViewChild("name") nameModel!: NgModel;
  @ViewChild("lastname") lastnameModel!: NgModel;
  @ViewChild("email") emailModel!: NgModel;
  @ViewChild("password") passwordModel!: NgModel;
  @ViewChild("passwordConf") passwordConfModel!: NgModel;
  @ViewChild("photoInput") photoInput!: any;

  public user: {
    username: string;
    name: string;
    lastname: string;
    email: string;
    password: string;
    photo: string;
  } = {
    username: "",
    name: "",
    lastname: "",
    email: "",
    password: "",
    photo: "",
  };

  public f: { passwordConf: string } = {
    passwordConf: "",
  };

  previewUrl: string | null = null;
  selectedFile: File | null = null;
  isUploadingPhoto: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    this.selectedFile = file;

    if (!file) {
      this.previewUrl = null;
      return;
    }

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
        this.user.photo = data.secure_url;
      })
      .catch((err) => console.error("Upload error:", err))
      .finally(() => {
        this.isUploadingPhoto = false;
      });
  }

  resetForm() {
    this.previewUrl = null;
    this.selectedFile = null;
    this.signUpError = null;
    if (this.photoInput) {
      this.photoInput.nativeElement.value = null;
    }
  }

  public handleSignup(event: Event) {
    event.preventDefault();
    this.signUpError = null;

    // Marcar campos como tocados
    this.nameModel.control.markAsTouched();
    this.lastnameModel.control.markAsTouched();
    this.emailModel.control.markAsTouched();
    this.passwordModel.control.markAsTouched();
    this.passwordConfModel.control.markAsTouched();

    // Validación básica
    if (
      !this.nameModel.valid ||
      !this.lastnameModel.valid ||
      !this.emailModel.valid ||
      !this.passwordModel.valid ||
      !this.passwordConfModel.valid
    ) {
      this.signUpError = "Por favor completa todos los campos obligatorios.";
      return;
    }

    // Correo válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.user.email)) {
      this.signUpError = "Ingresa un correo electrónico válido.";
      return;
    }

    // Longitud de contraseña
    const len = this.user.password?.length || 0;
    if (len < 8 || len > 16) {
      this.signUpError =
        "La contraseña debe tener entre 8 y 16 caracteres.";
      return;
    }

    // Coincidencia de contraseñas
    if (this.user.password !== this.f.passwordConf) {
      this.signUpError = "Ambas contraseñas deben ser iguales.";
      return;
    }

    // Llamada al backend
    this.authService.signup(this.user).subscribe({
      next: () => {
        this.resetForm();
        this.router.navigateByUrl("/login");
      },
      error: (err: any) => {
        const errorMessage =
          err.error?.message ||
          err.error?.description ||
          "El usuario o correo ya se encuentran registrados.";
        this.signUpError = errorMessage;
      },
    });
  }
}
