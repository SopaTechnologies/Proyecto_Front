import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { IForumPost } from '../interfaces';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ForumService {
  private readonly apiUrl = `${environment.apiUrl}/forum`; 
  forumPosts$ = signal<IForumPost[]>([]);
  loading$ = signal(false);

  constructor(private http: HttpClient) {}

  getAll(): void {
    this.loading$.set(true);
    this.http.get<any>(`${this.apiUrl}/public`).subscribe({
      next: response => {
        const posts = response.data || [];
        const mappedPosts: IForumPost[] = posts.map((p: any) => ({
          id: p.id,
          storyId: p.story.id,
          storyTitle: p.story.titulo,
          content: p.story.content,
          genre: p.genre,
          isPublic: p.isPublic,
          publishedAt: p.publishedAt,
          authorName: `${p.author.name} ${p.author.lastname}`,
          readCount: p.views,
          commentCount: p.comments,
          views: p.views,
          comments: p.comments,
          synopsis: p.synopsis
        }));
        this.forumPosts$.set(mappedPosts);
        this.loading$.set(false);
      },
      error: err => {
        console.error('Error al cargar publicaciones:', err);
        this.loading$.set(false);
      }
    });
  }

  create(post: IForumPost): void {
    this.loading$.set(true);
    
    this.http.post<any>(`${this.apiUrl}`, post).subscribe({
      next: response => {
        console.log('Respuesta exitosa:', response);
        alert('¡Historia publicada exitosamente!');
        this.getAll();
        this.loading$.set(false);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error HTTP completo:', error);
        this.loading$.set(false);
        
        if (error.status === 409) {
          alert('Esta historia ya está publicada en el foro');
        } else if (error.status === 403) {
          alert('No tienes permisos para publicar esta historia');
        } else {
          alert(`Error al crear publicación: ${error.status}`);
        }
      }
    });
  }

  update(post: IForumPost): void {
    this.loading$.set(true);
    this.http.put<any>(`${this.apiUrl}/${post.id}`, post).subscribe({
      next: response => {
        this.getAll();
        this.loading$.set(false);
      },
      error: err => {
        console.error('Error al actualizar publicación:', err);
        this.loading$.set(false);
      }
    });
  }

  delete(post: IForumPost): void {
    this.loading$.set(true);
    this.http.delete<any>(`${this.apiUrl}/${post.id}`).subscribe({
      next: () => {
        this.getAll();
        this.loading$.set(false);
      },
      error: err => {
        console.error('Error al eliminar publicación:', err);
        this.loading$.set(false);
      }
    });
  }
}