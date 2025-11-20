import {
  Component,
  effect,
  signal,
  ViewChild,
  TemplateRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ModalService } from '../../services/modal.service';
import { ForumService } from '../../services/forum.service';
import { HistoriaService } from '../../services/history.service';
import { GenresService } from '../../services/genres.service';

import { IForumPost, IGenre } from '../../interfaces';

import { ModalComponent } from '../../components/modal/modal.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { FormsModule } from '@angular/forms';
import { ForumPostFormComponent } from '../../components/forum/forum-form/forum-post-form.component';
import { ForumListComponent } from '../../components/forum/forum-list/forum-list.component';

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalComponent,
    LoaderComponent,
    PaginationComponent,
    ForumListComponent,
    ForumPostFormComponent
  ],
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.scss']
})
export class ForumComponent {
  @ViewChild('addForumPostModal') addForumPostModal!: TemplateRef<any>;
  @ViewChild('postDetailsModal') postDetailsModal!: TemplateRef<any>;
  @ViewChild('deleteForumPostModal') deleteForumPostModal!: TemplateRef<any>;

  filterGenre: string = '';
  filterAuthor: string = '';

  selectedPost: IForumPost | null = null;
  postToDelete: IForumPost | null = null;

  genres: IGenre[] = [];
  genreNames: string[] = [];
  stories: any[] = [];
  currentUserName: string = '';

  loading = signal(false);

  forumPostForm = this.fb.group({
    id: [null as number | null],
    storyId: [null as number | null, Validators.required],
    synopsis: ['', [Validators.required, Validators.minLength(10)]],
    genre: ['', Validators.required],
    isPublic: [true, Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    public modalService: ModalService,
    public forumService: ForumService,
    private historiaService: HistoriaService,
    private genreService: GenresService
  ) {
    effect(() => {
      const genres = this.genreService.genres$();
      if (genres && genres.length > 0) {
        this.genres = genres;
        this.genreNames = genres.map((g) => g.name);
      }
    });

    const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
    this.currentUserName = `${user.name || ''} ${user.lastname || ''}`.trim();

    this.initData();
  }

  initData() {
    this.loading.set(true);

    this.historiaService.getAll().subscribe({
      next: (response) => {
        this.stories = response.data;
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar historias:', err);
        this.loading.set(false);
      }
    });

    this.genreService.getAll();
    this.forumService.getAll();
  }


  openModal() {
    this.forumPostForm.reset({
      id: null,
      storyId: null,
      synopsis: '',
      genre: '',
      isPublic: true
    });

    setTimeout(() => {
      this.modalService.displayModal('md', this.addForumPostModal);
    }, 0);
  }

  updatePost(post: IForumPost) {
    this.forumPostForm.patchValue({
      id: post.id ?? null,
      storyId: post.storyId,
      synopsis: post.synopsis,
      genre: post.genre,
      isPublic: post.isPublic
    });

    setTimeout(() => {
      this.modalService.displayModal('md', this.addForumPostModal);
    }, 0);
  }

  closeModal() {
    this.modalService.closeAll();
  }

  savePost() {
    if (this.forumPostForm.invalid) {
      this.forumPostForm.markAllAsTouched();
      return;
    }

    const formValue = this.forumPostForm.value;

    let payload: IForumPost = {
      storyId: Number(formValue.storyId),
      synopsis: formValue.synopsis ?? '',
      genre: formValue.genre ?? '',
      isPublic: formValue.isPublic ?? true
    };

    if (formValue.id != null) {
      payload = { ...payload, id: formValue.id };
      this.forumService.update(payload);
    } else {
      this.forumService.create(payload);
    }

    this.closeModal();
  }


  openPostDetails(post: IForumPost) {
    this.selectedPost = post;

    setTimeout(() => {
      this.modalService.displayModal('lg', this.postDetailsModal);
    }, 0);
  }

  closeDetails() {
    this.selectedPost = null;
    this.modalService.closeAll();
  }

  deletePost(post: IForumPost) {
    this.postToDelete = post;

    setTimeout(() => {
      this.modalService.displayModal('sm', this.deleteForumPostModal);
    }, 0);
  }

  confirmDelete() {
    if (!this.postToDelete || !this.postToDelete.id) return;

    this.forumService.delete(this.postToDelete);
    this.postToDelete = null;
    this.closeModal();
  }

  get filteredPosts(): IForumPost[] {
    const posts = this.forumService.forumPosts$() || [];
    const genre = (this.filterGenre || '').toLowerCase();
    const author = (this.filterAuthor || '').toLowerCase();

    return posts.filter((p) => {
      const matchesGenre =
        !genre || (p.genre || '').toLowerCase().includes(genre);

      const matchesAuthor =
        !author || (p.authorName || '').toLowerCase().includes(author);

      return matchesGenre && matchesAuthor;
    });
  }
}
