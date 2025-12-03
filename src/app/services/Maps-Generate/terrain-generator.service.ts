import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { PerlinNoiseService } from './perlin-noise.service';
import { HexTile } from '../../interfaces/index';

@Injectable({
  providedIn: 'root'
})
export class TerrainGeneratorService {
  private elevationNoise!: PerlinNoiseService;
  private moistureNoise!: PerlinNoiseService;
  private temperatureNoise!: PerlinNoiseService;

  constructor(private perlinService: PerlinNoiseService) {}

  initializeWithSeed(seed: number): void {
    this.elevationNoise = new PerlinNoiseService();
    this.elevationNoise.initialize(seed);
    
    this.moistureNoise = new PerlinNoiseService();
    this.moistureNoise.initialize(seed + 1000);
    
    this.temperatureNoise = new PerlinNoiseService();
    this.temperatureNoise.initialize(seed + 2000);
  }

  generateMap(seed: number, radius: number, scale: number = 0.05): Observable<HexTile[]> {
    this.initializeWithSeed(seed);
    const tiles: HexTile[] = [];

    for (let q = -radius; q <= radius; q++) {
      for (let r = -radius; r <= radius; r++) {
        if (Math.abs(q) <= radius && Math.abs(r) <= radius && Math.abs(-q - r) <= radius) {
          const terrain = this.generateTerrain(q, r, scale);
          tiles.push(terrain);
        }
      }
    }

    return of(tiles).pipe(delay(0));
  }

  private generateTerrain(q: number, r: number, scale: number): HexTile {
    const elev = (this.elevationNoise.octaveNoise(q * scale, r * scale, 5, 0.5, 2.0) + 1) / 2;
    const moist = (this.moistureNoise.octaveNoise(q * scale * 1.3, r * scale * 1.3, 4, 0.6, 2.0) + 1) / 2;
    const temp = (this.temperatureNoise.octaveNoise(q * scale * 0.8, r * scale * 0.8, 3, 0.5, 2.0) + 1) / 2;

    return this.classifyTerrain(q, r, elev, moist, temp);
  }

  private classifyTerrain(
    q: number, 
    r: number, 
    elevation: number, 
    moisture: number, 
    temperature: number
  ): HexTile {


    if (elevation < 0.3) {
      return { q, r, type: 'Lagos o aguas profundas', color: '#1e3a5f', elevation, moisture, temperature };
    }


    if (elevation < 0.4) {
      return { q, r, type: 'Rios o aguas no tan profundas', color: '#2e5a8f', elevation, moisture, temperature };
    }


    if (elevation < 0.45) {
      return { q, r, type: 'Playa', color: '#f4e4c1', elevation, moisture, temperature };
    }


    if (temperature > 0.7) {
      if (moisture < 0.3) return { q, r, type: 'Desiertos', color: '#e8d4a0', elevation, moisture, temperature };
      if (moisture < 0.6) return { q, r, type: 'Sabana', color: '#c4b550', elevation, moisture, temperature };
      return { q, r, type: 'Jungla', color: '#2d5016', elevation, moisture, temperature };
    }

    if (temperature > 0.4) {
      if (moisture < 0.3) return { q, r, type: 'Praderas', color: '#88aa55', elevation, moisture, temperature };
      if (moisture < 0.7) return { q, r, type: 'Bosques', color: '#2d6930', elevation, moisture, temperature };
      return { q, r, type: 'Pantano', color: '#3a4d2d', elevation, moisture, temperature };
    }


    if (elevation > 0.7) {
      return { q, r, type: 'Montañas', color: '#8b8680', elevation, moisture, temperature };
    }
    if (moisture < 0.4) return { q, r, type: 'Tundra', color: '#a0b0a0', elevation, moisture, temperature };
    return { q, r, type: 'Nieve', color: '#e8f4f8', elevation, moisture, temperature };
  }
  findSpawnLocations(tiles: HexTile[], count: number): { q: number; r: number }[] {
    const passableTiles = tiles.filter(t => {
      const type = t.type;
      return type !== 'Lagos o aguas profundas' && 
             type !== 'Rios o aguas no tan profundas' &&
             type !== 'Montañas';
    });

    if (passableTiles.length < count) {
      console.warn('Not enough passable tiles for spawns');
      return passableTiles.slice(0, count).map(t => ({ q: t.q, r: t.r }));
    }
    const spawns: { q: number; r: number }[] = [];
    const gridService = new (class {
      distance(q1: number, r1: number, q2: number, r2: number): number {
        const x1 = q1, z1 = r1, y1 = -q1 - r1;
        const x2 = q2, z2 = r2, y2 = -q2 - r2;
        return (Math.abs(x1 - x2) + Math.abs(y1 - y2) + Math.abs(z1 - z2)) / 2;
      }
    })();
    const sortedByDistance = [...passableTiles].sort((a, b) => {
      const distA = Math.max(Math.abs(a.q), Math.abs(a.r), Math.abs(-a.q - a.r));
      const distB = Math.max(Math.abs(b.q), Math.abs(b.r), Math.abs(-b.q - b.r));
      return distB - distA;
    });

    spawns.push({ q: sortedByDistance[0].q, r: sortedByDistance[0].r });

    for (let i = 1; i < count; i++) {
      let bestTile = passableTiles[0];
      let bestMinDist = 0;

      for (const tile of passableTiles) {
        let minDist = Infinity;
        for (const spawn of spawns) {
          const dist = gridService.distance(tile.q, tile.r, spawn.q, spawn.r);
          minDist = Math.min(minDist, dist);
        }
        if (minDist > bestMinDist) {
          bestMinDist = minDist;
          bestTile = tile;
        }
      }
      
      spawns.push({ q: bestTile.q, r: bestTile.r });
    }
    return spawns;
  }
}
