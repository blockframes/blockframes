import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Organization, orgName } from '../+state';

@Pipe({ name: 'orgName', pure: true })
export class OrgNamePipe implements PipeTransform {
  transform(value: Organization) {
    return orgName(value); 
  }
}

@NgModule({
  declarations: [OrgNamePipe],
  exports: [OrgNamePipe]
})
export class OrgNameModule {}