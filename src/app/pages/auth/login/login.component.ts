import { CommonModule } from "@angular/common";
import { Component, ViewChild, AfterViewInit } from "@angular/core";
import { FormsModule, NgModel } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../services/auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class LoginComponent implements AfterViewInit {
  // Mensaje que se muestra debajo del botón
  public loginError: string | null = null;

  @ViewChild("email") emailModel!: NgModel;
  @ViewChild("password") passwordModel!: NgModel;

  public loginForm: { email: string; password: string } = {
    email: "",
    password: "",
  };

  constructor(private router: Router, private authService: AuthService) {}

  public handleLogin(event: Event) {
    event.preventDefault();
    this.loginError = null;

    // Validación básica de campos: marcamos como tocados y mostramos mensaje general
    if (!this.emailModel.valid || !this.passwordModel.valid) {
      this.emailModel.control.markAsTouched();
      this.passwordModel.control.markAsTouched();
      this.loginError = "Por favor completa los campos obligatorios.";
      return;
    }

    // Llamada al backend
    this.authService.login(this.loginForm).subscribe({
      next: () => {
        this.loginError = null;
        this.router.navigateByUrl("/app/profile");
      },
      error: (err: any) => {
        const errorMessage =
          err.error?.message ||
          err.error?.description ||
          "El usuario indicado no está registrado o la contraseña es incorrecta.";

        // Solo mostramos mensaje bajo el botón, sin ningún popup
        this.loginError = errorMessage;
      },
    });
  }

  ngAfterViewInit(): void {
    (window as any).google.accounts.id.initialize({
      client_id:
        "813679126446-526bvao7rlou41g1r0g6dgu4fu41tk1d.apps.googleusercontent.com",
      callback: (response: any) =>
        this.handleGoogleCredential(response.credential),
    });

    (window as any).google.accounts.id.renderButton(
      document.getElementById("google-signin-button")!,
      { theme: "outline", size: "large" }
    );
  }

  private decodeJwtToken(token: string): any {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding JWT token:", error);
      return null;
    }
  }

  handleGoogleCredential(token: string) {
    const decoded = this.decodeJwtToken(token);
    if (!decoded) {
      this.loginError = "Error procesando la autenticación con Google.";
      return;
    }

    const googleUser = {
      name: decoded.given_name || "",
      lastname: decoded.family_name || "",
      email: decoded.email || "",
      photoUrl: decoded.picture || "",
      password: decoded.email,
      username: decoded.name,
    };

    this.authService.loginWithGoogle(googleUser).subscribe({
      next: () => {
        this.loginError = null;
      },
      error: (err: any) => {
        const errorMessage =
          err.error?.message ||
          err.error?.description ||
          "El usuario indicado no se encuentra registrado";
        this.loginError = errorMessage;
      },
    });
  }
}
