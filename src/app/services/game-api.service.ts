import { Injectable } from '@angular/core';
import {PlayerInfo , GameUnit , GameState} from '../interfaces/index'
import { HttpClient } from '@angular/common/http';
import { CompatClient, Stomp } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import SockJS from 'sockjs-client'

@Injectable({
  providedIn: 'root'
})
export class GameApiService {

 private apiUrl = 'http://localhost:8080/api/game';
  private wsUrl = 'http://localhost:8080/ws';
  
  private stompClient: CompatClient | null = null;
  private gameState$ = new BehaviorSubject<GameState | null>(null);
  
  constructor(private http: HttpClient) {}
  
  createGame(playerName: string, startingUnits: number = 3): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, { playerName, startingUnits });
  }
  
  joinGame(gameCode: string, playerName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/join`, { gameCode, playerName });
  }
  
  getGameState(gameId: number): Observable<GameState> {
    return this.http.get<GameState>(`${this.apiUrl}/${gameId}/state`);
  }
  
  moveUnit(gameId: number, unitId: string, targetQ: number, targetR: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${gameId}/move`, {
      unitId,
      targetQ,
      targetR
    });
  }
  
  attack(gameId: number, attackerId: string, defenderId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${gameId}/attack`, {
      attackerId,
      defenderId
    });
  }
  
  endTurn(gameId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${gameId}/end-turn`, {});
  }
  
  connectToGame(gameId: number): void {
    const socket = new SockJS(this.wsUrl);
    this.stompClient = Stomp.over(socket);
    
    this.stompClient.connect({}, () => {
      this.stompClient!.subscribe(`/topic/game/${gameId}`, (message) => {
        const gameState = JSON.parse(message.body);
        this.gameState$.next(gameState);
      });
      
      // Load initial state
      this.getGameState(gameId).subscribe(state => {
        this.gameState$.next(state);
      });
    });
  }
  
  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.disconnect();
    }
  }
  
  getGameStateObservable(): Observable<GameState | null> {
    return this.gameState$.asObservable();
  }
}
