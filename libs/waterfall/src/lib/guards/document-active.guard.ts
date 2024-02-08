import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { WaterfallDocument } from '@blockframes/model';
import { WaterfallDocumentsService } from '../documents.service';

@Injectable({ providedIn: 'root' })
export class DocumentActiveGuard implements CanActivate {
  private document: WaterfallDocument;

  constructor(
    private documentService: WaterfallDocumentsService,
    private router: Router,
  ) { }

  /**
   * TODO #9553
   * check if current user can read document : not waterfall admin users should be allowed to see only their own contracts 
   * and the ones located above in the waterfall
   * @param next 
   * @returns 
   */
  async canActivate(next: ActivatedRouteSnapshot) {
    this.document = await this.documentService.getValue(next.params.documentId as string, { waterfallId: next.params.movieId });
    if (this.document) {
      return true;
    } else {
      return this.router.createUrlTree([next.data.redirect]);
    }
  }
}
