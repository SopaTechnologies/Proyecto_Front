import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { HistoriaModel, CrearHistoriaModel } from '../models/historia.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HistoriaService {


private apiUrl = `${environment.apiUrl}/historias`;
private genresAPIUrl = `${environment.apiUrl}/genres`;


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

  getAll(): Observable<any> {
    return this.http.get<HistoriaModel[]>(this.apiUrl);
  }

  deleteHistoria(idHistoria: Number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${idHistoria}`);
  }

}
