import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Message } from '../models/message.model'; 
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class messageService {
    
private apiUrl = `${environment.apiUrl}/messages`;


  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    })
  };

  constructor(private http: HttpClient) { }

  // Obtener todos los mensajes
  getAllMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  // Obtener mensaje por ID
  getMessageById(id: number): Observable<Message> {
    return this.http.get<Message>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Crear nuevo mensaje
  createMessage(message: Message): Observable<Message> {
    return this.http.post<Message>(this.apiUrl, message, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  // Actualizar mensaje
  updateMessage(id: number, message: Message): Observable<Message> {
    return this.http.put<Message>(`${this.apiUrl}/${id}`, message, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  // Eliminar mensaje
  deleteMessage(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  // Crear mensaje de ejemplo/muestra
  createSampleMessage(): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/sample`, {}, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  // Buscar mensajes por contenido
  searchMessages(keyword: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/search?keyword=${keyword}`)
      .pipe(catchError(this.handleError));
  }

  // Obtener últimos mensajes
  getLatestMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/latest`)
      .pipe(catchError(this.handleError));
  }

  // Manejo de errores
  private handleError(error: any): Observable<never> {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Código de error: ${error.status}\nMensaje: ${error.message}`;
    }
    console.error('Error en MessageService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}