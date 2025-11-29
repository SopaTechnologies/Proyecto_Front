import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from '../../../services/modal.service';
import { AlertService } from '../../../services/alert.service';
import { NarrativeelementsService } from '../../../services/narrativeelements.service';
import { NarrativeElementModel, RelationshipModel, RelationshipTypeModel } from '../../../models/narrative-element.model';
import { CommonModule } from '@angular/common';
import { from } from 'rxjs';

@Component({
  selector: 'app-relationship-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './relationship-form.component.html',
  styleUrl: './relationship-form.component.scss'
})
export class RelationshipFormComponent {
  @Input() modalRef : NgbModalRef | null = null;
  @Input() relForm!: FormGroup;
  @Input() elements!: NarrativeElementModel[]
  @Output() updateDiagram = new EventEmitter<void>();

  relationshipTypes: RelationshipTypeModel[] = []

  private alertService = inject(AlertService);
  private modalService = inject(ModalService);

  narrativeElementsService = inject(NarrativeelementsService);

  loading = signal(false);

  ngOnInit(): void {
    this.narrativeElementsService.getRelationshipTypes().subscribe({
      next: (types) => {
        this.relationshipTypes = types;
      },
      error: () => {
        this.alertService.displayAlert(
          'error',
          'No se pudieron cargar los tipos de relación.',
          'center',
          'top',
          ['error-snackbar']
        );
      }
    });
  }

  onSubmit(): void {
    if (this.relForm.invalid) {
      this.relForm.markAllAsTouched();
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
    const relData = this.relForm.value;

    this.narrativeElementsService.newElementRelationship(+relData.from, +relData.to, +relData.type).subscribe({
      next: (response) => {
        this.alertService.displayAlert(
          'success',
          'Tipo de relación creado exitosamente',
          'center',
          'top',
          ['success-snackbar']
        );
        this.resetForm();
        this.updateDiagram.emit();
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
    this.relForm.reset();
  }

  cancel(): void {
    if (this.relForm) {
      this.relForm.reset();
    }
    
    if (this.modalRef) {
      this.modalRef.close();
    }
  }

  get nameCtrl() {
    return this.relForm.get('name');
  }
}
