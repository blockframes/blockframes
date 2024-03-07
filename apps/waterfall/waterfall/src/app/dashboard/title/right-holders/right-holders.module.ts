
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Components
import { RightHoldersComponent } from './right-holders.component';

// Blockframes
import { RightholderTableModule } from '@blockframes/waterfall/components/rightholder/rightholder-table/rightholder-table.module';
import { OrganizationInviteModule } from '@blockframes/waterfall/components/organization-invite/organization-invite.module';
import { PendingInvitationsModule } from '@blockframes/waterfall/components/pending-invitations/pending-invitations.module';
import { OrganizationTableModule } from '@blockframes/waterfall/components/organization-table/organization-table.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    RightHoldersComponent,
  ],
  imports: [
    CommonModule,
    RightholderTableModule,
    OrganizationTableModule,
    OrganizationInviteModule,
    PendingInvitationsModule,

    // Material
    MatIconModule,
    MatButtonModule,

    // Routing
    RouterModule.forChild([{ path: '', component: RightHoldersComponent }]),
  ],
})
export class RightHoldersModule { }
