import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { orgName, PublicOrganization } from '@blockframes/model';

@Pipe({ name: 'orgName', pure: true })
export class OrgNamePipe implements PipeTransform {
  transform(org: PublicOrganization, display: 'public' | 'full' | 'long' = 'public') {
    if (display === 'long') {
      return org.name;
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