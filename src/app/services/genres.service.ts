import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IGenre } from '../interfaces';

interface ApiResponse<T> {
  data: T;
  message: string;
  meta?: {
    totalPages: number;
    totalElements: number;
    pageNumber: number;
    pageSize: number;
  };
}

@Injectable({ providedIn: 'root' })
export class GenresService {
  private readonly apiUrl = 'genres';
  genres$ = signal<IGenre[]>([]);
  search = { page: 1, size: 10, pageNumber: 1 };
  totalItems: number[] = [];
  totalPages = 0;
  totalElements = 0;

  constructor(private http: HttpClient) {}

  getAll(): void {
    const params = `?page=${this.search.page}&size=${this.search.size}`;
    this.http.get<ApiResponse<IGenre[]>>(`${this.apiUrl}${params}`).subscribe({
      next: response => {
        this.genres$.set(response.data);
        if (response.meta) {
          this.totalPages = response.meta.totalPages;
          this.totalElements = response.meta.totalElements;
          this.search.pageNumber = response.meta.pageNumber;
          this.totalItems = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        }
      },
      error: err => console.error('Error al cargar géneros:', err)
    });
  }

  save(genre: IGenre): void {
    this.http.post<ApiResponse<IGenre>>(this.apiUrl, genre).subscribe({
      next: response => {
        this.genres$.update(g => [...g, response.data]);
        this.getAll();
      },
      error: err => console.error('Error al guardar género:', err)
    });
  }

  update(genre: IGenre): void {
    this.http.put<ApiResponse<IGenre>>(`${this.apiUrl}/${genre.id}`, genre).subscribe({
      next: response => {
        this.genres$.update(g =>
          g.map(item => (item.id === response.data.id ? response.data : item))
        );
      },
      error: err => console.error('Error al actualizar género:', err)
    });
  }

  delete(id: number): void {
    this.http.delete<ApiResponse<IGenre>>(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.genres$.update(g => g.filter(item => item.id !== id));
        this.getAll();
      },
      error: err => console.error('Error al eliminar género:', err)
    });
  }
}