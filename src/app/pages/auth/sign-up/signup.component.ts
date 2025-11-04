import { CommonModule } from "@angular/common";
import { Component, ViewChild } from "@angular/core";
import { FormsModule, NgModel } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../services/auth.service";
import { IUser } from "../../../interfaces";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import Swal from "sweetalert2";

@Component({
  selector: "app-signup",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./signup.component.html",
  styleUrl: "./signup.component.scss",
})
export class SigUpComponent {
  public signUpError!: String;
  public validSignup!: boolean;
  @ViewChild("name") nameModel!: NgModel;
  @ViewChild("lastname") lastnameModel!: NgModel;
  @ViewChild("email") emailModel!: NgModel;
  @ViewChild("photo") photoModel!: NgModel;
  @ViewChild("username") usernameModel!: NgModel;
  @ViewChild("password") passwordModel!: NgModel;
  @ViewChild("photoInput") photoInput!: any;

  public user: IUser = {};

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {}

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
        this.user.photo = data.secure_url;
        console.log("Uploaded:", this.user.photo);
      })
      .catch((err) => console.error("Upload error:", err))
      .finally(() => {
        this.isUploadingPhoto = false;
      });
  }

  resetForm() {
    this.previewUrl = null;
    this.selectedFile = null;
    this.user = {};
    this.signUpError = "";
    this.validSignup = false;
    if (this.photoInput) {
      this.photoInput.nativeElement.value = null;
    }
  }

  public handleSignup(event: Event) {
    event.preventDefault();
    if (!this.nameModel.valid) {
      this.nameModel.control.markAsTouched();
      Swal.fire({
        title: "Error",
        text: "Por favor indique un nombre.",
        icon: "warning",
      });
      return;
    }

    if (!this.lastnameModel.valid) {
      this.lastnameModel.control.markAsTouched();
      Swal.fire({
        title: "Error",
        text: "Por favor indique un apellido",
        icon: "warning",
      });
      return;
    }

    if (!this.emailModel.valid) {
      this.emailModel.control.markAsTouched();
      Swal.fire({
        title: "Error",
        text: "Por favor indique un correo electronico",
        icon: "warning",
      });
      return;
    }
    if (!this.passwordModel.valid) {
      this.passwordModel.control.markAsTouched();
      Swal.fire({
        title: "Error",
        text: "Por favor indique una contraseña",
        icon: "warning",
      });
      return;
    }
    if (!this.usernameModel.valid) {
      this.usernameModel.control.markAsTouched();
      Swal.fire({
        title: "Error",
        text: "Por favor indique un nombre de usuario",
        icon: "warning",
      });
      return;
    }


    this.ne();
    this.resetForm();
  }

  ne() {
    this.authService.signup(this.user).subscribe({
      next: () => {
        this.validSignup = true;
        Swal.fire({
        title: "Usuario registrado correctamente!!",
        text: "Ahora puede ir al inicio de sesión para ingresar!!",
        icon: "success",
      });
      return;
      },
      error: (err: any) => {
        this.signUpError = err.description;
        Swal.fire({
          title: "Usuario registrado correctamente!!",
          text: "Ahora puede ir al inicio de sesión para ingresar!!" + err,
          icon: "success",
        });
        return;
      }
    });
  }
}
