import { Component, inject, ViewChild } from '@angular/core';
import { GenresListComponent } from '../../components/genres/genres-list/genres-list.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { GenresFormComponent } from '../../components/genres/genres-form/genres-form.component';
import { ModalService } from '../../services/modal.service';
import { GenresService } from '../../services/genres.service';
import { IGenre } from '../../interfaces';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-genres',
  standalone: true,
  imports: [
    GenresListComponent,
    PaginationComponent,
    ModalComponent,
    LoaderComponent,
    GenresFormComponent
  ],
  templateUrl: './genres.component.html',
  styleUrl: './genres.component.scss'
})
export class GenresComponent {
  public genresService: GenresService = inject(GenresService);
  public modalService: ModalService = inject(ModalService);
  public fb: FormBuilder = inject(FormBuilder);

  @ViewChild('addGenreModal') public addGenreModal: any;

  genreForm = this.fb.group({
    id: [''],
    name: ['', Validators.required],
  });

  constructor() {
    this.genresService.search.page = 1;
    this.genresService.getAll();
  }

  saveGenre(genre: IGenre) {
    this.genresService.save(genre);
    this.modalService.closeAll();
  }

  callEdition(genre: IGenre) {
    this.genreForm.controls['id'].setValue(genre.id ? JSON.stringify(genre.id) : '');
    this.genreForm.controls['name'].setValue(genre.name ? genre.name : '');
    this.modalService.displayModal('md', this.addGenreModal);
  }

  updateGenre(genre: IGenre) {
    this.genresService.update(genre);
    this.modalService.closeAll();
  }
}
