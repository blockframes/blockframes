import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MembersComponent } from './members.component';
import { UserCardModule } from '@blockframes/user/components/card/card.module';


@NgModule({
  declarations: [MembersComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    UserCardModule,
    RouterModule.forChild([{ path: '', component: MembersComponent }])
  ]
})
export class OrganizationMembersModule { }
