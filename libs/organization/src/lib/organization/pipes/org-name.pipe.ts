import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Organization, orgName } from '../+state';

@Pipe({ name: 'orgName', pure: true })
export class OrgNamePipe implements PipeTransform {
  transform(org: Organization, display: 'public' | 'full' | 'long' = 'public') {
    if (display === 'long') {
      return `${orgName(org, 'full')} ${org.denomination.public ? ` (${orgName(org, 'public')})` : ''}`;
    } else {
      return orgName(org, display);
    }
  }
}

@NgModule({
  declarations: [OrgNamePipe],
  exports: [OrgNamePipe]
})
export class OrgNameModule { }