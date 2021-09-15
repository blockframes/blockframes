import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { InvitationDetailsComponent } from './invitation-details.component';
import { InvitationFormUserModule } from '@blockframes/invitation/form/user/user.module';
import { GuestListModule } from '@blockframes/invitation/components/guest-list/guest-list.module';

// Material
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [InvitationDetailsComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    GuestListModule,
    InvitationFormUserModule,

    // Material
    MatCardModule,
  ]
})
export class InvitationDetailsModule { }
