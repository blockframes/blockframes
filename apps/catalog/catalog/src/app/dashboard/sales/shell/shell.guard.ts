import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '@blockframes/auth/service';
import { ContractService } from '@blockframes/contract/contract/service';
import { map } from 'rxjs/operators';
import { centralOrgId } from '@env';

@Injectable({ providedIn: 'root' })
export class CatalogSaleShellGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private contractService: ContractService,
  ) { }

  canActivate(next: ActivatedRouteSnapshot) {
    const saleId = next.paramMap.get('saleId');

    if (!saleId) this.router.parseUrl('c/o/dashboard/sales');

    return this.contractService.valueChanges(saleId).pipe(
      map(sale => sale.stakeholders.includes(this.authService.profile.orgId)),
      map(isStakeholder => isStakeholder || this.router.parseUrl('c/o/dashboard/sales')),
    );
  }
}

@Injectable({ providedIn: 'root' })
export class CatalogSaleGuard implements CanActivate {
  constructor(
    private router: Router,
    private contractService: ContractService,
  ) { }

  canActivate(next: ActivatedRouteSnapshot) {
    const saleId = next.paramMap.get('saleId');

    if (!saleId) this.router.parseUrl('c/o/dashboard/sales');

    return this.contractService.valueChanges(saleId).pipe(
      map(sale => sale.sellerId === centralOrgId.catalog),
      map(isInternal => isInternal || this.router.parseUrl(`c/o/dashboard/sales/${saleId}/external`)),
    );
  }
}
