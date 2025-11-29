import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AlertService } from '../../../services/alert.service';
import { ModalService } from '../../../services/modal.service';
import { RelationshipTypeModel } from '../../../models/narrative-element.model';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NarrativeelementsService } from '../../../services/narrativeelements.service';

@Component({
  selector: 'app-relationship-type-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './relationship-type-form.component.html',
  styleUrl: './relationship-type-form.component.scss'
})
export class RelationshipTypeFormComponent {

  @Input() modalRef : NgbModalRef | null = null;
  @Input() relTypeForm!: FormGroup;

  private alertService = inject(AlertService);
  private modalService = inject(ModalService);

  narrativeElementsService = inject(NarrativeelementsService);

  loading = signal(false);

  onSubmit(): void {
    if (this.relTypeForm.invalid) {
      this.relTypeForm.markAllAsTouched();
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
    const relTypeData: RelationshipTypeModel = this.relTypeForm.value;
    relTypeData.id = 0

    this.narrativeElementsService.createRelationshipType(relTypeData).subscribe({
      next: (response) => {
        this.alertService.displayAlert(
          'success',
          'Tipo de relación creado exitosamente',
          'center',
          'top',
          ['success-snackbar']
        );
        this.resetForm();
        this.cancel();
      },
      error: (error) => {
        this.alertService.displayAlert(
          'error',
          'Error al crear el tipo de relación. Intenta nuevamente.',
          'center',
          'top',
          ['error-snackbar']
        );
        this.loading.set(false);
      }
    });
  }

  resetForm(): void {

    this.loading.set(false);
    this.relTypeForm.reset();
  }

  cancel(): void {
    if (this.relTypeForm) {
      this.relTypeForm.reset();
    }
    
    if (this.modalRef) {
      this.modalRef.close();
    }
  }

  get nameCtrl() {
    return this.relTypeForm.get('name');
  }
}