import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { RelationshipTypeModel } from '../../../models/narrative-element.model';
import { NarrativeelementsService } from '../../../services/narrativeelements.service';

@Component({
  selector: 'app-relationship-type-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './relationship-type-form.component.html',
  styleUrls: ['./relationship-type-form.component.scss']
})
export class RelationshipTypeFormComponent {
  @Input() modalRef: NgbModalRef | null = null;
  @Input() relTypeForm!: FormGroup;

  private narrativeElementsService = inject(NarrativeelementsService);

  loading = signal(false);

  ngOnInit(): void {
    if (!this.relTypeForm.get('name')) {
      this.relTypeForm.addControl(
        'name',
        new (this.relTypeForm.constructor as any).prototype.constructor().control(
          '',
          [Validators.required, Validators.minLength(3)]
        )
      );
    }
  }

  onSubmit(): void {
    if (this.relTypeForm.invalid) {
      this.relTypeForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const relTypeData: RelationshipTypeModel = this.relTypeForm.value;
    relTypeData.id = 0;

    this.narrativeElementsService.createRelationshipType(relTypeData).subscribe({
      next: (response) => {
        console.log('Tipo de relación creado exitosamente', response);
        this.resetForm();
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
