import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from '../../../services/alert.service';
import { ModalService } from '../../../services/modal.service';
import { NarrativeElementTypeModel } from '../../../models/narrative-element.model';
import { CommonModule } from '@angular/common';
import { NarrativeelementsService } from '../../../services/narrativeelements.service';

@Component({
  selector: 'app-narrative-element-type-form',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './narrative-element-type-form.component.html',
  styleUrl: './narrative-element-type-form.component.scss'
})
export class NarrativeElementTypeFormComponent {
  @Input() modalRef : NgbModalRef | null = null;
  @Input() elementTypeForm!: FormGroup;
  @Input() historyId!: string | null;
  @Output() updateDiagram = new EventEmitter<void>();

  private alertService = inject(AlertService);
  private modalService = inject(ModalService);

  narrativeElementService: NarrativeelementsService = inject(NarrativeelementsService);

  loading = signal(false);

  onSubmit(): void {
    console.log('Formulario enviado:', this.elementTypeForm.value);
    if (this.elementTypeForm.invalid) {
      this.elementTypeForm.markAllAsTouched();
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
    const elementTypeData: NarrativeElementTypeModel = this.elementTypeForm.value;
    elementTypeData.id = 0;

    this.narrativeElementService.createNarrativeElementType(elementTypeData).subscribe({
      next: (response) => {
        console.log('Tipo de elemento narrativo creado exitosamente', response);
        this.alertService.displayAlert(
          'success',
          'Tipo de elemento narrativo creado exitosamente',
          'center',
          'top',
          ['success-snackbar']
        );
        this.updateDiagram.emit();
        if (this.modalRef) {
          this.cancel();
        }
      },
      error: (error) => {
        console.error('Error al crear el tipo de elemento narrativo', error);
        this.alertService.displayAlert(
          'error',
          'Error al crear el tipo de elemento narrativo',
          'center',
          'top',
          ['error-snackbar']
        );
      }
    });

    this.loading.set(false);
    this.elementTypeForm.reset();
  }

  cancel(): void {
    if (this.elementTypeForm) {
      this.elementTypeForm.reset();
    }
    
    if (this.modalRef) {
      this.modalRef.close();
    }
  }

  get nameCtrl() {
    return this.elementTypeForm.get('name');
  }
}
