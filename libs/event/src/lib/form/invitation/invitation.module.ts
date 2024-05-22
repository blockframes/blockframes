import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { InvitationComponent } from './invitation.component';
import { InvitationFormUserModule } from '@blockframes/invitation/form/user/user.module';
import { GuestListModule } from '@blockframes/invitation/components/guest-list/guest-list.module';
import { RouterModule } from '@angular/router';

// Material
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';

@NgModule({
  declarations: [InvitationComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    GuestListModule,
    InvitationFormUserModule,
    RouterModule.forChild([{ path: '', component: InvitationComponent }]),

    // Material
    MatCardModule,
  ]
})
export class InvitationModule { }
