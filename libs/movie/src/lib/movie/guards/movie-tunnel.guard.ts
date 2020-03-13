import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { MovieService } from './../+state/movie.service';
import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MovieTunnelGuard implements CanActivate {
    constructor(private service: MovieService, private routerQuery: RouterQuery,
        private router: Router, private orgQuery: OrganizationQuery, private orgService: OrganizationService) { }

    async canActivate() {
        const movieId: string = this.routerQuery.getValue().state.root.params.movieId;
        const movie = await this.service.getValue(movieId)
        const org = await this.orgService.getValue(this.orgQuery.getActiveId())
        return movie?.main.storeConfig.status !== 'submitted' && org.movieIds.includes(movieId) ?
            true : this.router.navigateByUrl('c/o/dashboard/titles');
    }
}