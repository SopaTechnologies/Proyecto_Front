import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Message } from '../../../models/message.model';

@Component({
  selector: 'app-timeline-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './timeline-form.component.html',
  styleUrls: ['./timeline-form.component.scss']
})
export class TimelineFormComponent implements OnInit {
  @Input() message: Message | null = null;
  @Output() save = new EventEmitter<Message>();
  @Output() close = new EventEmitter<void>();

  formData: Message = { titulo: '', subtitulo: '', textoGrande: '' };
  creating: boolean = false;

  ngOnInit(): void {
    if (this.message) {
      this.formData = { ...this.message };
    } else {
      this.formData = { titulo: '', subtitulo: '', textoGrande: '' };
    }
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      this.creating = true;
      this.save.emit(this.formData);
      setTimeout(() => {
        this.creating = false;
      }, 1000);
    }
  }

  onClose(): void {
    this.close.emit();
  }

  isFormValid(): boolean {
    return !!(this.formData.titulo && this.formData.textoGrande);
  }

  onOverlayClick(event: MouseEvent): void {
    this.onClose();
  }

  onDialogClick(event: MouseEvent): void {
    event.stopPropagation();
  }
}