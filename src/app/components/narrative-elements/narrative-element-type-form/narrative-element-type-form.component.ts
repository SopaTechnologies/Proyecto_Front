import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NarrativeElementTypeModel } from '../../../models/narrative-element.model';
import { NarrativeelementsService } from '../../../services/narrativeelements.service';

@Component({
  selector: 'app-narrative-element-type-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './narrative-element-type-form.component.html',
  styleUrls: ['./narrative-element-type-form.component.scss']
})
export class NarrativeElementTypeFormComponent {
  @Input() modalRef: NgbModalRef | null = null;
  @Input() elementTypeForm!: FormGroup;
  @Input() historyId!: string | null;
  @Output() updateDiagram = new EventEmitter<void>();

  private narrativeElementService = inject(NarrativeelementsService);

  loading = signal(false);

  ngOnInit(): void {
    if (!this.elementTypeForm) {
      this.elementTypeForm = new FormGroup({});
    }

    // Asegurar el control "name"
    if (!this.elementTypeForm.get('name')) {
      this.elementTypeForm.addControl(
        'name',
        new (this.elementTypeForm.constructor as any).prototype.constructor().control(
          '',
          [Validators.required, Validators.minLength(3)]
        )
      );
    }
  }

  onSubmit(): void {
    if (this.elementTypeForm.invalid) {
      this.elementTypeForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const elementTypeData: NarrativeElementTypeModel = this.elementTypeForm.value;
    elementTypeData.id = 0;

    this.narrativeElementService.createNarrativeElementType(elementTypeData).subscribe({
      next: (response) => {
        console.log('Tipo de elemento narrativo creado exitosamente', response);
        this.updateDiagram.emit();
        this.resetForm();
        this.cancel();
      },
      error: (error) => {
        console.error('Error al crear el tipo de elemento narrativo', error);
        this.loading.set(false);
      }
    });
  }

  resetForm(): void {
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
