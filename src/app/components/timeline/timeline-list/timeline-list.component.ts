import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../../../models/message.model';

@Component({
  selector: 'app-timeline-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeline-list.component.html',
  styleUrls: ['./timeline-list.component.scss']
})
export class TimelineListComponent {
  @Input() messages: Message[] = [];
  @Output() createMessage = new EventEmitter<void>();
  @Output() editMessage = new EventEmitter<Message>();
  @Output() deleteMessage = new EventEmitter<number>();

  get sortedMessages(): Message[] {
    return [...this.messages].sort((a, b) => a.titulo.localeCompare(b.titulo));
  }

  onCreateMessage(): void {
    this.createMessage.emit();
  }

  onEditMessage(message: Message): void {
    this.editMessage.emit(message);
  }

  onDeleteMessage(id: number): void {
    this.deleteMessage.emit(id);
  }
}