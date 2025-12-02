import { Component, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { FCanvasComponent, FFlowModule, FConnectionContent, EFMarkerType, FZoomDirective } from '@foblex/flow';
import { ElementCardComponent } from '../element-card/element-card.component';
import { NarrativeelementsService } from '../../../services/narrativeelements.service';
import { NarrativeElementModel, RelationshipModel, NodeConnectionModel } from '../../../models/narrative-element.model';
import { ModalService } from '../../../services/modal.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from "../../modal/modal.component";
import { RelationshipTypeFormComponent } from '../relationship-type-form/relationship-type-form.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NarrativeElementFormComponent } from '../narrative-element-form/narrative-element-form.component';
import { NarrativeElementTypeFormComponent } from '../narrative-element-type-form/narrative-element-type-form.component';
import { RelationshipFormComponent } from '../relationship-form/relationship-form.component';
import { IPoint } from '@foblex/2d';


@Component({
  selector: 'app-elements-diagram',
  standalone: true,
  imports: [NarrativeElementFormComponent, NarrativeElementTypeFormComponent, RelationshipFormComponent, FFlowModule, ElementCardComponent, FConnectionContent, FZoomDirective, ModalComponent, RelationshipTypeFormComponent],
  templateUrl: './elements-diagram.component.html',
  styleUrl: './elements-diagram.component.scss'
})
export class ElementsDiagramComponent {
  @Input() historyId!: string | null;
  @Output() closeModal = new EventEmitter<void>();


  public fb: FormBuilder = inject(FormBuilder);

  public narrativeElementsService: NarrativeelementsService = inject(NarrativeelementsService);

  private modalService = inject(ModalService);

  @ViewChild('newElementModal') public newElementModal: any;
  newElementModalRef: NgbModalRef | null = null;

  @ViewChild('newElementTypeModal') public newElementTypeModal: any;
  newElementTypeModalRef: NgbModalRef | null = null;

  @ViewChild('relationshipTypesModal') public relationshipTypesModal: any;
  relationshipTypesModalRef: NgbModalRef | null = null;

  @ViewChild('relationshipModal') public relationshipModal: any;
  relationshipModalRef: NgbModalRef | null = null;


  @ViewChild(FCanvasComponent, { static: true })
  public fCanvas!: FCanvasComponent;

  @ViewChild(FZoomDirective, { static: true })
  protected fZoom!: FZoomDirective;

  public eMarkerType = EFMarkerType;

  elements: NarrativeElementModel[] = [];
  relationships: RelationshipModel[] = [];
  nodeRelations: NodeConnectionModel[] = [];

  elementForm: FormGroup = this.fb.group({
    id: [0],
    name: ['', Validators.required],
    description: ['', Validators.required],
    type: this.fb.control({
      id: [0],
      name: [''],
    }),
    historyId: [this.historyId ? +this.historyId : undefined],
  });

  elementTypeForm: FormGroup = this.fb.group({
    id: [0],
    name: ['', Validators.required]
  });

  relTypeForm: FormGroup = this.fb.group({
    id: [''],
    name: ['', Validators.required]
  });

  relForm: FormGroup = this.fb.group({
    id: [''],
    from: this.fb.control({
      id: [0]
    }),
    to: this.fb.control({
      id: [0]
    }),
    type: this.fb.control({
      id: [0],
    })
  })

  ngOnInit() {
    this.loadElements();
  }


  public onLoaded(): void {
    this.fCanvas.resetScaleAndCenter(false);
  }

  protected onZoomIn(): void {
    this.fZoom.zoomIn();
  }

  protected onZoomOut(): void {
    this.fZoom.zoomOut();
  }

  onNodeMoveEvent(elementId: number, position: IPoint): void {
    this.narrativeElementsService.updateNodePosition(elementId, position).subscribe({
      next: (response) => {
        console.log('Node position updated successfully', response);
      },
      error: (error) => {
        console.error('Error updating node position', error);
      }
    });
  }


  cancel(): void {
    this.modalService.closeAll();
  }

  updateDiagram(): void {
    // Lógica para actualizar el diagrama después de guardar el elemento
    this.loadElements();
  }

  loadElements(): void {
    if (this.historyId) {
      this.narrativeElementsService.getElementsByHistory(+this.historyId).subscribe({
        next: (response) => {
          this.elements = response.map((e: any) => ({ ...e, nodePosition: JSON.parse(e.nodePosition) }))

          for (const e of this.elements) {
            this.narrativeElementsService.getRelationshipsByElement(e.id).subscribe({
              next: (relResponse) => {
                this.relationships = this.relationships.concat(relResponse);

                this.nodeRelations = this.relationships.map((element: any) => {
                  return {
                    id: element.id,
                    out: element.from.id,
                    in: element.to.id,
                    type: element.type?.name ?? '',
                  };
                });

                this.fCanvas.redraw();
                this.fCanvas.fitToScreen({ x: 50, y: 50 });

              }
            });
          }
          
        }
      });
    }
  }


  showNewElementForm(): void {
    // this.elementForm.controls['historyId'].setValue(this.historyId ? +this.historyId : undefined);
    this.newElementModalRef = this.modalService.displayModalInstance('md', this.newElementModal);
  }

  closeNewElementForm(): void {
    if (this.newElementModalRef) {
      this.newElementModalRef.close();
    }
  }

  showNewElementType(): void {
    this.newElementTypeModalRef = this.modalService.displayModalInstance('md', this.newElementTypeModal);
  }

  closeNewElementType(): void {
    if (this.newElementTypeModalRef) {
      this.newElementTypeModalRef.close();
    }
  }

  showNewRelationshipTypes(): void {
    this.relationshipTypesModalRef = this.modalService.displayModalInstance('md', this.relationshipTypesModal);
  }

  closeRelationshipTypes(): void {
    if (this.relationshipTypesModalRef) {
      this.relationshipTypesModalRef.close();
    }
  }

  showNewRelationshipForm(): void {
    this.relationshipModalRef = this.modalService.displayModalInstance('md', this.relationshipModal)
  }

  closeNewRelationshipForm(): void {
    if (this.relationshipModalRef) {
      this.relationshipModalRef.close();
    }
  }
  
}
