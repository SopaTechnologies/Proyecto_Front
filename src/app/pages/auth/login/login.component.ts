import { CommonModule } from "@angular/common";
import { Component, ViewChild } from "@angular/core";
import { FormsModule, NgModel } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../services/auth.service";
import { AfterViewInit, OnInit } from "@angular/core";
import Swal from "sweetalert2";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class LoginComponent implements AfterViewInit {
  public loginError!: string;

  @ViewChild("email") emailModel!: NgModel;
  @ViewChild("password") passwordModel!: NgModel;

  public loginForm: { email: string; password: string } = {
    email: "",
    password: "",
  };

  constructor(private router: Router, private authService: AuthService) {}

  public handleLogin(event: Event) {
    event.preventDefault();
    if (!this.emailModel.valid) {
      this.emailModel.control.markAsTouched();
      Swal.fire({
        title: "Error",
        text: "Por favor indique un Correo",
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
    if (this.emailModel.valid && this.passwordModel.valid) {
      this.authService.login(this.loginForm).subscribe({
        next: () => this.router.navigateByUrl("/app/dashboard"),
        error: (err: any) => (this.loginError = err.error.description),
      });
    }
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
      this.loginError = "Error processing Google authentication.";
      return;
    }

    const googleUser = {
      name: decoded.given_name || "",
      lastname: decoded.family_name || "",
      email: decoded.email || "",
      photoUrl: decoded.picture || "",
      password: decoded.email,
    };

    this.authService.loginWithGoogle(googleUser).subscribe({
      next: (response: any) => {
        this.router.navigateByUrl("/app/dashboard");
        Swal.fire({
          title: "Usuario registrado correctamente!!",
          text:
            "Ahora puede ir al inicio de sesión para ingresar!! " +
            "Ingrese con su correo y contraseña igual a su correo, recuerde cambiar la contraseña luego.",
          icon: "success",
        });
      },
      error: (err: any) => {
        this.loginError =
          err.error?.message || "Error with Google authentication.";
      },
    });
  }
}
