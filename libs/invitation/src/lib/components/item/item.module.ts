// Angular
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { ItemComponent } from './item.component';
import { InvitationActionModule } from '../action/action.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { DisplayNameModule } from '@blockframes/utils/pipes/display-name.pipe';
import { EventFromInvitationPipeModule } from '@blockframes/invitation/pipes/event-from-invitation.pipe';
import { EventRangeModule } from '@blockframes/event/pipes/event-range.pipe';
import { DisplayUserModule } from '@blockframes/utils/pipes/display-user.pipe';
import { TimeSinceModule } from '@blockframes/utils/pipes/time-since.pipe';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { ExportToGoogleAgendaModule } from '@blockframes/event/pipes/export-to-google-agenda.pipe';

// Material
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [ItemComponent],
  exports: [ItemComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageModule,
    InvitationActionModule,
    RouterModule,
    DisplayUserModule,
    DisplayNameModule,
    EventFromInvitationPipeModule,
    EventRangeModule,
    TimeSinceModule,
    ToLabelModule,
    ExportToGoogleAgendaModule,

    // Material
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule
  ]
})
export class InvitationItemModule { }
