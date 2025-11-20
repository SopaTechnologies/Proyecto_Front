import { CommonModule } from "@angular/common";
import { Component, ViewChild } from "@angular/core";
import { FormsModule, NgModel } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../services/auth.service";

@Component({
  selector: "app-password",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./password.component.html",
  styleUrl: "./password.component.scss",
})
export class PasswordComponent {
  constructor(private router: Router, private authService: AuthService) {}

  public passError: string | null = null;

  @ViewChild("email") emailModel!: NgModel;
  @ViewChild("password") passwordModel!: NgModel;
  @ViewChild("passwordConf") passwordConfModel!: NgModel;

  public passForm: { email: string; password: string } = {
    email: "",
    password: "",
  };

  public f: { passwordConf: string } = {
    passwordConf: "",
  };

  public passChange(event: Event) {
    event.preventDefault();
    this.passError = null;

    // Marcar todos como tocados
    this.emailModel.control.markAsTouched();
    this.passwordModel.control.markAsTouched();
    this.passwordConfModel.control.markAsTouched();

    // Validación básica de campos requeridos
    if (
      !this.emailModel.valid ||
      !this.passwordModel.valid ||
      !this.passwordConfModel.valid
    ) {
      this.passError = "Por favor completa todos los campos obligatorios.";
      return;
    }

    // Longitud de contraseña
    const c = this.passForm.password?.length || 0;
    if (c < 8 || c > 16) {
      this.passError =
        "La contraseña debe tener entre 8 y 16 caracteres.";
      return;
    }

    // Coincidencia de contraseñas
    if (this.passForm.password !== this.f.passwordConf) {
      this.passError = "Ambas contraseñas deben ser iguales.";
      return;
    }

    // Llamar al backend para cambiar contraseña
    this.authService.pass(this.passForm).subscribe({
      next: () => {
        this.passError = null;
        this.router.navigateByUrl("/login");
      },
      error: (err: any) => {
        const errorMessage =
          err.error?.message ||
          err.error?.description ||
          "El usuario indicado no se encuentra registrado.";
        this.passError = errorMessage;
      },
    });
  }
}
