import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Personaje } from '../../../models/personaje.model';
import { PersonajeService } from '../../../services/personaje.service';

@Component({
  selector: 'app-personajes-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './personajes-form.component.html',
  styleUrls: ['./personajes-form.component.scss']
})
export class PersonajesFormComponent {

  @Input() personaje: Personaje | null = null;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  current: Personaje = {
    nombre: '',
    apellido: '',
    descripcion: '',
    estado: 'activo'
  };

  selectedFile: File | null = null;
  uploadingImage = false;
  generatingImage = false;
  creatingPersonaje = false;

  error: string | null = null;
  successMessage: string | null = null;

  constructor(private personajeService: PersonajeService) {}

  ngOnInit(): void {
    this.current = this.personaje
      ? { ...this.personaje }
      : { nombre: '', apellido: '', descripcion: '', estado: 'activo' };
  }

  close() {
    this.cerrar.emit();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.error = 'Selecciona un archivo de imagen';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.error = 'Máximo 5MB';
      return;
    }

    this.selectedFile = file;
    this.error = null;

    const reader = new FileReader();
    reader.onload = (e: any) => this.current.imagenUrl = e.target.result;
    reader.readAsDataURL(file);
  }

  uploadImage(personajeId: number): Promise<boolean> {
    return new Promise(resolve => {
      if (!this.selectedFile) {
        resolve(true);
        return;
      }

      this.uploadingImage = true;

      this.personajeService.uploadPersonajeImage(personajeId, this.selectedFile)
        .subscribe({
          next: response => {
            this.current.imagenUrl =
              response.imageUrl || response.personaje?.imagenUrl;

            this.uploadingImage = false;
            resolve(true);
          },
          error: err => {
            this.error = 'Error al subir imagen';
            this.uploadingImage = false;
            resolve(false);
          }
        });
    });
  }

  generateImage(): void {
    if (!this.current.descripcion) {
      this.error = 'Debes agregar una descripción';
      return;
    }

    this.generatingImage = true;
    this.error = null;
    this.successMessage = 'Generando imagen con IA... (puede tardar 2-3 min)';

    const desc = encodeURIComponent(
      this.current.descripcion.replace(/[^ -ÿ"]/gi, ' ')
    );

    const seed = Math.floor(Math.random() * 999999);
    const url =
      `https://image.pollinations.ai/prompt/${desc}?width=512&height=768&seed=${seed}&model=flux`;

    this.current.imagenUrl = url;

    fetch(url)
      .then(r => r.blob())
      .then(blob => {
        this.selectedFile = new File([blob], `ai-${seed}.jpg`, {
          type: 'image/jpeg'
        });

        const reader = new FileReader();
        reader.onload = e => {
          this.current.imagenUrl = e.target?.result as string;
          this.successMessage = '✅ Imagen generada';
          this.generatingImage = false;
        };
        reader.readAsDataURL(blob);
      })
      .catch(() => {
        this.error = 'Error al generar imagen';
        this.generatingImage = false;
        this.current.imagenUrl = undefined;
      });
  }

  save(): void {
    this.creatingPersonaje = true;
    this.error = null;

    const operation = this.personaje?.id
      ? this.personajeService.updatePersonaje(this.personaje.id, this.current)
      : this.personajeService.createPersonaje(this.current);

    operation.subscribe({
      next: async personajeGuardado => {

        const ok = await this.uploadImage(personajeGuardado.id!);

        if (!ok) {
          this.creatingPersonaje = false;
          return;
        }

        this.creatingPersonaje = false;
        this.guardado.emit();
        this.cerrar.emit();
      },
      error: () => {
        this.error = 'Error al guardar personaje';
        this.creatingPersonaje = false;
      }
    });
  }
}
