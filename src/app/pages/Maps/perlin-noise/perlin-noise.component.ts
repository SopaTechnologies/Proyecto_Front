import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef  } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AfterViewInit, OnInit } from "@angular/core";
import { TerrainGeneratorService } from '../../../services/Maps-Generate/terrain-generator.service';
import { HexGridService } from '../../../services/Maps-Generate/hex-grid.service';
import { HexTile } from '../../../interfaces';
@Component({
  selector: 'app-perlin-noise',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perlin-noise.component.html',
  styleUrl: './perlin-noise.component.scss'
})
export class PerlinNoiseComponent implements OnInit, AfterViewInit{
  @ViewChild('mapCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;


  tiles: HexTile[] = [];
  selectedTile: HexTile | null = null;
  seed: number = 12345;
  mapSize: number = 30;
  hexSize: number = 15;
  scale: number = 0.05;
  showSettings: boolean = false;

  terrainTypes = [
    { name: 'Lagos o aguas profundas', color: '#1e3a5f' },
    { name: 'Rios o aguas no profundas', color: '#2e5a8f' },
    { name: 'Playas', color: '#f4e4c1' },
    { name: 'Desiertos', color: '#e8d4a0' },
    { name: 'Praderas', color: '#88aa55' },
    { name: 'Bosques', color: '#2d6930' },
    { name: 'Jungla', color: '#2d5016' },
    { name: 'Montañas', color: '#8b8680' },
    { name: 'Nieve', color: '#e8f4f8' }
  ];

  constructor(
    private terrainGen: TerrainGeneratorService,
    private hexGrid: HexGridService
  ) {}

  ngOnInit(): void {
    this.generateNewMap();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.renderMap(), 0);
  }

  toggleSettings(): void {
    this.showSettings = !this.showSettings;
  }

  generateNewMap(): void {
    const radius = Math.floor(this.mapSize / 2);
    this.terrainGen.generateMap(this.seed, radius, this.scale)
      .subscribe(tiles => {
        this.tiles = tiles;
        this.renderMap();
      });
  }

  renderMap(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    this.tiles.forEach(tile => {
      const { x, y } = this.hexGrid.axialToPixel(tile.q, tile.r, this.hexSize);
      
      ctx.save();
      ctx.translate(centerX + x, centerY + y);
      
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const hx = this.hexSize * Math.cos(angle);
        const hy = this.hexSize * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      
      ctx.fillStyle = tile.color;
      ctx.fill();
      
      if (this.selectedTile && this.selectedTile.q === tile.q && this.selectedTile.r === tile.r) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      
      ctx.restore();
    });
  }

  onCanvasClick(event: MouseEvent): void {
    this.handleCanvasInteraction(event);
  }

  onCanvasHover(event: MouseEvent): void {
  }

  private handleCanvasInteraction(event: MouseEvent): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left - canvas.width / 2;
    const y = event.clientY - rect.top - canvas.height / 2;
    
    const { q, r } = this.hexGrid.pixelToAxial(x, y, this.hexSize);
    const tile = this.tiles.find(t => t.q === q && t.r === r);
    
    if (tile) {
      this.selectedTile = tile;
      this.renderMap();
    }
  }

  downloadMap(): void {
    const canvas = this.canvasRef.nativeElement;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `map-${this.seed}.png`;
    link.href = url;
    link.click();
  }
}
