import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Organization } from '../+state';

@Pipe({ name: 'orgName', pure: true })
export class OrgNamePipe implements PipeTransform {
  transform(value: Organization) {
    return value.denomination.public || value.denomination.full;
  }
}

@NgModule({
  declarations: [OrgNamePipe],
  exports: [OrgNamePipe]
})
export class OrgNameModule {}