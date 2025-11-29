import { Injectable } from '@angular/core';
import {  AxialCoord, CubeCoord, Point, HexTile, TERRAIN_CONFIG} from '../../interfaces/index';
@Injectable({
  providedIn: 'root'
})
export class HexGridService {
cubeToAxial(x: number, y: number, z: number): AxialCoord {
    return { q: x, r: z };
  }

  axialToCube(q: number, r: number): CubeCoord {
    const x = q;
    const z = r;
    const y = -x - z;
    return { x, y, z };
  }

  axialToPixel(q: number, r: number, size: number): Point {
    const x = size * (3/2 * q);
    const y = size * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
    return { x, y };
  }

  pixelToAxial(x: number, y: number, size: number): AxialCoord {
    const q = (2/3 * x) / size;
    const r = (-1/3 * x + Math.sqrt(3)/3 * y) / size;
    return this.roundAxial(q, r);
  }

  roundAxial(q: number, r: number): AxialCoord {
    const { x, y, z } = this.axialToCube(q, r);
    let rx = Math.round(x);
    let ry = Math.round(y);
    let rz = Math.round(z);

    const xDiff = Math.abs(rx - x);
    const yDiff = Math.abs(ry - y);
    const zDiff = Math.abs(rz - z);

    if (xDiff > yDiff && xDiff > zDiff) {
      rx = -ry - rz;
    } else if (yDiff > zDiff) {
      ry = -rx - rz;
    } else {
      rz = -rx - ry;
    }

    return this.cubeToAxial(rx, ry, rz);
  }

  distance(q1: number, r1: number, q2: number, r2: number): number {
    const { x: x1, y: y1, z: z1 } = this.axialToCube(q1, r1);
    const { x: x2, y: y2, z: z2 } = this.axialToCube(q2, r2);
    return (Math.abs(x1 - x2) + Math.abs(y1 - y2) + Math.abs(z1 - z2)) / 2;
  }

  getNeighbors(q: number, r: number): AxialCoord[] {
    const directions = [
      [1, 0], [1, -1], [0, -1],
      [-1, 0], [-1, 1], [0, 1]
    ];
    return directions.map(([dq, dr]) => ({ q: q + dq, r: r + dr }));
  }
  getReachableTiles(
    startQ: number, 
    startR: number, 
    movement: number, 
    tiles: HexTile[],
    occupiedPositions: Set<string>
  ): AxialCoord[] {
    const visited = new Map<string, number>();
    const queue: { q: number; r: number; cost: number }[] = [{ q: startQ, r: startR, cost: 0 }];
    const reachable: AxialCoord[] = [];
    
    visited.set(`${startQ},${startR}`, 0);

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      for (const neighbor of this.getNeighbors(current.q, current.r)) {
        const key = `${neighbor.q},${neighbor.r}`;
        const tile = tiles.find(t => t.q === neighbor.q && t.r === neighbor.r);
        
        if (!tile) continue;
        
        const terrainInfo = TERRAIN_CONFIG[tile.type];
        if (!terrainInfo || !terrainInfo.isPassable) continue;
        
        const newCost = current.cost + terrainInfo.movementCost;
        
        if (newCost <= movement && (!visited.has(key) || visited.get(key)! > newCost)) {
          visited.set(key, newCost);
          queue.push({ q: neighbor.q, r: neighbor.r, cost: newCost });
          
          if (!occupiedPositions.has(key)) {
            reachable.push({ q: neighbor.q, r: neighbor.r });
          }
        }
      }
    }

    return reachable;
  }

  getAttackableTiles(
    unitQ: number,
    unitR: number,
    tiles: HexTile[],
    enemyPositions: Set<string>
  ): AxialCoord[] {
    const neighbors = this.getNeighbors(unitQ, unitR);
    return neighbors.filter(n => {
      const key = `${n.q},${n.r}`;
      const tile = tiles.find(t => t.q === n.q && t.r === n.r);
      return tile && enemyPositions.has(key);
    });
  }

  findPath(
    startQ: number,
    startR: number,
    endQ: number,
    endR: number,
    tiles: HexTile[],
    occupiedPositions: Set<string>
  ): AxialCoord[] | null {
    const openSet: { q: number; r: number; g: number; f: number; parent?: AxialCoord }[] = [];
    const closedSet = new Set<string>();
    
    openSet.push({
      q: startQ,
      r: startR,
      g: 0,
      f: this.distance(startQ, startR, endQ, endR)
    });

    while (openSet.length > 0) {

      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift()!;
      const currentKey = `${current.q},${current.r}`;

      if (current.q === endQ && current.r === endR) {
        // Reconstruct path
        const path: AxialCoord[] = [];
        let node: typeof current | undefined = current;
        while (node) {
          path.unshift({ q: node.q, r: node.r });
          node = node.parent ? openSet.find(n => n.q === node!.parent!.q && n.r === node!.parent!.r) : undefined;
        }
        return path;
      }

      closedSet.add(currentKey);

      for (const neighbor of this.getNeighbors(current.q, current.r)) {
        const neighborKey = `${neighbor.q},${neighbor.r}`;
        
        if (closedSet.has(neighborKey)) continue;
        if (occupiedPositions.has(neighborKey) && !(neighbor.q === endQ && neighbor.r === endR)) continue;

        const tile = tiles.find(t => t.q === neighbor.q && t.r === neighbor.r);
        if (!tile) continue;

        const terrainInfo = TERRAIN_CONFIG[tile.type];
        if (!terrainInfo || !terrainInfo.isPassable) continue;

        const g = current.g + terrainInfo.movementCost;
        const h = this.distance(neighbor.q, neighbor.r, endQ, endR);
        const f = g + h;

        const existingNode = openSet.find(n => n.q === neighbor.q && n.r === neighbor.r);
        if (!existingNode || existingNode.g > g) {
          if (existingNode) {
            existingNode.g = g;
            existingNode.f = f;
            existingNode.parent = { q: current.q, r: current.r };
          } else {
            openSet.push({
              q: neighbor.q,
              r: neighbor.r,
              g,
              f,
              parent: { q: current.q, r: current.r }
            });
          }
        }
      }
    }

    return null;
  }
}

