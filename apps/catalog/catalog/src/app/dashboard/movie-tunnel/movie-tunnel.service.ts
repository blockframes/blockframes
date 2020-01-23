import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Injectable({ providedIn: 'root' })
export class MovieTunnelService {
  previousPage: string;
  constructor(private routerQuery: RouterQuery, private router: Router){}

  openTunnel()
  openTunnel(movieId?: string, page?: string){
    if (!this.previousPage) {
      this.previousPage = this.routerQuery.getValue().state.url;
    }
    const path = movieId
      ? `c/o/dashboard/movie-tunnel/${movieId}/${page}`
      : 'c/o/dashboard/movie-tunnel';
    this.router.navigate([path]);
  }

  closeTunnel() {
    const next = this.previousPage;
    delete this.previousPage;
    this.router.navigate([next]);
  }
}
