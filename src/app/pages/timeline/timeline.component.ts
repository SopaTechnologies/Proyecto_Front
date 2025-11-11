import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../../models/message.model'; 
import { messageService } from '../../services/Message.service';
import { TimelineListComponent } from '../../components/timeline/timeline-list/timeline-list.component';
import { TimelineFormComponent } from '../../components/timeline/timeline-form/timeline-form.component';

@Component({
  selector: 'app-mensajes',
  standalone: true,
  imports: [CommonModule, TimelineListComponent, TimelineFormComponent],
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class MensajesComponent implements OnInit {
  messages: Message[] = [];
  currentMessage: Message | null = null;
  showModal: boolean = false;
  loading: boolean = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(private messageService: messageService) {}

  ngOnInit(): void {
    this.loadAllMessages();
  }

  loadAllMessages(): void {
    this.loading = true;
    this.error = null;
    this.messageService.getAllMessages().subscribe({
      next: (messages: Message[]) => {
        this.messages = messages;
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'No se pudo conectar con el servidor. Asegúrate de que el backend esté ejecutándose.';
        this.loading = false;
        console.error('Error al cargar mensajes:', error);
      }
    });
  }

  onCreateMessage(): void {
    this.currentMessage = null;
    this.showModal = true;
    this.error = null;
  }

  onEditMessage(message: Message): void {
    this.currentMessage = { ...message };
    this.showModal = true;
    this.error = null;
  }

  onDeleteMessage(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este mensaje?')) {
      this.error = null;
      this.messageService.deleteMessage(id).subscribe({
        next: () => {
          this.successMessage = 'Mensaje eliminado exitosamente!';
          this.loadAllMessages();
          setTimeout(() => { this.successMessage = null; }, 3000);
        },
        error: (error: any) => {
          this.error = 'Error al eliminar el mensaje';
          console.error('Error al eliminar mensaje:', error);
        }
      });
    }
  }

  onSaveMessage(message: Message): void {
    this.error = null;
    this.successMessage = null;
    
    const operation = this.currentMessage && this.currentMessage.id
      ? this.messageService.updateMessage(this.currentMessage.id, message)
      : this.messageService.createMessage(message);
    
    operation.subscribe({
      next: (savedMessage: Message) => {
        this.successMessage = this.currentMessage && this.currentMessage.id
          ? 'Mensaje actualizado exitosamente!' 
          : 'Mensaje creado exitosamente!';
        this.loadAllMessages();
        this.onCloseModal();
        setTimeout(() => { this.successMessage = null; }, 5000);
      },
      error: (error: any) => {
        this.error = this.currentMessage && this.currentMessage.id
          ? 'Error al actualizar el mensaje' 
          : 'Error al crear el mensaje';
        console.error('Error al guardar mensaje:', error);
      }
    });
  }

  onCloseModal(): void {
    this.showModal = false;
    this.currentMessage = null;
    this.error = null;
  }
}