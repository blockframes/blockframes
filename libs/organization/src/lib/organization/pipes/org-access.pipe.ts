import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { App } from '@blockframes/utils/apps';
import { canAccessModule, Organization } from '../+state';

@Pipe({
  name: 'canAccess',
  pure: true
})
export class OrgAccessPipe implements PipeTransform {

  transform(org: Organization, module: 'dashboard' | 'marketplace', app?: App): boolean {
    return canAccessModule(module, org, app);
  }

}

@NgModule({
  declarations: [OrgAccessPipe],
  exports: [OrgAccessPipe]
})
export class OrgAccessModule {}
