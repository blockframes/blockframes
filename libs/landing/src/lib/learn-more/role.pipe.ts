import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { RequestDemoRole, requestDemoRole } from '@blockframes/utils/request-demo';

@Pipe({ name: 'roleLabel', pure: true })
export class RolePipe implements PipeTransform {
  transform(role: RequestDemoRole) {
    return requestDemoRole[role];
  }
}

@NgModule({
  declarations: [RolePipe],
  exports: [RolePipe]
})
export class RoleModule {}
