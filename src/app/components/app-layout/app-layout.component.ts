import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './elements/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { LayoutService } from '../../services/layout.service';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { HistoriaService } from '../../services/history.service';
import { HistoriaModel } from '../../models/historia.model';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    SvgIconComponent,
    FormsModule
  ],
  providers: [ChatService],
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss']
})
export class AppLayoutComponent {
  public title?: string;
  public showChat = false;
  public messages: Array<{ from: 'user' | 'ai'; text: string }> = [];
  public newMessage = '';
  public histories: HistoriaModel[] = [];
  public selectedHistoriaId: number | null = null;

  constructor(public layoutService: LayoutService, private chatService: ChatService, private historiaService: HistoriaService) {
    this.layoutService.title.subscribe((title) => (this.title = title));

    // Cargar lista de historias para el selector del chat
    this.historiaService.getAll().subscribe({
      next: (res: any) => {
        if (res == null) return;
        if (Array.isArray(res)) {
          this.histories = res;
        } else if (res.data && Array.isArray(res.data)) {
          this.histories = res.data;
        } else if (res.items && Array.isArray(res.items)) {
          this.histories = res.items;
        } else {
          // fallback: try to use as-is if it looks like an object with keys
          try {
            const maybeArray = Object.values(res).filter((v: any) => Array.isArray(v))[0];
            if (Array.isArray(maybeArray)) this.histories = maybeArray;
          } catch (e) {}
        }
      },
      error: () => {
        // Silenciar error; el select simplemente no mostrará historias
      }
    });
  }

  toggleChat() {
    this.showChat = !this.showChat;
  }

  sendMessage() {
    const text = this.newMessage?.trim();
    if (!text) return;
    if (!this.selectedHistoriaId) {
      this.messages.push({ from: 'ai', text: 'Por favor seleccione una historia antes de enviar la pregunta.' });
      return;
    }

    this.messages.push({ from: 'user', text });
    this.newMessage = '';

    // Enviar la pregunta al servicio de chat con el id de historia seleccionado
    this.chatService.enviarPregunta(this.selectedHistoriaId, text).subscribe({
      next: (res: any) => {
        const reply = res?.respuesta || res?.data || JSON.stringify(res);
        this.messages.push({ from: 'ai', text: reply });
      },
      error: () => {
        this.messages.push({ from: 'ai', text: 'Error al conectar con el servicio de IA.' });
      }
    });
  }
}
