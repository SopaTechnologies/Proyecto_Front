import { Component , inject, Input} from '@angular/core';
import { HistoriaModel } from '../../../models/historia.model';
import { Subscription } from 'rxjs';
import { HistoriaService } from '../../../services/history.service';
import { FormGroup, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AngularEditorModule, AngularEditorConfig } from '@wfpena/angular-wysiwyg';
import { ActivatedRoute } from '@angular/router';
import { ModalService } from '../../../services/modal.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HttpClientModule, AngularEditorModule],
  standalone: true,
  selector: 'app-redactar-historia',
  templateUrl: './redactar-historia.component.html',
  styleUrls: ['./redactar-historia.component.less']
})
export class RedactarHistoriaComponent {
  historia: HistoriaModel = {
    id: 0, // Se debe cargar
    content: '', // se debe cargar,
    titulo: '' // se debe cargar
  };

  // route : ActivatedRoute = null
  // @Input() id!: Number
  @Input() historyForm!: FormGroup;
  
  mensajeTipo = 0
  mensaje: string = '';
  autoSaveSub!: Subscription;
  historyService: HistoriaService = inject(HistoriaService);
  private modalService = inject(ModalService);

  editorConfig: AngularEditorConfig = {
    height: '500px',
    // maxHeight: '00px',
    editable: true,
  }


  ngOnInit(): void {
    // Iniciar guardado automático

    this.cargarHistoria()
    this.autoSaveSub = this.historyService
      .iniciarGuardadoAutomatico(this.historia)
      .subscribe({
        next: () => this.mostrarMensaje('Cambios guardados automáticamente.', 200),
        error: err => this.mostrarMensaje('Error al guardar automáticamente: ' + err, err.status)
      });
  }

  cargarHistoria(): void {
    this.historyService.traerHistoria(Number(this.historyForm.value.id)).subscribe({
        next: (response) => {
          this.historia.content = response.data.content
          this.historia.id = response.data.id
          this.mostrarMensaje('historia cargada satisfactoriamente.', 200)
        },
        error: err => this.mostrarMensaje('Error al Cargar la historia', err.status)
    });
  }



  guardarManual() {
    this.historyService.guardarManual(this.historia).subscribe({
        next: () => this.mostrarMensaje('Cambios guardados satisfactoriamente.', 200),
        error: err => this.mostrarMensaje('Error al guardar automáticamente: ' + err, err.status)
    });
  }

  ngOnDestroy(): void {
    if (this.autoSaveSub) this.autoSaveSub.unsubscribe();
  }

  mostrarMensaje(msg: string, codigo: number) {
    this.mensaje = msg;
    this.mensajeTipo = codigo;

    if (codigo == 200) {
      setTimeout(() => (this.mensaje = ''), 3000);
    }
  }

  cancel(): void {
    this.historyForm.reset();
    this.modalService.closeAll();
  }

}

