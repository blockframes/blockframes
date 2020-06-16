import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { canAccessModule, OrganizationDocument } from '../+state';

@Pipe({
  name: 'canAccess',
  pure: true
})
export class OrgAccessPipe implements PipeTransform {

  transform(org: OrganizationDocument, module: 'dashboard' | 'marketplace'): boolean {
    return canAccessModule(module, org);
  }

}

@NgModule({
  declarations: [OrgAccessPipe],
  exports: [OrgAccessPipe]
})
export class OrgAccessModule {}
