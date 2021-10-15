import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { UserService } from '@blockframes/user/+state';

@Pipe({ name: 'firstUserFromOrgId' })
export class FirstUserFromOrgId implements PipeTransform {
  constructor(private userService: UserService) { }

  async transform(orgId: string) {
    const [user] = await this.userService.getValue(ref => ref.where('orgId', '==', orgId).limit(1));
    return user;
  }
}


@NgModule({
  exports: [FirstUserFromOrgId],
  declarations: [FirstUserFromOrgId]
})
export class FirstUserFromOrgIdModule { }
