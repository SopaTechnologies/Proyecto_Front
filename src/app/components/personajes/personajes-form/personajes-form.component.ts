import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { PersonajeService } from '../../../services/personaje.service';
import { Personaje } from '../../../models/personaje.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-personajes-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './personajes-form.component.html',
  styleUrls: ['./personajes-form.component.scss']
})
export class PersonajesFormComponent implements OnChanges {
  @Input() personajes: Personaje[] = [];
  @Input() currentPersonaje: Personaje = {
    nombre: '',
    apellido: '',
    descripcion: '',
    estado: 'activo'
  };
  @Input() editingPersonaje: Personaje | null = null;
  @Input() showModal: boolean = false;
  
  @Output() closeModal = new EventEmitter<void>();
  @Output() savePersonaje = new EventEmitter<void>();

  selectedFile: File | null = null;
  uploadingImage: boolean = false;
  creatingPersonaje: boolean = false;
  generatingImage: boolean = false;
  errorPersonajes: string | null = null;
  successMessage: string | null = null;

  constructor(private personajeService: PersonajeService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showModal'] && !changes['showModal'].currentValue) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.selectedFile = null;
    this.uploadingImage = false;
    this.creatingPersonaje = false;
    this.generatingImage = false;
    this.errorPersonajes = null;
    this.successMessage = null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.errorPersonajes = 'Por favor selecciona un archivo de imagen válido';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.errorPersonajes = 'La imagen es demasiado grande. El tamaño máximo es 5MB';
        return;
      }
      this.selectedFile = file;
      this.errorPersonajes = null;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.currentPersonaje.imagenUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadImage(): void {
    if (!this.selectedFile) {
      this.errorPersonajes = 'No hay archivo seleccionado';
      return;
    }
    if (this.currentPersonaje.id) {
      this.uploadingImage = true;
      this.errorPersonajes = null;
      this.personajeService.uploadPersonajeImage(this.currentPersonaje.id, this.selectedFile)
        .subscribe({
          next: (response: any) => {
            this.currentPersonaje.imagenUrl = response.imageUrl || response.personaje?.imagenUrl;
            this.successMessage = '✅ ¡Imagen subida y guardada exitosamente!';
            this.uploadingImage = false;
            this.selectedFile = null;
            setTimeout(() => { this.successMessage = null; }, 5000);
          },
          error: (error: any) => {
            this.errorPersonajes = 'Error al subir la imagen: ' + error.message;
            this.uploadingImage = false;
          }
        });
    } else {
      this.successMessage = '📋 Imagen preparada. Se subirá automáticamente al guardar el personaje.';
      this.uploadingImage = false;
      setTimeout(() => { this.successMessage = null; }, 3000);
    }
  }

  generatePersonajeImage(): void {
    if (!this.currentPersonaje.descripcion) {
      this.errorPersonajes = 'Debes proporcionar una descripción para generar la imagen';
      return;
    }
    this.generatingImage = true;
    this.errorPersonajes = null;
    this.successMessage = '⏳ Generando imagen con IA (esto puede tardar 2-3 minutos)...';
    
    const descripcionLimpia = this.currentPersonaje.descripcion.replace(/[^ -ÿ"]/gi, ' ').replace(/\s+/g, ' ').trim();
    const descripcionCodificada = encodeURIComponent(descripcionLimpia);
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${descripcionCodificada}?width=512&height=768&seed=${seed}&model=flux`;
    
    this.currentPersonaje.imagenUrl = imageUrl;
    
    fetch(imageUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al generar la imagen con IA');
        }
        return response.blob();
      })
      .then(blob => {
        const fileName = `ai-generated-${seed}.jpg`;
        const file = new File([blob], fileName, { type: 'image/jpeg' });
        this.selectedFile = file;
        
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.currentPersonaje.imagenUrl = e.target.result;
          this.successMessage = '✅ ¡Imagen generada exitosamente! Lista para guardar.';
          this.generatingImage = false;
          setTimeout(() => { this.successMessage = null; }, 5000);
        };
        reader.readAsDataURL(file);
      })
      .catch(error => {
        console.error('Error al generar imagen:', error);
        this.errorPersonajes = 'Error al generar la imagen. Por favor, intenta de nuevo.';
        this.generatingImage = false;
        this.currentPersonaje.imagenUrl = undefined;
      });
  }

  onSubmit(): void {
    this.creatingPersonaje = true;
    this.errorPersonajes = null;
    
    const operation = this.editingPersonaje
      ? this.personajeService.updatePersonaje(this.editingPersonaje.id!, this.currentPersonaje)
      : this.personajeService.createPersonaje(this.currentPersonaje);
      
    operation.subscribe({
      next: (personaje: Personaje) => {
        if (this.selectedFile) {
          this.personajeService.uploadPersonajeImage(personaje.id!, this.selectedFile)
            .subscribe({
              next: (response: any) => {
                this.currentPersonaje.imagenUrl = response.imageName
                  ? `http://localhost:8081/upload/${response.imageName.replace(/^\/?upload\//, '')}`
                  : undefined;
                this.selectedFile = null;
                this.creatingPersonaje = false;
                this.savePersonaje.emit();
              },
              error: (error: any) => {
                this.errorPersonajes = 'Error al subir la imagen: ' + error.message;
                this.creatingPersonaje = false;
              }
            });
        } else {
          this.creatingPersonaje = false;
          this.savePersonaje.emit();
        }
      },
      error: (error: any) => {
        this.errorPersonajes = 'Error al guardar el personaje';
        this.creatingPersonaje = false;
        console.error('Error al guardar personaje:', error);
      }
    });
  }

  onCloseModal(): void {
    this.closeModal.emit();
  }

  onImageError(event: any): void {
    event.target.src = 'https://image.pollinations.ai/prompt/character%20portrait%20placeholder?width=512&height=768&seed=0&model=flux';
  }

  isEnemigo(personajeId: number): boolean {
    if (!this.currentPersonaje.enemigos) {
      return false;
    }
    try {
      const enemigosIds: number[] = JSON.parse(this.currentPersonaje.enemigos);
      return enemigosIds.includes(personajeId);
    } catch {
      return false;
    }
  }

  toggleEnemigo(personajeId: number, event: any): void {
    const isChecked = event.target.checked;
    
    if (!this.currentPersonaje.enemigos) {
      this.currentPersonaje.enemigos = '[]';
    }
    
    try {
      let enemigosIds: number[] = JSON.parse(this.currentPersonaje.enemigos);
      
      if (isChecked) {
        if (!enemigosIds.includes(personajeId)) {
          enemigosIds.push(personajeId);
        }
      } else {
        enemigosIds = enemigosIds.filter(id => id !== personajeId);
      }
      
      this.currentPersonaje.enemigos = JSON.stringify(enemigosIds);
    } catch {
      this.currentPersonaje.enemigos = JSON.stringify([personajeId]);
    }
  }

  isAmistad(personajeId: number): boolean {
    if (!this.currentPersonaje.amistades) {
      return false;
    }
    try {
      const amistadesIds: number[] = JSON.parse(this.currentPersonaje.amistades);
      return amistadesIds.includes(personajeId);
    } catch {
      return false;
    }
  }

  toggleAmistad(personajeId: number, event: any): void {
    const isChecked = event.target.checked;
    
    if (!this.currentPersonaje.amistades) {
      this.currentPersonaje.amistades = '[]';
    }
    
    try {
      let amistadesIds: number[] = JSON.parse(this.currentPersonaje.amistades);
      
      if (isChecked) {
        if (!amistadesIds.includes(personajeId)) {
          amistadesIds.push(personajeId);
        }
      } else {
        amistadesIds = amistadesIds.filter(id => id !== personajeId);
      }
      
      this.currentPersonaje.amistades = JSON.stringify(amistadesIds);
    } catch {
      this.currentPersonaje.amistades = JSON.stringify([personajeId]);
    }
  }
}