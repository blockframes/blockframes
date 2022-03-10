import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicUser } from '@blockframes/model';
import { displayName } from '../utils';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { orgName } from '@blockframes/model';
import { Movie, Organization } from '@blockframes/model';

/**
 * This pipe is used to display the firstname and lastname of the user but also the organization in parenthesis.
 * If you want only firstname and lastname, you can use the displayName pipe.
 */
@Pipe({
  name: 'displayUser'
})
export class DisplayUserPipe implements PipeTransform {

  private cachedOrgs: Organization[] = [];
  constructor(private orgService: OrganizationService) { }

  async transform(users: PublicUser | PublicUser[]) {
    const getUserName = async (user: PublicUser) => {
      if (user.orgId) {
        const org = await this.getOrg(user.orgId);
        return `${displayName(user)} (${orgName(org)})`;
      } else {
        return displayName(user);
      }
    }

    return Array.isArray(users) ? Promise.all(users.map(getUserName)) : getUserName(users);
  }

  /**
   * Caching organizations to prevent userName blinking (caused by async call to get user's org)
   * (when a notification is updated for example)
   **/
  private async getOrg(orgId: string) {
    if (!this.cachedOrgs[orgId]) {
      this.cachedOrgs[orgId] = await this.orgService.getValue(orgId);
    }

    return this.cachedOrgs[orgId];
  }
}

@NgModule({
  declarations: [DisplayUserPipe],
  imports: [CommonModule],
  exports: [DisplayUserPipe]
})
export class DisplayUserModule { }
