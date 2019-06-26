import { Injectable } from '@angular/core';
import { OrgMember } from './organization.model';
import { OrganizationService } from './organization.service';

@Injectable({ providedIn: 'root' })
export class OrgMembersService {

  constructor(
    private orgService: OrganizationService,
  ) {
  }

  public async addMember(orgId: string, member: OrgMember) {
    return this.orgService.addMember(orgId, member);
  }

}
