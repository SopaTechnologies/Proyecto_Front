import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Personaje } from '../models/personaje.model';

@Injectable({ providedIn: 'root' })
export class PersonajeService {
  private apiUrl = '/api/personajes';

  constructor(private http: HttpClient) {}

  getAllPersonajes(): Observable<Personaje[]> {
    return this.http.get<Personaje[]>(this.apiUrl);
  }

  getPersonajeById(id: number): Observable<Personaje> {
    return this.http.get<Personaje>(`${this.apiUrl}/${id}`);
  }

  createPersonaje(personaje: Personaje): Observable<Personaje> {
    return this.http.post<Personaje>(this.apiUrl, personaje);
  }

  updatePersonaje(id: number, personaje: Personaje): Observable<Personaje> {
    return this.http.put<Personaje>(`${this.apiUrl}/${id}`, personaje);
  }

  deletePersonaje(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  parsePersonajeFromBackend(p: any): Personaje {
    return {
      id: p.id,
      nombre: p.nombre,
      apellido: p.apellido,
      descripcion: p.descripcion,
      estado: p.estado
    };
  }
  
    uploadPersonajeImage(id: number, file: File): Observable<any> {
      const formData = new FormData();
      formData.append('file', file);
      return this.http.post<any>(`/api/personajes/${id}/upload`, formData);
    }
}
