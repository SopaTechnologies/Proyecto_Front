import { Component, OnInit } from '@angular/core';
import { PersonajeService } from '../../services/personaje.service';
import { Personaje } from '../../models/personaje.model';

import { CommonModule } from '@angular/common';
import { PersonajesListComponent } from '../../components/personajes/personajes-list/personajes-list.component';
import { PersonajesFormComponent } from '../../components/personajes/personajes-form/personajes-form.component';

@Component({
  selector: 'app-personajes',
  standalone: true,
  imports: [
    CommonModule,
    PersonajesListComponent,
    PersonajesFormComponent
  ],
  templateUrl: './personajes.component.html',
  styleUrls: ['./personajes.component.scss']
})
export class PersonajesComponent implements OnInit {

  personajes: Personaje[] = [];
  personajeSeleccionado: Personaje | null = null;

  showModal = false;
  loadingPersonajes = false;
  errorPersonajes: string | null = null;

  constructor(private personajeService: PersonajeService) {}

  ngOnInit(): void {
    this.loadAllPersonajes();
  }

  loadAllPersonajes(): void {
    this.loadingPersonajes = true;
    this.errorPersonajes = null;

    this.personajeService.getAllPersonajes().subscribe({
      next: personajes => {
        this.personajes = personajes.map(p => ({
          ...p,
          imagenUrl: p.imagen
            ? `http://localhost:8080/upload/${p.imagen.replace(/^\/?upload\//, '')}`
            : undefined
        }));
        this.loadingPersonajes = false;
      },
      error: () => {
        this.errorPersonajes = 'No se pudo conectar con el servidor de personajes.';
        this.loadingPersonajes = false;
      }
    });
  }

  abrirCrear(): void {
    this.personajeSeleccionado = null;
    this.showModal = true;
  }

  abrirEditar(personaje: Personaje): void {
    this.personajeSeleccionado = personaje;
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
  }

  refrescar(): void {
    this.loadAllPersonajes();
  }

  eliminar(id: number): void {
    if (!confirm('¿Seguro que deseas eliminar este personaje?')) return;
    this.personajeService.deletePersonaje(id).subscribe({
      next: () => this.loadAllPersonajes(),
      error: () => {
        this.errorPersonajes = "Error al eliminar el personaje";
      }
    });
  }
}
