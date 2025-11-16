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
      return { q, r, type: 'deep_water', color: '#1e3a5f', elevation, moisture, temperature };
    }


    if (elevation < 0.4) {
      return { q, r, type: 'shallow_water', color: '#2e5a8f', elevation, moisture, temperature };
    }


    if (elevation < 0.45) {
      return { q, r, type: 'beach', color: '#f4e4c1', elevation, moisture, temperature };
    }


    if (temperature > 0.7) {
      if (moisture < 0.3) return { q, r, type: 'desert', color: '#e8d4a0', elevation, moisture, temperature };
      if (moisture < 0.6) return { q, r, type: 'savanna', color: '#c4b550', elevation, moisture, temperature };
      return { q, r, type: 'jungle', color: '#2d5016', elevation, moisture, temperature };
    }

    if (temperature > 0.4) {
      if (moisture < 0.3) return { q, r, type: 'grassland', color: '#88aa55', elevation, moisture, temperature };
      if (moisture < 0.7) return { q, r, type: 'forest', color: '#2d6930', elevation, moisture, temperature };
      return { q, r, type: 'swamp', color: '#3a4d2d', elevation, moisture, temperature };
    }


    if (elevation > 0.7) {
      return { q, r, type: 'mountain', color: '#8b8680', elevation, moisture, temperature };
    }
    if (moisture < 0.4) return { q, r, type: 'tundra', color: '#a0b0a0', elevation, moisture, temperature };
    return { q, r, type: 'snow', color: '#e8f4f8', elevation, moisture, temperature };
  }
}
//
//
//
