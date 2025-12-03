import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import {
  NarrativeElementModel,
  RelationshipTypeModel
} from '../../../models/narrative-element.model';
import { NarrativeelementsService } from '../../../services/narrativeelements.service';

@Component({
  selector: 'app-relationship-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './relationship-form.component.html',
  styleUrls: ['./relationship-form.component.scss']
})
export class RelationshipFormComponent {
  @Input() modalRef: NgbModalRef | null = null;
  @Input() relForm!: FormGroup;
  @Input() elements!: NarrativeElementModel[];
  @Output() updateDiagram = new EventEmitter<void>();

  relationshipTypes: RelationshipTypeModel[] = [];

  private narrativeElementsService = inject(NarrativeelementsService);

  loading = signal(false);

  ngOnInit(): void {
    this.narrativeElementsService.getRelationshipTypes().subscribe({
      next: (types) => {
        this.relationshipTypes = types;
      },
      error: (error) => {
        console.error('No se pudieron cargar los tipos de relación.', error);
      }
    });
  }

  onSubmit(): void {
    if (this.relForm.invalid) {
      this.relForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const relData = this.relForm.value;

    this.narrativeElementsService
      .newElementRelationship(+relData.from, +relData.to, +relData.type)
      .subscribe({
        next: (response) => {
          console.log('Tipo de relación creado exitosamente', response);
          this.resetForm();
          this.updateDiagram.emit();
          this.cancel();
        },
        error: (error) => {
          console.error('Error al crear el tipo de relación. Intenta nuevamente.', error);
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

  get fromCtrl() {
    return this.relForm.get('from');
  }

  get toCtrl() {
    return this.relForm.get('to');
  }

  get typeCtrl() {
    return this.relForm.get('type');
  }
}
