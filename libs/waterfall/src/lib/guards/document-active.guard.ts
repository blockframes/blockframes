import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { WaterfallDocument } from '@blockframes/model';
import { WaterfallDocumentsService } from '../documents.service';
import { WaterfallPermissionsService } from '../permissions.service';
import { AuthService } from '@blockframes/auth/service';
import { OrganizationService } from '@blockframes/organization/service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DocumentActiveGuard implements CanActivate {
  private document: WaterfallDocument;

  constructor(
    private permissionService: WaterfallPermissionsService,
    private authService: AuthService,
    private orgService: OrganizationService,
    private documentService: WaterfallDocumentsService,
    private router: Router,
  ) { }

  /**
   * Check if current user can read document : 
   * not waterfall admin users should be allowed to see only the documents shared with their organization
   * @param next 
   * @returns 
   */
  async canActivate(next: ActivatedRouteSnapshot) {
    const waterfallId = next.params.movieId;
    const isBlockframesAdmin = await firstValueFrom(this.authService.isBlockframesAdmin$);
    const permission = await this.permissionService.getValue(this.orgService.org.id, { waterfallId });
    if (isBlockframesAdmin || permission?.isAdmin) return true;

    this.document = await this.documentService.getValue(next.params.documentId as string, { waterfallId });
    if (this.document?.sharedWith?.includes(this.orgService.org.id)) {
      return true;
    } else {
      return this.router.createUrlTree([next.data.redirect]);
    }
  }
}
