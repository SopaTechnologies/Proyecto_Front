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
import { CommonModule } from '@angular/common';
import { HistoriaService } from '../../services/history.service';
import { HistoriaModel } from '../../models/historia.model';
import { CrearHistoriaComponent } from '../../components/histories/crear-historia/crear-historia.component';
import { RedactarHistoriaComponent } from '../../components/histories/redactar-historia/redactar-historia.component';
import { DeleteFormComponent } from "../../components/histories/delete-form/delete-form.component";

@Component({
  selector: 'app-histories',
  standalone: true,
  imports: [
    ModalComponent,
    LoaderComponent,
    CommonModule,
    CrearHistoriaComponent,
    RedactarHistoriaComponent,
    DeleteFormComponent
],
  templateUrl: './histories.component.html',
  styleUrl: './histories.component.scss'
})
export class HistoriesCardComponent {
  public historyService: HistoriaService = inject(HistoriaService);
  public modalService: ModalService = inject(ModalService);
  public fb: FormBuilder = inject(FormBuilder);

  @ViewChild('addHistoryModal') public addHistoryModal: any;
  @ViewChild('editHistoryModal') public editHistoryModal: any;
  @ViewChild('deleteHistoryModal') public deleteHistoryModal: any;

  histories: HistoriaModel[] = [];

  historyForm = this.fb.group({
    id: [''],
    name: ['', Validators.required],
  });

  constructor() {
    this.historyService.getAll().subscribe(
      {
        next: (response) => {
          this.histories = response.data;
      }
    })
  }

  // saveGenre(genre: IGenre) {
  //   this.genresService.save(genre);
  //   this.modalService.closeAll();
  // }

  editHistory(id: number) {
    this.historyForm.controls['id'].setValue(id ? JSON.stringify(id) : '');
    // this.genreForm.controls['name'].setValue(genre.name ? genre.name : '');
    this.modalService.displayModal('md', this.editHistoryModal);
  }

  deleteHistory(id: number) {
    this.historyForm.controls['id'].setValue(id ? JSON.stringify(id) : '');
    // this.genreForm.controls['name'].setValue(genre.name ? genre.name : '');
    this.modalService.displayModal('md', this.deleteHistoryModal);
  }

  updateHistoriesList() {
    this.historyService.getAll().subscribe(
      {
        next: (response) => {
          this.histories = response.data;
      }
    })
  }
}
