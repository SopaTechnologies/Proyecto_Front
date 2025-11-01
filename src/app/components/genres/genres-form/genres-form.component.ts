import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IGenre } from '../../../interfaces';
import { GenresService } from '../../../services/genres.service';
import { AlertService } from '../../../services/alert.service';
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
  }

  cancel(): void {
    this.genreForm.reset();
  }

  get nameCtrl() {
    return this.genreForm.get('name');
  }
}