import { Injectable, inject, signal } from "@angular/core";
import { BaseService } from "./base-service";
import { IUser } from "../interfaces";
import { Observable, tap, catchError } from "rxjs";
import Swal from "sweetalert2";

@Injectable({
  providedIn: "root",
})
export class ProfileService extends BaseService<IUser> {
  
  private userSignal = signal<IUser>({});

  get user$() {
    return this.userSignal;
  }

  getUserByEmail(email: string): Observable<any> {
    return this.http.get(`users/${email}`);
  }

  getUserInfoSignal() {
    const authUser = localStorage.getItem('auth_user');
    console.log('authUser from localStorage:', authUser);
    if (authUser) {
      const user = JSON.parse(authUser);
      const email = user.email;
      console.log('Email used for API call:', email);
      console.log('Parsed user:', user);
      this.getUserByEmail(email).subscribe({
        next: (response: any) => {
          console.log('User info response:', response);
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
      console.log('No auth_user in localStorage');
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
}
