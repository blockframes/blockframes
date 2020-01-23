import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Injectable({ providedIn: 'root' })
export class MovieTunnelService {
  previousPage: string;
  constructor(private routerQuery: RouterQuery, private router: Router){}

  openTunnel(movieId?: string){
    this.previousPage = this.routerQuery.getValue().state.url;
    const path = 'c/o/dashboard/movie-tunnel' + movieId || '';
    this.router.navigate([path]);
  }
}
