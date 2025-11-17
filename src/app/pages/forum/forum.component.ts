import { Component, effect, signal, ViewChild, TemplateRef } from '@angular/core';
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

  selectedPost: IForumPost | null = null;
  genres: IGenre[] = [];
  genreNames: string[] = [];
  stories: any[] = [];
  currentUserName: string = '';

  forumPostForm = this.fb.group({
    id: [null as number | null],
    storyId: [null as number | null, Validators.required],
    synopsis: ['', [Validators.required, Validators.minLength(10)]],
    genre: ['', Validators.required],
    isPublic: [true, Validators.required]
  });

  loading = signal(false);

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
        this.genreNames = genres.map(g => g.name);
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
      error: err => {
        console.error('Error al cargar historias:', err);
        this.loading.set(false);
      }
    });

    this.genreService.getAll();
    this.forumService.getAll();
  }

  openModal() {
    this.forumPostForm.reset({
      isPublic: true
    });
    setTimeout(() => {
      this.modalService.displayModal('md', this.addForumPostModal);
    }, 0);
  }

  callEdition(post: IForumPost) {
    this.forumPostForm.patchValue({
      id: post.id,
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
      return;
    }

    const formValue = this.forumPostForm.value;
    
    const payload: any = {
      storyId: Number(formValue.storyId),
      synopsis: formValue.synopsis,
      genre: formValue.genre,
      isPublic: formValue.isPublic
    };

    if (formValue.id) {
      payload.id = formValue.id;
      this.forumService.update(payload as unknown as IForumPost);
      this.closeModal();
    } else {
      this.forumService.create(payload as unknown as IForumPost);
      this.closeModal();
    }
  }

  openPostDetails(post: IForumPost) {
    this.selectedPost = post;
  }

  updatePost(post: IForumPost) {
    this.callEdition(post);
  }

  deletePost(post: IForumPost) {
    if (!post.id) return;
    this.forumService.delete(post);
  }
}