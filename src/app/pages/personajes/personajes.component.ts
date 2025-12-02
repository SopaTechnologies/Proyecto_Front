import { Component, OnInit } from '@angular/core';
import { PersonajeService } from '../../services/personaje.service';
import { Personaje } from '../../models/personaje.model';
import { CommonModule } from '@angular/common';
import { PersonajesListComponent } from '../../components/personajes/personajes-list/personajes-list.component';
import { PersonajesFormComponent } from '../../components/personajes/personajes-form/personajes-form.component';

@Component({
  selector: 'app-personajes',
  standalone: true,
  imports: [CommonModule, PersonajesFormComponent, PersonajesListComponent],
  templateUrl: './personajes.component.html',
  styleUrls: ['./personajes.component.scss']
})
export class PersonajesComponent implements OnInit {
  personajes: Personaje[] = [];
  currentPersonaje: Personaje = {
    nombre: '',
    apellido: '',
    descripcion: '',
    estado: 'activo'
  };
  editingPersonaje: Personaje | null = null;
  showPersonajeModal: boolean = false;
  loadingPersonajes: boolean = false;
  errorPersonajes: string | null = null;

  showDeleteModal: boolean = false;
  personajeIdToDelete: number | null = null;

  constructor(private personajeService: PersonajeService) {}

  ngOnInit(): void {
    this.loadAllPersonajes();
  }

  loadAllPersonajes(): void {
    this.loadingPersonajes = true;
    this.errorPersonajes = null;
    this.personajeService.getAllPersonajes().subscribe({
      next: (personajes: Personaje[]) => {
        this.personajes = personajes.map(p => ({
          ...p,
          imagenUrl: p.imagen
            ? `http://localhost:8080/upload/${p.imagen.replace(/^\/?upload\//, '')}`
            : undefined
        }));
        this.loadingPersonajes = false;
      },
      error: (error: any) => {
        this.errorPersonajes = 'No se pudo conectar con el servidor de personajes.';
        this.loadingPersonajes = false;
        console.error('Error al cargar personajes:', error);
      }
    });
  }

  openCreatePersonajeModal(): void {
    this.currentPersonaje = {
      nombre: '',
      apellido: '',
      descripcion: '',
      estado: 'activo',
      padreId: undefined,
      madreId: undefined,
      enemigos: '[]',
      amistades: '[]'
    };
    this.editingPersonaje = null;
    this.showPersonajeModal = true;
    this.errorPersonajes = null;
  }

  handleEditPersonaje(personaje: Personaje): void {
    this.currentPersonaje = { ...personaje };
    if (!('padreId' in this.currentPersonaje)) this.currentPersonaje.padreId = undefined;
    if (!('madreId' in this.currentPersonaje)) this.currentPersonaje.madreId = undefined;
    if (!('relacionId' in this.currentPersonaje)) this.currentPersonaje.relacionId = undefined;
    if (!('enemigos' in this.currentPersonaje)) this.currentPersonaje.enemigos = '[]';
    if (!('amistades' in this.currentPersonaje)) this.currentPersonaje.amistades = '[]';

    this.editingPersonaje = personaje;
    this.showPersonajeModal = true;
    this.errorPersonajes = null;
  }

  handleDeletePersonaje(id: number): void {
    this.personajeIdToDelete = id;
    this.showDeleteModal = true;
    this.errorPersonajes = null;
  }

  // Confirmar eliminación desde el modal
  confirmDeletePersonaje(): void {
    if (this.personajeIdToDelete == null) return;

    this.personajeService.deletePersonaje(this.personajeIdToDelete).subscribe({
      next: () => {
        this.loadAllPersonajes();
        this.showDeleteModal = false;
        this.personajeIdToDelete = null;
      },
      error: (error: any) => {
        this.errorPersonajes = 'Error al eliminar el personaje';
        console.error('Error al eliminar personaje:', error);
        this.showDeleteModal = false;
        this.personajeIdToDelete = null;
      }
    });
  }

  // Cancelar eliminación
  cancelDeletePersonaje(): void {
    this.showDeleteModal = false;
    this.personajeIdToDelete = null;
  }

  handleCloseModal(): void {
    this.showPersonajeModal = false;
    this.currentPersonaje = {
      nombre: '',
      apellido: '',
      descripcion: '',
      estado: 'activo'
    };
    this.editingPersonaje = null;
    this.errorPersonajes = null;
  }

  handleSavePersonaje(): void {
    this.loadAllPersonajes();
    this.handleCloseModal();
  }
}
