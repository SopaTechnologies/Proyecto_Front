import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { Personaje } from '../../../models/personaje.model';

@Component({
  selector: 'app-personajes-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './personajes-list.component.html',
  styleUrls: ['./personajes-list.component.scss'],
})
export class PersonajesListComponent {
  @Input() personajes: Personaje[] = [];

  @Output() editPersonaje = new EventEmitter<Personaje>();
  @Output() deletePersonaje = new EventEmitter<number>();
  @Output() createPersonaje = new EventEmitter<void>();

  /** URL placeholder para imágenes de personajes */
  readonly placeholderImageUrl =
    'https://image.pollinations.ai/prompt/character%20portrait%20placeholder?width=512&height=768&seed=0&model=flux';

  // ==========================
  // Eventos hacia el padre
  // ==========================

  onEditPersonaje(personaje: Personaje): void {
    this.editPersonaje.emit(personaje);
  }

  onDeletePersonaje(id: number): void {
    this.deletePersonaje.emit(id);
  }

  onCreatePersonaje(): void {
    this.createPersonaje.emit();
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = this.placeholderImageUrl;
  }

  // ==========================
  // Genealogía
  // ==========================

  getHijos(personajeId: number): Personaje[] {
    return this.personajes.filter(
      (h) => h.padreId === personajeId || h.madreId === personajeId
    );
  }

  tieneHijos(personajeId: number): boolean {
    return this.getHijos(personajeId).length > 0;
  }

  getPersonajesRaiz(): Personaje[] {
    const raices = this.personajes.filter(
      (p) => !p.padreId && !p.madreId
    );
    const mostrados = new Set<number>();

    return raices.filter((p) => {
      if (!p.id || mostrados.has(p.id)) {
        return false;
      }

      mostrados.add(p.id);

      if (p.relacionId) {
        const pareja = this.personajes.find((per) => per.id === p.relacionId);
        if (pareja && pareja.id && pareja.relacionId === p.id) {
          mostrados.add(pareja.id);
        }
      }

      return true;
    });
  }

  getPareja(personajeId: number, relacionId: number): Personaje | undefined {
    const pareja = this.personajes.find((p) => p.id === relacionId);
    if (pareja && pareja.relacionId === personajeId) {
      return pareja;
    }
    return undefined;
  }

  tieneRelacion(relacionId: number): boolean {
    return this.personajes.some((p) => p.id === relacionId);
  }

  // ==========================
  // Enemigos / Amistades
  // ==========================

  getEnemigos(personajeId: number): Personaje[] {
    const personaje = this.personajes.find((p) => p.id === personajeId);
    if (!personaje || !personaje.enemigos) {
      return [];
    }

    try {
      const enemigosIds: number[] = JSON.parse(personaje.enemigos);
      return this.personajes.filter((p) => p.id && enemigosIds.includes(p.id));
    } catch {
      return [];
    }
  }

  tieneEnemigos(personajeId: number): boolean {
    return this.getEnemigos(personajeId).length > 0;
  }

  getAmistades(personajeId: number): Personaje[] {
    const personaje = this.personajes.find((p) => p.id === personajeId);
    if (!personaje || !personaje.amistades) {
      return [];
    }

    try {
      const amistadesIds: number[] = JSON.parse(personaje.amistades);
      return this.personajes.filter(
        (p) => p.id && amistadesIds.includes(p.id)
      );
    } catch {
      return [];
    }
  }

  tieneAmistades(personajeId: number): boolean {
    return this.getAmistades(personajeId).length > 0;
  }
}
