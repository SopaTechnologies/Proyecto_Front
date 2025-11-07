import { CommonModule } from "@angular/common";
import { Component, ViewChild } from "@angular/core";
import { FormsModule, NgModel } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { UserService } from "../../services/user.service";
import { IUser } from "../../../app/interfaces/index";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import Swal from "sweetalert2";
import { UserListComponent } from "../../components/user/user-list/user-list.component";


@Component({
  selector: "app-user-admin",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, UserListComponent],
  templateUrl: "./user-admin.component.html",
  styleUrl: "./user-admin.component.scss",
})
export class UserAdminComponent {
  public signUpError!: string;
  public validSignup!: boolean;

  
  @ViewChild("name") nameModel!: NgModel;
  @ViewChild("lastname") lastnameModel!: NgModel;
  @ViewChild("email") emailModel!: NgModel;
  @ViewChild("photo") photoModel!: NgModel;
  @ViewChild("username") usernameModel!: NgModel;
  @ViewChild("password") passwordModel!: NgModel;
  @ViewChild("role") roleModel!: NgModel;
  @ViewChild("photoInput") photoInput!: any;

  public user: IUser = { role: { name: '', id: 0, description: '', createdAt: '', updatedAt: '' } };
  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient,
    public userService: UserService
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

  resetForm() {
    this.previewUrl = null;
    this.selectedFile = null;
    this.user = { role: { name: '', id: 0, description: '', createdAt: '', updatedAt: '' } };
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
    }

    if (!this.lastnameModel.valid) {
      this.lastnameModel.control.markAsTouched();
    }

    if (!this.emailModel.valid) {
      this.emailModel.control.markAsTouched();
    }
    if (!this.passwordModel.valid) {
      this.passwordModel.control.markAsTouched();
    }
    if (!this.usernameModel.valid) {
      this.usernameModel.control.markAsTouched();

    }
    if (!this.roleModel.valid) {
      this.roleModel.control.markAsTouched();
    }

    this.ne();
    this.resetForm();
  }

  ne() {
    this.userService.updateOrSave(this.user).subscribe({
      next: (response: any) => {
        this.validSignup = true;
        Swal.fire({
          title: response.message || "Usuario guardado/actualizado correctamente!!",
          text: "Operación completada exitosamente!!",
          icon: "success",
        });
        this.resetForm();
      },
      error: (err: any) => {
        this.signUpError = err.error?.description || err.message;
        Swal.fire({
          title: "Error",
          text: this.signUpError,
          icon: "error",
        });
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
}
