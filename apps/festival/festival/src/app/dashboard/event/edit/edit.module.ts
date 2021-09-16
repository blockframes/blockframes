import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EditComponent } from './edit.component';
import { EventEditModule as LayoutEventEditModule } from '@blockframes/event/layout/edit/edit.module';
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


@NgModule({
  declarations: [EditComponent],
  imports: [
    CommonModule,
    LayoutEventEditModule,
    ScreeningModule,
    InvitationModule,
    MeetingModule,
    AnalyticsModule,
    MeetingFilesModule,
    RouterModule.forChild([ // @TODO #5895 check effet de slide du movie form + echec movie form bruce
      {
        path: '',
        component: EditComponent,
        children: [
          {
            path: '',
            canActivate: [EventTypeGuard],
          },
          {
            path: 'screening',
            component: ScreeningComponent,
          },
          {
            path: 'meeting',
            component: MeetingComponent,
          },
          {
            path: 'invitations',
            component: InvitationComponent,
          },
          {
            path: 'attendance',
            component: AnalyticsComponent
          },
          {
            path: 'files',
            component: MeetingFilesComponent,
          }
        ],
      }

    ])
  ]
})
export class EventEditModule { }
