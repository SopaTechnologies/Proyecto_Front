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

  // Cargar todos los mensajes
  loadAllMessages(): void {
    this.loading = true;
    this.error = null;

    this.messageService.getAllMessages().subscribe({
      next: (messages: Message[]) => {
        this.messages = messages;
        this.loading = false;
      },
      error: (error: any) => {
        this.error =
          'No se pudo conectar con el servidor. Asegúrate de que el backend esté ejecutándose.';
        this.loading = false;
        console.error('Error al cargar mensajes:', error);
      }
    });
  }

  // Crear nuevo mensaje
  onCreateMessage(): void {
    this.currentMessage = null;
    this.showModal = true;
    this.error = null;
    this.successMessage = null;
  }

  // Editar mensaje existente
  onEditMessage(message: Message): void {
    this.currentMessage = { ...message };
    this.showModal = true;
    this.error = null;
    this.successMessage = null;
  }

  // Eliminar mensaje (SIN alerts/confirm)
  onDeleteMessage(id: number): void {
    this.error = null;
    this.successMessage = null;

    this.messageService.deleteMessage(id).subscribe({
      next: () => {
        this.successMessage = 'Mensaje eliminado exitosamente.';
        this.loadAllMessages();
        setTimeout(() => {
          this.successMessage = null;
        }, 4000);
      },
      error: (error: any) => {
        this.error = 'Error al eliminar el mensaje.';
        console.error('Error al eliminar mensaje:', error);
      }
    });
  }

  // Guardar (crear / actualizar)
  onSaveMessage(message: Message): void {
    this.error = null;
    this.successMessage = null;

    const isEdit = !!(this.currentMessage && this.currentMessage.id);
    const operation = isEdit
      ? this.messageService.updateMessage(this.currentMessage!.id!, message)
      : this.messageService.createMessage(message);

    operation.subscribe({
      next: (savedMessage: Message) => {
        this.successMessage = isEdit
          ? 'Mensaje actualizado exitosamente.'
          : 'Mensaje creado exitosamente.';
        this.loadAllMessages();
        this.onCloseModal();
        setTimeout(() => {
          this.successMessage = null;
        }, 4000);
      },
      error: (error: any) => {
        this.error = isEdit
          ? 'Error al actualizar el mensaje.'
          : 'Error al crear el mensaje.';
        console.error('Error al guardar mensaje:', error);
      }
    });
  }

  // Cierre del modal
  onCloseModal(): void {
    this.showModal = false;
    this.currentMessage = null;
    // No reseteo success para que el mensaje de éxito siga visible
    this.error = null;
  }
}
