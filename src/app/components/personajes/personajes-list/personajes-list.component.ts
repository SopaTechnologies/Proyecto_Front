import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Personaje } from '../../../models/personaje.model';

@Component({
  selector: 'app-personajes-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './personajes-list.component.html',
  styleUrls: ['./personajes-list.component.scss']
})
export class PersonajesListComponent {

  @Input() personajes: Personaje[] = [];
  @Input() loading = false;
  @Input() error: string | null = null;

  @Output() editar = new EventEmitter<Personaje>();
  @Output() eliminar = new EventEmitter<number>();
  @Output() crear = new EventEmitter<void>();

  onImageError(event: any) {
    event.target.src =
      'https://image.pollinations.ai/prompt/character%20portrait%20placeholder?width=512&height=768&seed=0&model=flux';
  }
}
