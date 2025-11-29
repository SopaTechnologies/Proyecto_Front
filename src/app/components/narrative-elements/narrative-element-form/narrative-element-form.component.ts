import { Component, EventEmitter, inject, input, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NarrativeElementModel, NarrativeElementTypeModel } from '../../../models/narrative-element.model';
import { CommonModule } from '@angular/common';
import { NarrativeelementsService } from '../../../services/narrativeelements.service';

@Component({
  selector: 'app-narrative-element-form',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './narrative-element-form.component.html',
  styleUrl: './narrative-element-form.component.scss'
})
export class NarrativeElementFormComponent {

  @Input() modalRef: NgbModalRef | null = null;
  @Input() elementForm!: FormGroup;
  @Input() historyId!: string | null;
  @Output() updateDiagram = new EventEmitter<void>();

  public fb: FormBuilder = inject(FormBuilder);

  narrativeElementService: NarrativeelementsService = inject(NarrativeelementsService);

  narrativeElement: NarrativeElementModel = {
    id: 0,
    description: '',
    name: '',
    type: { id: 0, name: '' },
    nodePosition: { x: 0, y: 0 }
  };

  elementTypes: NarrativeElementTypeModel[] = [];

  ngOnInit(): void {
    // Inicialización si es necesario

    this.narrativeElementService.getElementTypes().subscribe((types => {
      this.elementTypes = types;
    }));

  }

  guardar(): void {
    // Lógica para guardar el formulario

    // if (this.elementForm.valid) {
      const newElement: NarrativeElementModel = {
        id: 0,
        name: this.elementForm.value.name,
        description: this.elementForm.value.description,
        type: {
          id: +this.elementForm.value.type,
          name: ''
        },
        nodePosition: {
          x: 0,
          y: 0
        },
        historyId: this.historyId ? +this.historyId : undefined
      };

      // Llamar al servicio para guardar el nuevo elemento narrativo
      this.narrativeElementService.createNarrativeElement(newElement).subscribe({
        next: (response) => {
          console.log('Elemento narrativo creado exitosamente', response);
          this.updateDiagram.emit();
          if (this.modalRef) {
            this.cancel();
          }
        },
        error: err => {
          console.error('Error al crear el elemento narrativo', err);
        }
      });

    // }
  }

  cancel(): void {
    if (this.elementForm) {
      this.elementForm.reset();
    }

    if (this.modalRef) {
      this.modalRef.close();
    }
  }

}
