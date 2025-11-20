import { Injectable, inject, signal } from "@angular/core";
import { BaseService } from "./base-service";
import { IUser } from "../interfaces";
import { Observable, tap, catchError, of } from "rxjs";
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

  getUserInfoSignal(): Observable<any> {
    const authUser = localStorage.getItem("auth_user");
    if (authUser) {
      const user = JSON.parse(authUser);
      const email = user.email;
      return this.getUserByEmail(email).pipe(
        tap((response: any) => {
          this.userSignal.set(response.data || response);
        }),
        catchError((error) => {
          Swal.fire({
            title: "Error",
            text: `Error getting user profile info: ${error.message}`,
            icon: "error",
            confirmButtonText: "OK",
          });
          return of(null);
        })
      );
    }
    return of(null);
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
}
