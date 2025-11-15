import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './elements/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { LayoutService } from '../../services/layout.service';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';

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

  constructor(public layoutService: LayoutService, private chatService: ChatService) {
    this.layoutService.title.subscribe((title) => (this.title = title));
  }

  toggleChat() {
    this.showChat = !this.showChat;
  }

  sendMessage() {
    const text = this.newMessage?.trim();
    if (!text) return;

    this.messages.push({ from: 'user', text });
    this.newMessage = '';

    // Enviar la pregunta al servicio de chat (idHistoria = 0 por defecto)
    this.chatService.enviarPregunta(0, text).subscribe({
      next: (res: any) => {
        const reply = res?.respuesta || res?.message || JSON.stringify(res);
        this.messages.push({ from: 'ai', text: reply });
      },
      error: () => {
        this.messages.push({ from: 'ai', text: 'Error al conectar con el servicio de IA.' });
      }
    });
  }
}
