import { Injectable, inject, signal } from "@angular/core";
import { BaseService } from "./base-service";
import { IUser } from "../interfaces";
import { Observable, tap, catchError } from "rxjs";
import Swal from "sweetalert2";

@Injectable({
  providedIn: "root",
})
export class ProfileService extends BaseService<IUser> {
  protected override source: string = "users/me";
  private userSignal = signal<IUser>({});

  get user$() {
    return this.userSignal;
  }

  getUserInfoSignal() {
    this.findAll().subscribe({
      next: (response: any) => {
        this.userSignal.set(response);
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
  }

  updateUser(userData: Partial<IUser>): Observable<any> {
    return this.customEdit(userData).pipe(
      tap(() => {
        Swal.fire({
          title: "Usuario Modificado!!",
          text: "Puede validar la información",
          icon: "success",
        });
        this.getUserInfoSignal();
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
