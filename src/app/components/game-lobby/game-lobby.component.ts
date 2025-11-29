import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameApiService } from '../../services/game-api.service';

@Component({
  selector: 'app-game-lobby',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-lobby.component.html',
  styleUrl: './game-lobby.component.scss'
})

export class GameLobbyComponent implements OnInit {

  @Output() gameStarted = new EventEmitter<{ gameId: number, playerIndex: number }>();
  
  playerName: string = '';
  gameCode: string = '';
  joinGameCode: string = '';
  joinMode: boolean = false;
  gameStatus: string = '';
  errorMessage: string = '';
  
  private gameId: number = -1;
  private playerIndex: number = 0;
  
  constructor(private gameApi: GameApiService) {}
  
  ngOnInit(): void {

    this.gameApi.getGameStateObservable().subscribe(state => {
      if (state) {
        this.gameStatus = state.status;
        
     
        if (state.status === 'ACTIVE') {
          this.gameStarted.emit({ 
            gameId: state.gameId, 
            playerIndex: this.playerIndex 
          });
        }
      }
    });
  }
  
  createGame(): void {
    this.errorMessage = '';
    
    this.gameApi.createGame(this.playerName, 3).subscribe({
      next: (response) => {
        this.gameCode = response.gameCode;
        this.gameId = response.gameId;
        this.playerIndex = response.playerIndex;
        this.gameStatus = 'WAITING';
        
        this.gameApi.connectToGame(this.gameId);
      },
      error: (error) => {
        this.errorMessage = 'Error al crear sala.';
        console.error('Error al crear sala:', error);
      }
    });
  }
  
  joinGame(): void {
    this.errorMessage = '';
    
    this.gameApi.joinGame(this.joinGameCode, this.playerName).subscribe({
      next: (response) => {
        this.gameCode = response.gameCode;
        this.gameId = response.gameId;
        this.playerIndex = response.playerIndex;
        this.gameStatus = 'ACTIVE';
        
        this.gameApi.connectToGame(this.gameId);
        
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al unirse.';
        console.error('Error al unirse:', error);
      }
    });
  }
  
  copyCode(): void {
    navigator.clipboard.writeText(this.gameCode).then(() => {
    });
  }
}
