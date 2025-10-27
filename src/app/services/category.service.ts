import { inject, Injectable, signal } from '@angular/core';
import { ICategory, IResponse, ISearch } from '../interfaces';
import { BaseService } from './base-service';
import { AuthService } from './auth.service';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})

export class CategoryService extends BaseService<ICategory> {
  protected override source: string = 'categories';
    private categorySignal = signal<ICategory[]>([]);
    get categories$() {
        return this.categorySignal;
    }
    public search: ISearch = {
        page: 1,
        size: 10
    }
    public totalItems: any = [];
    private authService: AuthService = inject(AuthService);
    private alertService: AlertService = inject(AlertService);
    getAll() {
        this.findAllWithParams({ page: this.search.page, size: this.search.size }).subscribe({
            next: (response: IResponse<ICategory[]>) => {
                this.search = { ...this.search, ...response.meta };
                this.totalItems = Array.from({ length: this.search.totalPages ? this.search.totalPages : 0 }, (_, i) => i + 1);
                this.categorySignal.set(response.data);
            },
            error: (err: any) => {
                console.error('error', err);
            }
    });
    }

    save(item: ICategory) {
        this.add(item).subscribe({
            next: (response: IResponse<ICategory>) => {
                this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
                this.getAll();
            },
            error: (err: any) => {
                this.alertService.displayAlert('error', 'An error occurred adding the category','center', 'top', ['error-snackbar']);
                console.error('error', err);
            }
        });
    }
    update(item: ICategory) {
        this.customEdit(item).subscribe({
            next: (response: IResponse<ICategory>) => {
                this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
                this.getAll();
            },
            error: (err: any) => {
                this.alertService.displayAlert('error', 'An error occurred updating the category','center', 'top', ['error-snackbar']);
                console.error('error', err);
            }
        });
    }

    delete(item: ICategory) {
        this.del(item.id).subscribe({
            next: (response: IResponse<ICategory>) => {
                this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
                this.getAll();
            },
            error: (err: any) => {
                this.alertService.displayAlert('error', 'An error occurred deleting the category','center', 'top', ['error-snackbar']);
                console.error('error', err);
            }
        });
    }
}