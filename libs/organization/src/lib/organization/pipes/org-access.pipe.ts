import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { OrganizationDocumentWithDates } from '../+state';

@Pipe({
  name: 'canAccess',
  pure: true
})
export class OrgAccessPipe implements PipeTransform {

  transform(org: OrganizationDocumentWithDates, path: 'dashboard' | 'marketplace'): boolean {
    return path === 'dashboard' ? org.appAccess.festival?.dashboard : org.appAccess.festival?.marketplace;
  }

}

@NgModule({
  declarations: [OrgAccessPipe],
  exports: [OrgAccessPipe]
})
export class OrgAccessModule {}
