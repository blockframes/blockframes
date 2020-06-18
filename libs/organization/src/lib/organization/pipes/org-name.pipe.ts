import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { orgName, Denomination } from '../+state';

@Pipe({ name: 'orgName', pure: true })
export class OrgNamePipe implements PipeTransform {
  transform(denomination: Denomination, display: 'public' | 'full' | 'long' = 'public') {
    if (display === 'long') {
      return `${orgName(denomination, 'full')} ${denomination.public ? ` (${orgName(denomination, 'public')})` : ''}`;
    } else {
      return orgName(denomination, display);
    }
  }
}

@NgModule({
  declarations: [OrgNamePipe],
  exports: [OrgNamePipe]
})
export class OrgNameModule { }