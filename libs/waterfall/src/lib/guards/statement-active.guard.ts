import { Injectable } from '@angular/core';
import { StatementService } from '../statement.service';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Statement } from '@blockframes/model';

@Injectable({ providedIn: 'root' })
export class StatementActiveGuard implements CanActivate {
  private statement: Statement;

  constructor(
    private statementService: StatementService,
    private router: Router,
  ) { }

  async canActivate(next: ActivatedRouteSnapshot) {
    // TODO #9485 check if current user can read statement
    this.statement = await this.statementService.getValue(next.params.statementId as string, { waterfallId: next.params.movieId });
    if (this.statement) {
      return true;
    } else {
      return this.router.createUrlTree([next.data.redirect]);
    }
  }
}
