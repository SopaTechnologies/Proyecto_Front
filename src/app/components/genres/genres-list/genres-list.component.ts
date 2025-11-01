import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IGenre } from '../../../interfaces';

@Component({
  selector: 'app-genres-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './genres-list.component.html',
  styleUrl: './genres-list.component.scss'
})
export class GenresListComponent {
  @Input() genres: IGenre[] = [];
  @Output() callModalAction = new EventEmitter<IGenre>();
  @Output() callDeleteAction = new EventEmitter<number>(); // ← solo el id

  trackById(index: number, genre: IGenre): number {
    return genre.id!;
  }

  editGenre(genre: IGenre): void {
    this.callModalAction.emit(genre);
  }

  deleteGenre(genre: IGenre): void {
    this.callDeleteAction.emit(genre.id!); // ← emitimos solo el id
  }
}
