import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MatchmakingService {
  constructor(private http: HttpClient) {}

  joinQueue(email: string): Observable<any> {
    return this.http.post<string>('/matchmaking/join?email=' + encodeURIComponent(email), {});

  }

  leaveQueue(email: string): Observable<string> {
    return this.http.post<string>('/matchmaking/leave?email=' + encodeURIComponent(email), {});
  }

  // getOnlineUsersCount(): Observable<number> {
  //   return this.http.get<number>('/matchmaking/online-count');
  // }
}
