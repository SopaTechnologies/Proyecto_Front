import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import {
  NarrativeElementModel,
  NarrativeElementTypeModel
} from '../../../models/narrative-element.model';
import { NarrativeelementsService } from '../../../services/narrativeelements.service';

@Component({
  selector: 'app-narrative-element-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './narrative-element-form.component.html',
  styleUrls: ['./narrative-element-form.component.scss']
})
export class NarrativeElementFormComponent {
  @Input() modalRef: NgbModalRef | null = null;
  @Input() elementForm!: FormGroup;
  @Input() historyId!: string | null;
  @Output() updateDiagram = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private narrativeElementService = inject(NarrativeelementsService);

  elementTypes: NarrativeElementTypeModel[] = [];

  ngOnInit(): void {
    // Asegura que el form existe (por si el padre no lo creó)
    if (!this.elementForm) {
      this.elementForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        description: ['', [Validators.required, Validators.minLength(5)]],
        type: ['', Validators.required]
      });
    }

    this.narrativeElementService.getElementTypes().subscribe(types => {
      this.elementTypes = types;
    });
  }

  guardar(): void {
    if (this.elementForm.invalid) {
      this.elementForm.markAllAsTouched();
      return;
    }

    const formValue = this.elementForm.value;

    const newElement: NarrativeElementModel = {
      id: 0,
      name: formValue.name,
      description: formValue.description,
      type: {
        id: +formValue.type,
        name: ''
      },
      nodePosition: {
        x: 0,
        y: 0
      },
      historyId: this.historyId ? +this.historyId : undefined
    };

    this.narrativeElementService.createNarrativeElement(newElement).subscribe({
      next: (response) => {
        console.log('Elemento narrativo creado exitosamente', response);
        this.updateDiagram.emit();
        this.cancel();
      },
      error: (err) => {
        console.error('Error al crear el elemento narrativo', err);
      }
    });
  }

  cancel(): void {
    if (this.elementForm) {
      this.elementForm.reset();
    }

    if (this.modalRef) {
      this.modalRef.close();
    }
  }

  get nameCtrl() {
    return this.elementForm.get('name');
  }

  get descriptionCtrl() {
    return this.elementForm.get('description');
  }

  get typeCtrl() {
    return this.elementForm.get('type');
  }
}
