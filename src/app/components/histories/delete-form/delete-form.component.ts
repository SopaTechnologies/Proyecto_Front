import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalService } from '../../../services/modal.service';
import { CommonModule } from '@angular/common';
import { HistoriaService } from '../../../services/history.service';

@Component({
  selector: 'app-delete-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-form.component.html',
  styleUrl: './delete-form.component.scss'
})
export class DeleteFormComponent {

  @Input() deleteHistoryForm!: FormGroup;
  @Output() callUpdateMethod = new EventEmitter();
  
  private modalService = inject(ModalService);
  loading = signal(false);
  historyService: HistoriaService = inject(HistoriaService);

  deleteHistory(id: Number): void {
    this.historyService.deleteHistoria(id).subscribe({
      next: () => {
        this.callUpdateMethod.emit();
        this.cancel();
      }
    });
  }

  cancel(): void {
    this.deleteHistoryForm.reset();
    this.modalService.closeAll();
  }
}
