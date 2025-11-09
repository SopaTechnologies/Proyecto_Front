import { Component, ViewChild } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { FormsModule, NgModel } from "@angular/forms";
import { CommonModule } from "@angular/common";
import Swal from "sweetalert2";
import { AuthService } from "../../../services/auth.service";
import { NgbCollapse } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-password",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgbCollapse],
  templateUrl: "./password.component.html",
  styleUrl: "./password.component.scss",
})
export class PasswordComponent {
  constructor(private router: Router, private authService: AuthService) {}

  public passError!: string;

  @ViewChild("email") emailModel!: NgModel;
  @ViewChild("password") passwordModel!: NgModel;
  @ViewChild("passConf") passworConfirModel!: NgModel;

  public passForm: { email: string; password: string } = {
    email: "",
    password: "",
  };

  public f : {passwordConf: string} = {
    passwordConf: ""
  }

  
  public passChange(event: Event) {
    event.preventDefault();
    if (!this.emailModel.control.valid) {
      Swal.fire({
        title: "Error",
        text: "Por favor indique un Correo",
        icon: "warning",
      });
      return;
    }
    
    if (!this.passwordModel.control.valid) {
      Swal.fire({
        title: "Error",
        text: "Por favor indique una contraseña",
        icon: "warning",
      });
      return;
    }

    if (this.passForm.password != this.f.passwordConf){
      console.log(this.f.passwordConf, this.passForm.password);
      Swal.fire({
        title: "Error",
        text: "La contraseña debe ser igual a la anterior",
        icon: "warning",
      });
      return;
    }

    else {
      this.authService.pass(this.passForm).subscribe({
        next: (response: any) => {
          this.router.navigateByUrl("/login");
          Swal.fire({
            title: "Contraseña modificada Exitosamente!!",
            text: "Ahora puede iniciar sesión",
            icon: "success",
          });
        },

        error: (err: any) => {
          const errorMessage = err.error?.message || err.error?.description || "El usuario indicado no se encuentra registrado";
          this.passError = errorMessage;
          Swal.fire({
            title: "Error",
            text: errorMessage,
            icon: "error",
          });
        },
      });
    }
  }
}
