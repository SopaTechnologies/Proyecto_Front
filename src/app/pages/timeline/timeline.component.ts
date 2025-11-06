import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Message } from '../../models/message.model'; 
import { messageService } from '../../services/Message.service';  
@Component({
  selector: 'app-mensajes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class MensajesComponent implements OnInit {
  messages: Message[] = [];
  currentMessage: Message = { titulo: '', subtitulo: '', textoGrande: '' };
  editingMessage: Message | null = null;
  showModal: boolean = false;
  loading: boolean = false;
  creating: boolean = false;
  deleting: boolean = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(private messageService: messageService) {}

  ngOnInit(): void {
    this.loadAllMessages();
  }

  get sortedMessages(): Message[] {
    return [...this.messages].sort((a, b) => a.titulo.localeCompare(b.titulo));
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

  saveMessage(): void {
    this.creating = true;
    this.error = null;
    this.successMessage = null;
    const operation = this.editingMessage 
      ? this.messageService.updateMessage(this.editingMessage.id!, this.currentMessage)
      : this.messageService.createMessage(this.currentMessage);
    operation.subscribe({
      next: (message: Message) => {
        this.successMessage = this.editingMessage 
          ? 'Mensaje actualizado exitosamente!' 
          : 'Mensaje creado exitosamente!';
        this.creating = false;
        this.loadAllMessages();
        this.closeModal();
        setTimeout(() => { this.successMessage = null; }, 5000);
      },
      error: (error: any) => {
        this.error = this.editingMessage 
          ? 'Error al actualizar el mensaje' 
          : 'Error al crear el mensaje';
        this.creating = false;
        console.error('Error al guardar mensaje:', error);
      }
    });
  }

  deleteMessage(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este mensaje?')) {
      this.deleting = true;
      this.error = null;
      this.messageService.deleteMessage(id).subscribe({
        next: () => {
          this.successMessage = 'Mensaje eliminado exitosamente!';
          this.deleting = false;
          this.loadAllMessages();
          setTimeout(() => { this.successMessage = null; }, 3000);
        },
        error: (error: any) => {
          this.error = 'Error al eliminar el mensaje';
          this.deleting = false;
          console.error('Error al eliminar mensaje:', error);
        }
        });
      }
    }

  openCreateModal(): void {
    this.currentMessage = { titulo: '', subtitulo: '', textoGrande: '' };
    this.editingMessage = null;
    this.showModal = true;
    this.error = null;
  }

  editMessage(message: Message): void {
    this.currentMessage = { ...message };
    this.editingMessage = message;
    this.showModal = true;
    this.error = null;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentMessage = { titulo: '', subtitulo: '', textoGrande: '' };
    this.editingMessage = null;
    this.error = null;
  }
}
