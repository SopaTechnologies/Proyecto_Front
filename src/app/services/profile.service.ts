import { Injectable, inject, signal } from "@angular/core";
import { BaseService } from "./base-service";
import { IUser } from "../interfaces";
import { Observable, tap, catchError } from "rxjs";
import Swal from "sweetalert2";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root",
})
export class ProfileService extends BaseService<IUser> {
  protected override source: string = "users/me";
  private userSignal = signal<IUser>({});

  public auth = inject(AuthService);

  get user$() {
    return this.userSignal;
  }

  getUserByEmail(email: string): Observable<any> {
    return this.http.get(`users/${email}`);
  }

  getUserInfoSignal() {
    const authUser = localStorage.getItem("auth_user");
    if (authUser) {
      const user = JSON.parse(authUser);
      const email = user.email;
      this.getUserByEmail(email).subscribe({
        next: (response: any) => {
          this.userSignal.set(response.data || response);
        },
        error: (error: any) => {
          Swal.fire({
            title: "Error",
            text: `Error getting user profile info: ${error.message}`,
            icon: "error",
            confirmButtonText: "OK",
          });
        },
      });
    } else {
      console.log("No auth_user in localStorage");
    }
  }

  updatePassword(email: string, newPassword: string): Observable<any> {
    return this.http
      .put(`users/pass/${email}`, { email, password: newPassword })
      .pipe(
        tap(() => {
          Swal.fire({
            title: "Contraseña modificada Exitosamente!!",
            text: "Ahora puede iniciar sesión",
            icon: "success",
          });
        }),
        catchError((error) => {
          Swal.fire({
            title: "Error",
            text: error,
            icon: "error",
          });
          throw error;
        })
      );
  }

  updateEmail(id: number, email: string): Observable<any> {
    return this.http.put(`users/updateEmail/${id}`, { email }).pipe(
      tap(() => {
        Swal.fire({
          title: "Email actualizado exitosamente!!",
          text: "El correo electrónico ha sido actualizado, por favor inicie sesión nuevamente..",
          icon: "success",
          confirmButtonText: "Aceptar",
        }).then(() => {
          this.auth.logout();
          window.location.reload();
        });
      }),
      catchError((error) => {
        Swal.fire({
          title: "Error",
          text: error,
          icon: "error",
        });
        throw error;
      })
    );
  }
}
