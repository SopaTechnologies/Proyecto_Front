import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { HistoriaService } from '../../services/history.service';
import { HistoriaModel } from '../../models/historia.model';

type DashboardHistory = HistoriaModel & {
  genero?: string;
  finalizada?: boolean;
  updatedAt?: string | Date;
  createdAt?: string | Date;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  // Servicios
  private historiaService = inject(HistoriaService);
  private router = inject(Router);

  // Datos base
  histories: DashboardHistory[] = [];
  recentHistories: DashboardHistory[] = [];

  // Métricas que usamos en el HTML
  totalHistorias = 0;
  historiasEnProgreso = 0;
  totalElementosNarrativos = 0;     // TODO: conectar con servicio real
  sesionesRecientes = 0;            // TODO: conectar con servicio real

  progresoHistoriasEnCurso = 0;     // porcentaje 0–100
  progresoElementosNarrativos = 0;  // porcentaje 0–100

  ngOnInit(): void {
    this.cargarHistorias();
  }

  private cargarHistorias(): void {
    this.historiaService.getAll().subscribe({
      next: (response: any) => {
        const data = response?.data ?? response;
        this.histories = (data || []) as DashboardHistory[];

        // Total de historias
        this.totalHistorias = this.histories.length;

        // Historias en progreso (asumimos que "finalizada" = true/false)
        this.historiasEnProgreso = this.histories.filter(
          (h) => !h.finalizada
        ).length;

        // Historias recientes (máx. 5, ordenadas por updatedAt/createdAt)
        this.recentHistories = [...this.histories]
          .sort((a, b) => {
            const aDate =
              new Date(
                (a.updatedAt || a.createdAt || '') as string
              ).getTime() || 0;
            const bDate =
              new Date(
                (b.updatedAt || b.createdAt || '') as string
              ).getTime() || 0;
            return bDate - aDate;
          })
          .slice(0, 5);

        // Métricas simples de progreso (puedes ajustarlas a tu lógica real)
        if (this.totalHistorias > 0) {
          const completadas = this.totalHistorias - this.historiasEnProgreso;
          this.progresoHistoriasEnCurso = Math.round(
            (completadas / this.totalHistorias) * 100
          );
        } else {
          this.progresoHistoriasEnCurso = 0;
        }

        // De momento dejamos valores dummy para elementos narrativos / sesiones
        this.totalElementosNarrativos = 0;
        this.sesionesRecientes = 0;
        this.progresoElementosNarrativos = 0;
      },
      error: (err) => {
        console.error('[Dashboard] Error al cargar historias:', err);
      },
    });
  }

  // ===== Acciones de los botones del HTML =====

  onCreateHistory(): void {
    // Va al listado de historias y tú ahí ya abres el modal si quieres
    this.router.navigate(['/app/histories'], {
      queryParams: { action: 'create' },
    });
  }

  onGoToHistories(): void {
    this.router.navigate(['/app/histories']);
  }

  onGoToNarrativeElements(): void {
    this.router.navigate(['/app/histories'], {
      queryParams: { show: 'narrative-elements' },
    });
  }

  onEditHistory(id: number): void {
    this.router.navigate(['/app/histories'], {
      queryParams: { edit: id },
    });
  }
}
