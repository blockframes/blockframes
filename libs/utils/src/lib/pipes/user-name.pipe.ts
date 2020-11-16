import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicUser } from '@blockframes/user/types';
import { displayName } from './display-name.pipe';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { orgName } from '@blockframes/organization/+state/organization.firestore';

@Pipe({
  name: 'userName'
})
export class UserNamePipe implements PipeTransform {
  constructor(private orgService: OrganizationService) {}

  async transform(value: PublicUser | PublicUser[], withOrg = false) {

    if (Array.isArray(value)) {
      return value.map(async person => {
        if (person?.firstName) {
          if (withOrg) {
            const org = await this.orgService.getValue(person.orgId);
            return `${displayName(person)} (${orgName(org)})`;
          }
        } else {
          return value;
        }
      }).join(', ');
    } else {
      if (withOrg) {
        const org = await this.orgService.getValue(value.orgId);
        return `${displayName(value)} (${orgName(org)})`;
      }
      return displayName(value);
    }
  }
}

@NgModule({
  declarations: [UserNamePipe],
  imports: [CommonModule],
  exports: [UserNamePipe]
})
export class UserNameModule { }
