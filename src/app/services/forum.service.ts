import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IForumPost } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8080/forum'; // ajusta si usas otra URL

  // estado reactivo
  forumPosts$ = signal<IForumPost[]>([]);
  loading$ = signal(false);

  constructor() {}

  getAll(): void {
    this.loading$.set(true);
    this.http.get<any>(`${this.apiUrl}/public`).subscribe({
      next: (response) => {
        const posts = response?.data || [];
        const mappedPosts: IForumPost[] = posts.map((p: any) => ({
          id: p.id,
          storyId: p.story?.id,
          storyTitle: p.story?.titulo ?? p.story?.title ?? '',
          content: p.story?.content,
          genre: p.genre,
          isPublic: p.isPublic,
          publishedAt: p.publishedAt,
          authorName: `${p.author?.name ?? ''} ${p.author?.lastname ?? ''}`.trim(),
          views: p.views,
          comments: p.comments,
          synopsis: p.synopsis
        }));
        this.forumPosts$.set(mappedPosts);
        this.loading$.set(false);
      },
      error: (err) => {
        console.error('Error al cargar publicaciones:', err);
        this.loading$.set(false);
      }
    });
  }

  create(payload: IForumPost): void {
    this.loading$.set(true);
    this.http.post<any>(this.apiUrl, payload).subscribe({
      next: (response) => {
        const created = response?.data;
        if (created) {
          const current = this.forumPosts$();
          this.forumPosts$.set([
            {
              id: created.id,
              storyId: created.story?.id,
              storyTitle: created.story?.titulo ?? '',
              content: created.story?.content,
              genre: created.genre,
              isPublic: created.isPublic,
              publishedAt: created.publishedAt,
              authorName: `${created.author?.name ?? ''} ${created.author?.lastname ?? ''}`.trim(),
              views: created.views,
              comments: created.comments,
              synopsis: created.synopsis
            },
            ...current
          ]);
        }
        this.loading$.set(false);
      },
      error: (err) => {
        console.error('Error al crear publicación:', err);
        this.loading$.set(false);
      }
    });
  }

  update(payload: IForumPost): void {
    if (!payload.id) return;

    this.loading$.set(true);
    this.http.put<any>(`${this.apiUrl}/${payload.id}`, payload).subscribe({
      next: (response) => {
        const updated = response?.data;
        if (updated) {
          const current = this.forumPosts$();
          const mapped = current.map((p) =>
            p.id === updated.id
              ? {
                  id: updated.id,
                  storyId: updated.story?.id,
                  storyTitle: updated.story?.titulo ?? '',
                  content: updated.story?.content,
                  genre: updated.genre,
                  isPublic: updated.isPublic,
                  publishedAt: updated.publishedAt,
                  authorName: `${updated.author?.name ?? ''} ${updated.author?.lastname ?? ''}`.trim(),
                  views: updated.views,
                  comments: updated.comments,
                  synopsis: updated.synopsis
                }
              : p
          );
          this.forumPosts$.set(mapped);
        }
        this.loading$.set(false);
      },
      error: (err) => {
        console.error('Error al actualizar publicación:', err);
        this.loading$.set(false);
      }
    });
  }

  delete(post: IForumPost): void {
    if (!post.id) return;

    this.loading$.set(true);
    this.http.delete<any>(`${this.apiUrl}/${post.id}`).subscribe({
      next: () => {
        const current = this.forumPosts$();
        this.forumPosts$.set(current.filter((p) => p.id !== post.id));
        this.loading$.set(false);
      },
      error: (err) => {
        console.error('Error al eliminar publicación:', err);
        this.loading$.set(false);
      }
    });
  }
}
