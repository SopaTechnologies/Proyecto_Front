import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { HistoriaModel, CrearHistoriaModel } from '../models/historia.model';

@Injectable({
  providedIn: 'root'
})
export class HistoriaService {

  private apiUrl = 'historias'; // Cambia por tu endpoint real
  private genresAPIUrl = 'genres'

  constructor(private http: HttpClient) {}

  guardarManual(historia: HistoriaModel): Observable<any> {
    return this.http.put(`${this.apiUrl}/${historia.id}`, historia);
  }

  guardarAutomatico(historia: HistoriaModel): Observable<any> {
    return this.http.put(`${this.apiUrl}/${historia.id}/auto`, historia);
  }

  iniciarGuardadoAutomatico(historia: HistoriaModel) {
    // Guarda cada 10 minutos (600000 ms)
    return timer(0, 600000).pipe(
      switchMap(() => this.guardarAutomatico(historia))
    );
  }

  crearHistoria(historia: CrearHistoriaModel) {
    return this.http.post(`${this.apiUrl}`, historia);
  }

  traerHistoria(idHistoria: Number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${idHistoria}`);
  }

  getGenres(): Observable<any> {
    return this.http.get(`${this.genresAPIUrl}`);
  }


}
