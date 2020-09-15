// Angular
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { ItemComponent } from './item.component';
import { InvitationActionModule } from '../action/action.module';
import { EventLinkModule } from '../../pipes/event-link.pipe';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { OrgNameModule } from '@blockframes/organization/pipes/org-name.pipe';
import { DisplayNameModule } from '@blockframes/utils/pipes/display-name.pipe';
import { EventFromInvitationPipeModule } from '@blockframes/invitation/pipes/event-from-invitation.pipe';
import { EventRangeModule } from '@blockframes/event/pipes/event-range.pipe';

// Material
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  declarations: [ItemComponent],
  exports: [ItemComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageReferenceModule,
    InvitationActionModule,
    EventLinkModule,
    RouterModule,
    OrgNameModule,
    DisplayNameModule,
    EventFromInvitationPipeModule,
    EventRangeModule,

    // Material
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ]
})
export class InvitationItemModule { }
