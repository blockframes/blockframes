import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MemberComponent } from './member.component';
import { UserCardModule } from '@blockframes/user/components/card/card.module';
import { OrgAddressModule } from '@blockframes/organization/pipes/org-address.pipe';

@NgModule({
  declarations: [MemberComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    UserCardModule,
    OrgAddressModule,
    RouterModule.forChild([{ path: '', component: MemberComponent }])
  ]
})
export class OrganizationMemberModule { }
