import { Component, inject } from '@angular/core';
import { HistoriaService } from '../../services/history.service';
import { CrearHistoriaModel } from '../../models/historia.model';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AngularEditorModule, AngularEditorConfig } from '@wfpena/angular-wysiwyg';
import { UserModel } from '../../models/user.model'

@Component({
  standalone: true,
  selector: 'app-crear-historia',
  imports: [FormsModule, HttpClientModule, AngularEditorModule],
  templateUrl: './crear-historia.component.html',
  styleUrl: './crear-historia.component.less'
})
export class CrearHistoriaComponent {
  historia: CrearHistoriaModel = {
    titulo: '',
    descripcion: '',
    genero: '',
    contieneJuego: false,
    // idUsuarioCreador: 101 // Simulado (usuario autenticado)
  };

  mensaje: string = '';
  mensajeTipo: number = 0;
  autoSaveSub!: Subscription;

  autor: string = ''

  historyService: HistoriaService = inject(HistoriaService);

  ngOnInit(): void {
    var auth_user = localStorage.getItem('auth_user');

    if (auth_user){
      var user: UserModel = JSON.parse(auth_user)
      this.autor = user.name + ' ' + user.lastname
    }
    
  }

  guardar() {
    const validacion = this.validarCampos();
    if (!validacion.ok) {
      this.mostrarMensaje(validacion.msg, 400);
      return;
    }

    // this.historia.id = Math.floor(Math.random() * 10000);
    // const historiaCreada = { ...this.historia, idHistoria };

    this.historyService.crearHistoria(this.historia).subscribe({
      next: () => {
        console.log('Historia guardada localmente:', this.historia);
        this.mostrarMensaje('Documento guardado exitosamente.', 200);
      },
      error: err => {
        this.mostrarMensaje(err.status, err.status)
      }
    });
  }


  validarCampos() {
    const regexTitulo = /^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]+$/;

    if (!this.historia.titulo || this.historia.titulo.length > 100 || !regexTitulo.test(this.historia.titulo)) {
      return { ok: false, msg: 'El título es obligatorio, sin caracteres especiales y máximo 100 caracteres.' };
    }

    if (!this.historia.descripcion || this.historia.descripcion.length > 1000) {
      return { ok: false, msg: 'La descripción es obligatoria y no puede superar los 1000 caracteres.' };
    }

    if (!this.historia.genero) {
      return { ok: false, msg: 'Debe seleccionar un género.' };
    }

    return { ok: true, msg: '' };
  }

  mostrarMensaje(msg: string, codigo: number) {
    this.mensaje = msg;
    this.mensajeTipo = codigo;
  }
}

