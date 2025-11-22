import { inject, Injectable, signal } from '@angular/core';
import { BaseService } from './base-service';
import { ISearch, IUser, IResponse, IUser2 } from '../interfaces';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { AlertService } from './alert.service';
import Swal from 'sweetalert2';
import { HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseService<IUser> {
  protected override source: string = 'users';
  private userListSignal = signal<IUser[]>([]);
  get users$() {
    return this.userListSignal;
  }
  public search: ISearch = { 
    page: 1,
    size: 5
  }
  public totalItems: number [] = [];
  private alertService: AlertService = inject(AlertService);

  getAll() {
    this.findAllWithParams({ page: this.search.page, size: this.search.size}).subscribe({
      next: (response: any) => {
        this.search = {...this.search, ...response.meta};
        this.totalItems = Array.from({length: this.search.totalPages ? this.search.totalPages: 0}, (_, i) => i+1);
        this.userListSignal.set(response.data);
      },
    });
  }


  save(user: IUser) {
    this.add(user).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'An error occurred adding the user','center', 'top', ['error-snackbar']);
      }
    });
  }

  update(user: IUser) {
    this.editCustomSource(`${user.id}`, user).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'An error occurred updating the user','center', 'top', ['error-snackbar']);
      }
    });
  }

  updateOrSave(payload: any) {
    return this.http.put<IResponse<IUser2>>(`${this.source}/update`, payload);
  }
}
