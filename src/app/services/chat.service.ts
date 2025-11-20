import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = 'api/chat';

  constructor(private http: HttpClient) {}

  enviarPregunta(idHistoria: number, pregunta: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/historias/${idHistoria}`, { pregunta });
  }
}
