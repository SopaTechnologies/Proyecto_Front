import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IGenre } from '../../../interfaces';
import { AlertService } from '../../../services/alert.service';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-genres-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './genres-form.component.html',
  styleUrl: './genres-form.component.scss'
})
export class GenresFormComponent {
  @Input() genreForm!: FormGroup;
  @Output() callSaveMethod = new EventEmitter<IGenre>();
  @Output() callUpdateMethod = new EventEmitter<IGenre>();

  private alertService = inject(AlertService);
  private modalService = inject(ModalService);

  loading = signal(false);

  onSubmit(): void {
    if (this.genreForm.invalid) {
      this.genreForm.markAllAsTouched();
      this.alertService.displayAlert(
        'error',
        'Revisa los campos antes de continuar',
        'center',
        'top',
        ['error-snackbar']
      );
      return;
    }

    this.loading.set(true);
    const genreData: IGenre = this.genreForm.value;

    if (this.genreForm.value.id) {
      this.callUpdateMethod.emit(genreData);
    } else {
      this.callSaveMethod.emit(genreData);
    }

    this.loading.set(false);
    this.genreForm.reset();
  }

  cancel(): void {
    this.genreForm.reset();
    this.modalService.closeAll();
  }

  get nameCtrl() {
    return this.genreForm.get('name');
  }
}