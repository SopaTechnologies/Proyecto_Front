import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-forum-post-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forum-post-form.component.html',
  styleUrls: ['./forum-post-form.component.scss']
})
export class ForumPostFormComponent {
  @Input() forumForm!: FormGroup; // Form recibido del padre
  @Input() genres: string[] = []; // Lista de géneros
  @Input() availableStories: any[] = []; // Lista de historias
  @Output() save = new EventEmitter<void>(); // Evento para guardar
  @Output() cancel = new EventEmitter<void>(); // Evento para cerrar modal

  onSubmit() {
    if (this.forumForm.valid) this.save.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
