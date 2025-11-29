export interface ILoginResponse {
  accessToken: string;
  expiresIn: number
}

export interface IResponse<T> {
  data: T;
  message: string,
  meta: T;
  Ilo: ILoginResponse[]
}

export interface IUser {
  id?: number;
  username?: string;
  name?: string;
  lastname?: string;
  email?: string;
  password?: string;
  status?: boolean;
  photo?: string;
  authorities?: IAuthority[];
  role?: IRole
}

export interface IUser2 {
  id?: number;
  username?: string;
  name?: string;
  lastname?: string;
  email?: string;
  password?: string;
  status?: boolean;
  photo?: string;
  authorities?: IAuthority[];
  role?: IRole2
}

export interface IRole2 {
  name : string;
}

export interface IAuthority {
  authority: string;
}

export interface IFeedBackMessage {
  type?: IFeedbackStatus;
  message?: string;
}

export enum IFeedbackStatus {
  success = "SUCCESS",
  error = "ERROR",
  default = ''
}

export enum IRoleType {
  admin = "ROLE_ADMIN",
  user = "ROLE_USER",
  superAdmin = 'SUPER_ADMIN'
}
export interface IRole {
  createdAt: string;
  description: string;
  id: number;
  name : string;
  updatedAt: string;
}

export interface ISearch {
  page?: number;
  size?: number;
  pageNumber?: number;
  pageSize?: number;
  totalElements?: number;
  totalPages?:number;
}

export interface IGenre {
  id?: number;
  name: string;
  id_usuario_creador?: number;
  fecha_creacion?: string;
}

export interface IForumPost {
  id?: number;
  storyId?: number;
  storyTitle?: string;     
  synopsis: string;
  genre: string;
  isPublic: boolean;
  publishedAt?: string;    
  views?: number;          
  comments?: number;      
  authorName?: string;    
  content?: string;      
}

export interface Game {
  players: Player[];
  state: {
    currentTurn: number;
    turn: number;
    units: Unit[];
    status: string;
    winnerId?: number;
  };
}

export interface HexTile {
  q: number;
  r: number;
  type: string;
  color: string;
  elevation: number;
  moisture: number;
  temperature: number;
  unit?: Unit;
  isHighlighted?: boolean;
  isReachable?: boolean;
  isAttackable?: boolean;
}

export interface AxialCoord {
  q: number;
  r: number;
}

export interface ChatMessage {
  player: string;
  text: string;
  timestamp: Date;
  isSystem?: boolean;
}

export interface CubeCoord {
  x: number;
  y: number;
  z: number;
}

export type UnitType = 'warrior' | 'archer' | 'cavalry' | 'settler';

export interface Point {
  x: number;
  y: number;
}

export interface Unit {
  id: string;
  name: string;
  type: UnitType;
  owner: number;
  q: number;
  r: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  movement: number;
  remainingMovement: number;
  hasAttacked: boolean;
  color: string;
  icon: string;
}

export interface Player {
  id: string;
  name: string;
  playerIndex: number;
  color: string;
  isAI: boolean;
  units: Unit[];
  resources: {
    gold: number;
    food: number;
  };
}

export type GameStatus = 'SETUP' | 'WAITING' | 'ACTIVE' | 'FINISHED';


export interface GameConfig {
  mapSize: number;
  scale: number;
  playerNames: string[];
  gameMode: GameMode;
  startingUnits: number;
}

export type GameMode = 'local' | 'vs-ai';

export interface CombatResult {
  attacker: Unit;
  defender: Unit;
  attackerDamage: number;
  defenderDamage: number;
  attackerDied: boolean;
  defenderDied: boolean;
}

export interface MoveResult {
  unit: Unit;
  fromQ: number;
  fromR: number;
  toQ: number;
  toR: number;
  path: AxialCoord[];
}

export interface GameAction {
  type: 'move' | 'attack' | 'end-turn' | 'select';
  playerId: number;
  data: any;
  timestamp: Date;
}

export interface TerrainInfo {
  name: string;
  color: string;
  movementCost: number;
  defenseBonus: number;
  isPassable: boolean;
}

export const TERRAIN_CONFIG: Record<string, TerrainInfo> = {
  'Lagos o aguas profundas': { name: 'Deep Water', color: '#1e3a5f', movementCost: Infinity, defenseBonus: 0, isPassable: false },
  'Rios o aguas no tan profundas': { name: 'Shallow Water', color: '#2e5a8f', movementCost: 3, defenseBonus: -1, isPassable: true },
  'Playa': { name: 'Beach', color: '#f4e4c1', movementCost: 1, defenseBonus: 0, isPassable: true },
  'Desiertos': { name: 'Desert', color: '#e8d4a0', movementCost: 2, defenseBonus: 0, isPassable: true },
  'Sabana': { name: 'Savanna', color: '#c4b550', movementCost: 1, defenseBonus: 0, isPassable: true },
  'Jungla': { name: 'Jungle', color: '#2d5016', movementCost: 2, defenseBonus: 2, isPassable: true },
  'Praderas': { name: 'Grassland', color: '#88aa55', movementCost: 1, defenseBonus: 0, isPassable: true },
  'Bosques': { name: 'Forest', color: '#2d6930', movementCost: 2, defenseBonus: 1, isPassable: true },
  'Pantano': { name: 'Swamp', color: '#3a4d2d', movementCost: 3, defenseBonus: -1, isPassable: true },
  'Montañas': { name: 'Mountains', color: '#8b8680', movementCost: 3, defenseBonus: 3, isPassable: true },
  'Tundra': { name: 'Tundra', color: '#a0b0a0', movementCost: 2, defenseBonus: 0, isPassable: true },
  'Nieve': { name: 'Snow', color: '#e8f4f8', movementCost: 2, defenseBonus: 0, isPassable: true },
};

export const UNIT_TEMPLATES: Record<UnitType, Omit<Unit, 'id' | 'owner' | 'q' | 'r' | 'color'>> = {
  warrior: {
    name: 'Warrior',
    type: 'warrior',
    health: 100,
    maxHealth: 100,
    attack: 25,
    defense: 15,
    movement: 2,
    remainingMovement: 2,
    hasAttacked: false,
    icon: '⚔️',
  },
  archer: {
    name: 'Archer',
    type: 'archer',
    health: 70,
    maxHealth: 70,
    attack: 30,
    defense: 8,
    movement: 2,
    remainingMovement: 2,
    hasAttacked: false,
    icon: '🏹',
  },
  cavalry: {
    name: 'Cavalry',
    type: 'cavalry',
    health: 90,
    maxHealth: 90,
    attack: 35,
    defense: 10,
    movement: 4,
    remainingMovement: 4,
    hasAttacked: false,
    icon: '🐴',
  },
  settler: {
    name: 'Settler',
    type: 'settler',
    health: 50,
    maxHealth: 50,
    attack: 5,
    defense: 5,
    movement: 2,
    remainingMovement: 2,
    hasAttacked: false,
    icon: '🏠',
  },
};

export interface GameState {
  gameId: number;
  gameCode: string;
  status: string;
  currentTurn: number;
  turnNumber: number;
  winnerId?: number;
  seed: number;
  mapSize: number;
  units: GameUnit[];
  hostPlayer: PlayerInfo;
  guestPlayer?: PlayerInfo;
}

export interface PlayerInfo {
  playerId: string;
  playerName: string;
  playerIndex: number;
  color: string;
}

export interface GameUnit {
  id: string;
  name: string;
  type: string;
  owner: number;
  q: number;
  r: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  movement: number;
  remainingMovement: number;
  hasAttacked: boolean;
  color: string;
  icon: string;
}