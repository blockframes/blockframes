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

  /**
   * TODO #9553
   * check if current user can read statement : not waterfall admin users should be allowed to see only their own statements 
   * and the ones of contracts (right.contractId) located above in the waterfall
   * @param next 
   * @returns 
   */
  async canActivate(next: ActivatedRouteSnapshot) {
    this.statement = await this.statementService.getValue(next.params.statementId as string, { waterfallId: next.params.movieId });
    if (this.statement) {
      return true;
    } else {
      return this.router.createUrlTree([next.data.redirect]);
    }
  }
}
