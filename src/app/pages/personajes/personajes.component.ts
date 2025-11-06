import { Component, OnInit } from '@angular/core';
import { PersonajeService } from '../../services/personaje.service';
import { Personaje } from '../../models/personaje.model';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-personajes',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  creatingPersonaje: boolean = false;
  deletingPersonaje: boolean = false;
  generatingImage: boolean = false;
  errorPersonajes: string | null = null;

    selectedFile: File | null = null;
    uploadingImage: boolean = false;
    successMessage: string | null = null;

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
      
      // Mostrar la imagen temporalmente mientras se descarga
      this.currentPersonaje.imagenUrl = imageUrl;
      
      // Descargar y guardar la imagen
      fetch(imageUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('Error al generar la imagen con IA');
          }
          return response.blob();
        })
        .then(blob => {
          // Convertir blob a archivo
          const fileName = `ai-generated-${seed}.jpg`;
          const file = new File([blob], fileName, { type: 'image/jpeg' });
          this.selectedFile = file;
          
          // Leer la imagen para preview
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

  constructor(private personajeService: PersonajeService) {}

    regeneratePersonaje(personaje: Personaje): void {
      // Aquí iría la lógica para regenerar el personaje con IA
      // Por ahora solo muestra un mensaje en consola
      console.log('Regenerar personaje:', personaje);
    }

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

  savePersonaje(): void {
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
                this.loadAllPersonajes();
                this.closePersonajeModal();
              },
              error: (error: any) => {
                this.errorPersonajes = 'Error al subir la imagen: ' + error.message;
                this.creatingPersonaje = false;
              }
            });
        } else {
          this.creatingPersonaje = false;
          this.loadAllPersonajes();
          this.closePersonajeModal();
        }
      },
      error: (error: any) => {
        this.errorPersonajes = 'Error al guardar el personaje';
        this.creatingPersonaje = false;
        console.error('Error al guardar personaje:', error);
      }
    });
  }

  deletePersonaje(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este personaje?')) {
      this.deletingPersonaje = true;
      this.errorPersonajes = null;
      this.personajeService.deletePersonaje(id).subscribe({
        next: () => {
          this.deletingPersonaje = false;
          this.loadAllPersonajes();
        },
        error: (error: any) => {
          this.errorPersonajes = 'Error al eliminar el personaje';
          this.deletingPersonaje = false;
          console.error('Error al eliminar personaje:', error);
        }
      });
    }
  }

  openCreatePersonajeModal(): void {
    this.currentPersonaje = {
      nombre: '',
      apellido: '',
      descripcion: '',
      estado: 'activo'
    };
    this.editingPersonaje = null;
    this.showPersonajeModal = true;
    this.errorPersonajes = null;
  }

  editPersonaje(personaje: Personaje): void {
    this.currentPersonaje = { ...personaje };
    this.editingPersonaje = personaje;
    this.showPersonajeModal = true;
    this.errorPersonajes = null;
  }

  closePersonajeModal(): void {
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

  getStatusClass(estado: string): string {
    const statusClasses: { [key: string]: string } = {
      'activo': 'status-active',
      'inactivo': 'status-inactive',
      'principal': 'status-main',
      'secundario': 'status-secondary',
      'antagonista': 'status-antagonist'
    };
    return statusClasses[estado] || 'status-default';
  }

  onImageError(event: any): void {
    // Manejar errores de carga de imagen
    event.target.src = 'https://image.pollinations.ai/prompt/character%20portrait%20placeholder?width=512&height=768&seed=0&model=flux';
  }
}
