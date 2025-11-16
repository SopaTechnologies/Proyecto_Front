import { Injectable } from '@angular/core';
import { AxialCoord, CubeCoord, Point } from '../../interfaces/index';

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
}
