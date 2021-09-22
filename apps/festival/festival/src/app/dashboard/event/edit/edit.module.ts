import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EditComponent } from './edit.component';
import { EventFromShellModule } from '@blockframes/event/form/shell/shell.module';
import { ScreeningModule } from '@blockframes/event/form/screening/screening.module';
import { ScreeningComponent } from '@blockframes/event/form/screening/screening.component';
import { InvitationComponent } from '@blockframes/event/form/invitation/invitation.component';
import { InvitationModule } from '@blockframes/event/form/invitation/invitation.module';
import { MeetingModule } from '@blockframes/event/form/meeting/meeting.module';
import { MeetingComponent } from '@blockframes/event/form/meeting/meeting.component';
import { AnalyticsModule } from '@blockframes/event/pages/analytics/analytics.module';
import { AnalyticsComponent } from '@blockframes/event/pages/analytics/analytics.component';
import { MeetingFilesModule } from '@blockframes/event/form/meeting-files/meeting-files.module';
import { MeetingFilesComponent } from '@blockframes/event/form/meeting-files/meeting-files.component';

import { EventTypeGuard } from '@blockframes/event/guard/event-type.guard';
import { EventOrganizationGuard } from '@blockframes/event/guard/event-organization.guard';


@NgModule({
  declarations: [EditComponent],
  imports: [
    CommonModule,
    EventFromShellModule,
    ScreeningModule,
    InvitationModule,
    MeetingModule,
    AnalyticsModule,
    MeetingFilesModule,
    RouterModule.forChild([
      {
        path: '',
        component: EditComponent,
        canDeactivate: [EventOrganizationGuard],
        children: [
          {
            path: '',
            canActivate: [EventTypeGuard],
          },
          {
            path: 'screening',
            component: ScreeningComponent,
            data: { animation: 0 }
          },
          {
            path: 'meeting',
            component: MeetingComponent,
            data: { animation: 1 }
          },
          {
            path: 'invitations',
            component: InvitationComponent,
            data: { animation: 2 }
          },
          {
            path: 'files',
            component: MeetingFilesComponent,
            data: { animation: 3 }
          },
          {
            path: 'statistics',
            component: AnalyticsComponent,
            data: { animation: 4 }
          }
        ],
      }

    ])
  ]
})
export class EventEditModule { }
