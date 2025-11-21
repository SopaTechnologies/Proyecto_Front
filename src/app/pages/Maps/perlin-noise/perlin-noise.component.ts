import { CommonModule } from "@angular/common";
import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnInit
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TerrainGeneratorService } from "../../../services/Maps-Generate/terrain-generator.service";
import { HexGridService } from "../../../services/Maps-Generate/hex-grid.service";
import { HexTile } from "../../../interfaces";

@Component({
  selector: "app-perlin-noise",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./perlin-noise.component.html",
  styleUrl: "./perlin-noise.component.scss"
})
export class PerlinNoiseComponent implements OnInit, AfterViewInit {
  @ViewChild("mapCanvas") canvasRef!: ElementRef<HTMLCanvasElement>;

  // ========= CONFIGURACIÓN GENERAL =========
  tiles: HexTile[] = [];
  selectedTile: HexTile | null = null;

  seed: number = this.setRandom();
  mapSize: number = 50;

  // Tamaño base del hexágono
  hexSize: number = 140;

  // Escala del ruido (más alto = más variedad)
  scale: number = 0.15;

  showSettings: boolean = false;

  // ========= PAN & ZOOM =========
  offsetX: number = 0;
  offsetY: number = 0;
  zoom: number = 1;
  isDragging: boolean = false;
  lastMouseX: number = 0;
  lastMouseY: number = 0;

  // ========= LEYENDA =========
  terrainTypes = [
    { name: "Lagos o aguas profundas", color: "#1e3a5f" },
    { name: "Rios o aguas no profundas", color: "#2e5a8f" },
    { name: "Playas", color: "#f4e4c1" },
    { name: "Desiertos", color: "#e8d4a0" },
    { name: "Praderas", color: "#88aa55" },
    { name: "Bosques", color: "#2d6930" },
    { name: "Jungla", color: "#2d5016" },
    { name: "Montañas", color: "#8b8680" },
    { name: "Tundra o Nieve", color: "#e8f4f8" }
  ];

  constructor(
    private terrainGen: TerrainGeneratorService,
    private hexGrid: HexGridService
  ) {}

  // ========= CICLO DE VIDA =========

  ngOnInit(): void {
    this.generateNewMap();
  }

  ngAfterViewInit(): void {
    // Pequeño delay para asegurar que el canvas existe
    setTimeout(() => this.renderMap(), 0);
  }

  // ========= UTILIDADES =========

  setRandom(): number {
    return Math.floor(1000 + Math.random() * 9000);
  }

  // ========= GENERACIÓN DE MAPA =========

  generateNewMap(): void {
    this.seed = this.setRandom();
    const radius = Math.floor(this.mapSize / 2);

    this.terrainGen.generateMap(this.seed, radius, this.scale).subscribe(
      (tiles) => {
        this.tiles = tiles;
        this.selectedTile = null;
        this.renderMap();
      }
    );
  }

  // ========= DIBUJADO DEL MAPA =========

  renderMap(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Fondo general del mapa
    ctx.fillStyle = "#0a1628";
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    ctx.save();
    ctx.translate(this.offsetX + centerX, this.offsetY + centerY);
    ctx.scale(this.zoom, this.zoom);

    this.tiles.forEach((tile) => {
      const { x, y } = this.hexGrid.axialToPixel(tile.q, tile.r, this.hexSize);
      const isSelected =
        this.selectedTile &&
        this.selectedTile.q === tile.q &&
        this.selectedTile.r === tile.r;

      this.drawHex(ctx, x, y, this.hexSize, tile.color, !!isSelected);
    });

    ctx.restore();
  }

  /**
   * Dibuja un solo hexágono. Si `highlight` es true,
   * se le aplica un glow dorado, borde más grueso y un hex interior.
   */
  private drawHex(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    fillColor: string,
    highlight: boolean
  ): void {
    ctx.save();
    ctx.translate(x, y);

    // Glow para el hexágono seleccionado
    if (highlight) {
      ctx.shadowColor = "rgba(212, 165, 116, 0.9)"; 
      ctx.shadowBlur = 24;
    }

    // Hex principal
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const hx = size * Math.cos(angle);
      const hy = size * Math.sin(angle);
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();

    ctx.fillStyle = fillColor;
    ctx.fill();

    ctx.lineWidth = highlight ? 3 : 1;
    ctx.strokeStyle = highlight ? "#ffd27f" : "rgba(0, 0, 0, 0.2)";
    ctx.stroke();

    // Hexágono interior decorativo para el seleccionado
    if (highlight) {
      ctx.shadowBlur = 0; 
      const innerSize = size * 0.6;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const hx = innerSize * Math.cos(angle);
        const hy = innerSize * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.restore();
  }

  // ========= INTERACCIÓN CON EL CANVAS =========

  onCanvasClick(event: MouseEvent): void {
    this.handleCanvasInteraction(event);
  }

  onCanvasHover(event: MouseEvent): void {
    // Reservado por si luego quieres hover
  }

  private handleCanvasInteraction(event: MouseEvent): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();

    const x =
      (event.clientX - rect.left - canvas.width / 2 - this.offsetX) /
      this.zoom;
    const y =
      (event.clientY - rect.top - canvas.height / 2 - this.offsetY) /
      this.zoom;

    const { q, r } = this.hexGrid.pixelToAxial(x, y, this.hexSize);
    const tile = this.tiles.find((t) => t.q === q && t.r === r);

    if (tile) {
      this.selectedTile = tile;
      this.renderMap();
    }
  }

  // ===== Drag para mover el mapa =====

  onMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
  }

  onMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      const deltaX = event.clientX - this.lastMouseX;
      const deltaY = event.clientY - this.lastMouseY;
      this.offsetX += deltaX;
      this.offsetY += deltaY;
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
      this.renderMap();
    }
  }

  onMouseUp(event: MouseEvent): void {
    this.isDragging = false;
  }

  // ===== Zoom con la rueda =====

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const zoomFactor = 0.1;
    const zoomDelta = event.deltaY > 0 ? -zoomFactor : zoomFactor;
    this.zoom = Math.max(0.1, Math.min(5, this.zoom + zoomDelta));
    this.renderMap();
  }
}
