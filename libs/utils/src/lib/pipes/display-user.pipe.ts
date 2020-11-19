import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicUser } from '@blockframes/user/types';
import { displayName } from './display-name.pipe';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { orgName } from '@blockframes/organization/+state/organization.firestore';

/**
 * This pipe is used to display the firstname and lastname of the user but also the organization in parenthesis.
 * If you want only firstname and lastname, you can use the displayName pipe.
 */
@Pipe({
  name: 'displayUser'
})
export class DisplayUserPipe implements PipeTransform {
  constructor(private orgService: OrganizationService) {}

  async transform(users: PublicUser | PublicUser[]) {
    const getUserName = async (user: PublicUser) => {
      const org = await this.orgService.getValue(user.orgId);
      return `${displayName(user)} (${orgName(org)})`;
    }

    return Array.isArray(users) ? Promise.all(users.map(getUserName)) : getUserName(users);
  }
}

@NgModule({
  declarations: [DisplayUserPipe],
  imports: [CommonModule],
  exports: [DisplayUserPipe]
})
export class DisplayUserModule { }
