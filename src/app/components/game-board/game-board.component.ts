import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import { CommonModule, DecimalPipe } from "@angular/common";
import { GameState, GameUnit } from "../../interfaces/index";
import { GameApiService } from "../../services/game-api.service";
import { TerrainGeneratorService } from "../../services/Maps-Generate/terrain-generator.service";
import { HexGridService } from "../../services/Maps-Generate/hex-grid.service";
import { HexTile } from "../../interfaces";
import { Subscription } from "rxjs";
import { ActivatedRoute, Router} from "@angular/router";

interface CombatLog {
  message: string;
  isSystem: boolean;
}

@Component({
  selector: "app-game-board",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./game-board.component.html",
  styleUrl: "./game-board.component.scss",
})
export class GameBoardComponent implements OnInit, OnDestroy {
  @ViewChild("gameCanvas") canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() gameId!: number;
  @Input() playerIndex!: number;
  @Output() returnToLobbyEvent = new EventEmitter<void>();

  gameState: GameState | null = null;
  tiles: HexTile[] = [];
  selectedUnit: GameUnit | null = null;

  hexSize: number = 40;
  offsetX: number = 0;
  offsetY: number = 0;
  zoom: number = 1;
  isDragging: boolean = false;
  lastMouseX: number = 0;
  lastMouseY: number = 0;

  reachableTiles: Set<string> = new Set();
  attackableTiles: Set<string> = new Set();
  combatLog: CombatLog[] = [];

  attackRangeTiles: Set<string> = new Set();

  private gameStateSubscription?: Subscription;

  constructor(
    private gameApi: GameApiService,
    private terrainGen: TerrainGeneratorService,
    private hexGrid: HexGridService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.gameId = +params["gameId"];
      this.playerIndex = +params["playerIndex"];

      this.gameStateSubscription = this.gameApi
        .getGameStateObservable()
        .subscribe((state) => {
          if (state) {
            this.gameState = state;

            if (this.tiles.length === 0) {
              this.generateMap(state.seed, state.mapSize);
            }

            setTimeout(() => this.renderGame(), 0);
          }
        });

      this.gameApi.getGameState(this.gameId).subscribe((state) => {
        this.gameState = state;
        this.addSystemLog(
          `Game started! ${this.getCurrentPlayerName()}'s turn.`
        );
      });
    });

    this.gameApi.getGameState(this.gameId).subscribe((state) => {
      this.gameState = state;
      this.addSystemLog(`Game started! ${this.getCurrentPlayerName()}'s turn.`);

      if (this.isMyTurn()) {
        const myUnits = this.gameState.units.filter(
          (u) => u.owner === this.playerIndex
        );
        if (myUnits.length > 0) {
          this.selectUnit(myUnits[0]);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.gameStateSubscription?.unsubscribe();
  }

  generateMap(seed: number, mapSize: number): void {
    const radius = Math.floor(mapSize / 2);
    this.terrainGen.generateMap(seed, radius, 0.15).subscribe((tiles) => {
      this.tiles = tiles;
      this.renderGame();
    });
  }

  renderGame(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas || !this.gameState) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = "#0a1628";
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    ctx.save();
    ctx.translate(this.offsetX + centerX, this.offsetY + centerY);
    ctx.scale(this.zoom, this.zoom);

    this.tiles.forEach((tile) => {
      const { x, y } = this.hexGrid.axialToPixel(tile.q, tile.r, this.hexSize);
      const isSelected = !!(
        this.selectedUnit &&
        this.selectedUnit.q === tile.q &&
        this.selectedUnit.r === tile.r
      );
      const isReachable = this.reachableTiles.has(`${tile.q},${tile.r}`);
      const isAttackable = this.attackableTiles.has(`${tile.q},${tile.r}`);

      this.drawHex(
        ctx,
        x,
        y,
        this.hexSize,
        tile.color,
        isSelected,
        isReachable,
        isAttackable
      );
    });

    this.gameState.units.forEach((unit) => {
      const { x, y } = this.hexGrid.axialToPixel(unit.q, unit.r, this.hexSize);
      this.drawUnit(ctx, x, y, unit);
    });

    ctx.restore();
  }

  private drawHex(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    fillColor: string,
    isSelected: boolean,
    isReachable: boolean,
    isAttackable: boolean
  ): void {
    const coord = `${Math.round(x / this.hexSize)},${Math.round(
      y / this.hexSize
    )}`;
    const isInAttackRange = this.attackRangeTiles.has(coord);
    ctx.save();
    ctx.translate(x, y);

    if (isSelected || isReachable || isAttackable || isInAttackRange) {
      ctx.shadowBlur = 20;
      if (isSelected) ctx.shadowColor = "rgba(255, 215, 0, 0.8)";
      else if (isAttackable) ctx.shadowColor = "rgba(255, 0, 0, 0.8)";
      else if (isReachable) ctx.shadowColor = "rgba(0, 255, 0, 0.6)";
      else if (isInAttackRange) ctx.shadowColor = "rgba(255, 165, 0, 0.5)";
    }

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const hx = size * Math.cos(angle);
      const hy = size * Math.sin(angle);
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();

    if (isReachable) {
      ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
      ctx.fill();
    } else if (isAttackable) {
      ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
      ctx.fill();
    } else if (isInAttackRange) {
      ctx.fillStyle = "rgba(255, 165, 0, 0.15)";
      ctx.fill();
    } else {
      ctx.fillStyle = fillColor;
      ctx.fill();
    }

    ctx.lineWidth = isSelected ? 3 : 1;
    ctx.strokeStyle = isSelected ? "#ffd700" : "rgba(0, 0, 0, 0.2)";
    ctx.stroke();

    ctx.restore();
  }

  private drawUnit(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    unit: GameUnit
  ): void {
    ctx.save();
    ctx.translate(x, y);

    ctx.beginPath();
    ctx.arc(0, 0, this.hexSize * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = unit.color;
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = `${this.hexSize * 0.8}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.fillText(unit.icon, 0, 0);

    const healthPercent = unit.health / unit.maxHealth;
    const barWidth = this.hexSize * 1.2;
    const barHeight = 5;
    const barY = this.hexSize * 0.8;

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);

    ctx.fillStyle =
      healthPercent > 0.5
        ? "#4caf50"
        : healthPercent > 0.25
        ? "#ff9800"
        : "#f44336";
    ctx.fillRect(-barWidth / 2, barY, barWidth * healthPercent, barHeight);

    ctx.restore();
  }

  onCanvasClick(event: MouseEvent): void {
    if (!this.gameState) return;

    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();

    const x =
      (event.clientX - rect.left - canvas.width / 2 - this.offsetX) / this.zoom;
    const y =
      (event.clientY - rect.top - canvas.height / 2 - this.offsetY) / this.zoom;

    const { q, r } = this.hexGrid.pixelToAxial(x, y, this.hexSize);

    const clickedUnit = this.gameState.units.find(
      (u) => u.q === q && u.r === r
    );

    if (clickedUnit) {
      if (clickedUnit.owner === this.playerIndex) {
        this.selectUnit(clickedUnit);
      } else if (this.selectedUnit && this.attackableTiles.has(`${q},${r}`)) {
        this.attackUnit(this.selectedUnit.id, clickedUnit.id);
      } else {
        this.showEnemyUnitRange(clickedUnit);
      }
    } else if (this.selectedUnit && this.reachableTiles.has(`${q},${r}`)) {
      this.moveUnit(this.selectedUnit.id, q, r);
    }
  }

  showEnemyUnitRange(unit: GameUnit): void {
    this.attackRangeTiles.clear();
    const rangeTiles = this.getAllTilesInRange(
      unit.q,
      unit.r,
      unit.attackRange
    );
    rangeTiles.forEach((tile) => {
      this.attackRangeTiles.add(`${tile.q},${tile.r}`);
    });
    this.renderGame();

    setTimeout(() => {
      this.attackRangeTiles.clear();
      this.renderGame();
    }, 3000);
  }

  selectUnit(unit: GameUnit): void {
    if (unit.owner !== this.playerIndex || !this.isMyTurn()) return;

    this.selectedUnit = unit;
    this.calculateReachableTiles(unit);
    this.calculateAttackableTiles(unit);
    this.calculateAttackRange(unit);
    this.renderGame();
  }

  deselectUnit(): void {
    this.selectedUnit = null;
    this.reachableTiles.clear();
    this.attackableTiles.clear();
    this.attackRangeTiles.clear();
    this.renderGame();
  }

  calculateAttackRange(unit: GameUnit): void {
    this.attackRangeTiles.clear();

    if (unit.hasAttacked) return;

    const allTiles = this.getAllTilesInRange(unit.q, unit.r, unit.attackRange);

    allTiles.forEach((tile) => {
      this.attackRangeTiles.add(`${tile.q},${tile.r}`);
    });
  }

  getAllTilesInRange(
    centerQ: number,
    centerR: number,
    range: number
  ): Array<{ q: number; r: number }> {
    const tiles: Array<{ q: number; r: number }> = [];

    for (let q = -range; q <= range; q++) {
      for (
        let r = Math.max(-range, -q - range);
        r <= Math.min(range, -q + range);
        r++
      ) {
        const distance = this.hexGrid.distance(
          centerQ,
          centerR,
          centerQ + q,
          centerR + r
        );
        if (distance <= range && distance > 0) {
          tiles.push({ q: centerQ + q, r: centerR + r });
        }
      }
    }

    return tiles;
  }

  calculateReachableTiles(unit: GameUnit): void {
    this.reachableTiles.clear();

    const occupiedPositions = new Set(
      this.gameState!.units.map((u) => `${u.q},${u.r}`)
    );

    const reachable = this.hexGrid.getReachableTiles(
      unit.q,
      unit.r,
      unit.remainingMovement,
      this.tiles,
      occupiedPositions
    );

    reachable.forEach((tile) => {
      this.reachableTiles.add(`${tile.q},${tile.r}`);
    });
  }

  calculateAttackableTiles(unit: GameUnit): void {
    this.attackableTiles.clear();

    if (unit.hasAttacked) return;

    const enemyUnits = this.gameState!.units.filter(
      (u) => u.owner !== unit.owner
    );

    enemyUnits.forEach((enemy) => {
      const distance = this.hexGrid.distance(unit.q, unit.r, enemy.q, enemy.r);
      if (distance <= unit.attackRange) {
        this.attackableTiles.add(`${enemy.q},${enemy.r}`);
      }
    });
  }

  moveUnit(unitId: string, targetQ: number, targetR: number): void {
    if (!this.isMyTurn()) return;

    this.gameApi.moveUnit(this.gameId, unitId, targetQ, targetR).subscribe({
      next: () => {
        this.addSystemLog(`Unit moved to (${targetQ}, ${targetR})`);
      },
      error: (err) => {
        console.error("Move error:", err);
      },
    });
  }

  attackUnit(attackerId: string, defenderId: string): void {
    if (!this.isMyTurn()) return;

    this.gameApi.attack(this.gameId, attackerId, defenderId).subscribe({
      next: (result) => {
        const msg =
          `${result.attacker.name} attacked ${result.defender.name}! ` +
          `Dealt ${result.defenderDamage} damage, took ${result.attackerDamage} counter-damage.`;
        this.addCombatLog(msg);

        if (result.defenderDied) {
          this.addCombatLog(`${result.defender.name} was destroyed!`);
        }
        if (result.attackerDied) {
          this.addCombatLog(
            `${result.attacker.name} was destroyed in counter-attack!`
          );
        }

        this.deselectUnit();

        // if (this.gameState && this.gameState.status === "FINISHED") {
        //   setTimeout(() => {
        //     this.showGameOverModal();
        //   }, 1000);
        // }
      },
      error: (err) => {
        console.error("Attack error:", err);
        this.addCombatLog(
          `Attack failed: ${err.error?.message || err.message}`
        );
      },
    });
  }

  endTurn(): void {
    if (!this.isMyTurn()) return;

    this.gameApi.endTurn(this.gameId).subscribe({
      next: () => {
        this.deselectUnit();
        this.addSystemLog(`Turn ended. ${this.getCurrentPlayerName()}'s turn.`);
      },
      error: (err) => {
        console.error("End turn error:", err);
      },
    });
  }

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
      this.renderGame();
    }
  }

  onMouseUp(event: MouseEvent): void {
    this.isDragging = false;
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const zoomFactor = 0.1;
    const zoomDelta = event.deltaY > 0 ? -zoomFactor : zoomFactor;
    this.zoom = Math.max(0.3, Math.min(3, this.zoom + zoomDelta));
    this.renderGame();
  }

  isMyTurn(): boolean {
    return this.gameState?.currentTurn === this.playerIndex;
  }

  getCurrentPlayerName(): string {
    if (!this.gameState) return "";
    return this.gameState.currentTurn === 0
      ? this.gameState.hostPlayer.playerName
      : this.gameState.guestPlayer?.playerName || "";
  }

  getCurrentPlayerColor(): string {
    if (!this.gameState) return "";
    return this.gameState.currentTurn === 0
      ? this.gameState.hostPlayer.color
      : this.gameState.guestPlayer?.color || "";
  }

  getPlayerUnitCount(playerIndex: number): number {
    if (!this.gameState) return 0;
    return this.gameState.units.filter((u) => u.owner === playerIndex).length;
  }

  getWinnerName(): string {
    if (!this.gameState || this.gameState.winnerId === undefined) return "";
    return this.gameState.winnerId === 0
      ? this.gameState.hostPlayer.playerName
      : this.gameState.guestPlayer?.playerName || "";
  }

  addCombatLog(message: string): void {
    this.combatLog.unshift({ message, isSystem: false });
    if (this.combatLog.length > 10) {
      this.combatLog = this.combatLog.slice(0, 10);
    }
  }

  addSystemLog(message: string): void {
    this.combatLog.unshift({ message, isSystem: true });
    if (this.combatLog.length > 10) {
      this.combatLog = this.combatLog.slice(0, 10);
    }
  }

  returnToLobby(): void {
    this.gameApi.disconnect();
    this.router.navigate(["/app/game-lobby"]);
  }
}
