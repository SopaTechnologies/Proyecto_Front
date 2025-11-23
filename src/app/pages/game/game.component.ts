import { Component, OnInit, OnDestroy } from "@angular/core";
import { MatchmakingService } from "../../services/matchmaking.service";
import { AuthService } from "../../services/auth.service";
import { interval, Subscription } from "rxjs";
import { CommonModule } from '@angular/common';
import { IResponse } from "../../interfaces";
@Component({
  selector: "app-game",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./game.component.html",
  styleUrl: "./game.component.scss",
})

//export class GameComponent implements OnInit, OnDestroy{

export class GameComponent implements OnDestroy{
  public errorJoin: string | null = null;
  isFindMatchDisabled = false;
  isLeaveQDisabled = true;
  isInQueue = false;
  onlineUsersCount = 0;
  message = "";
  email = "";
  private pollSubscription!: Subscription;

  constructor(
    private matchmakingService: MatchmakingService,
    private authService: AuthService
  ) {}

  // ngOnInit() {
  //   this.pollOnlineCount();
  // }

  ngOnDestroy() {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
    }
    this.leaveQueue();
  }

  // pollOnlineCount() {
  //   this.pollSubscription = interval(5000).subscribe(() => {
  //     this.matchmakingService.getOnlineUsersCount().subscribe((count: number) => {
  //       this.onlineUsersCount = count;
  //     });
  //   });
  // }

  findMatch() {

    this.isFindMatchDisabled = true;
    this.isLeaveQDisabled = false;

    // if (this.onlineUsersCount < 2) {
    //   this.message = 'No users online yet. Please wait for others to join.';
    //   return;
    // }
    const user = this.authService.getUser();

    if (!user || !user.email) {
      return;
    }


    this.matchmakingService.joinQueue(user.email).subscribe({
      next:(e: any) =>{
        
      },
      error: (err:any)=>{
        const errorMessage = 
         err.error?.message ||
          err.error?.description ||
          "Error al unirse a la cola, ya se encuentra en una";
          this.errorJoin = errorMessage;
      }
    });
  }

  
  leaveQueue() {

    this.isFindMatchDisabled = false;
    this.isLeaveQDisabled = true;

    const user = this.authService.getUser();
    if (!user || !user.email) {
      return;
    }

    this.matchmakingService.leaveQueue(user.email).subscribe(() => {
    });
  }

  private startGame(matchInfo: string) {
    console.log('Starting game:', matchInfo);
  }
    
}