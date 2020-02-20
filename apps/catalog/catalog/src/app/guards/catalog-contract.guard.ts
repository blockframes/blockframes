import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { ContractVersionService } from '@blockframes/contract/version/+state';

@Injectable({ providedIn: 'root' })
export class CatalogContractGuard implements CanActivate {

    constructor(private contractVersionService: ContractVersionService, private router: Router) { }

    async canActivate(next: ActivatedRouteSnapshot) {
        const contractId = next.paramMap.get('contractId');
        const versions = await this.contractVersionService.getContractVersions(contractId);
        const isDraft = versions.map(version => version.status === 'draft');
        return isDraft.includes(true) ? this.router.parseUrl('c/o/dashboard/home') : true;
    }
}