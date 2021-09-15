import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EditComponent } from './edit.component';
import { EventEditModule as LayoutEventEditModule } from '@blockframes/event/layout/edit/edit.module';
import { ScreeningDetailsModule } from '@blockframes/event/form/screening-details/screening-details.module';
import { ScreeningDetailsComponent } from '@blockframes/event/form/screening-details/screening-details.component';
import { InvitationDetailsComponent } from '@blockframes/event/form/invitation-details/invitation-details.component';
import { InvitationDetailsModule } from '@blockframes/event/form/invitation-details/invitation-details.module';
import { MeetingDetailsModule } from '@blockframes/event/form/meeting-details/meeting-details.module';
import { MeetingDetailsComponent } from '@blockframes/event/form/meeting-details/meeting-details.component';
import { AnalyticsDetailsModule } from '@blockframes/event/pages/analytics-details/analytics-details.module';
import { AnalyticsDetailsComponent } from '@blockframes/event/pages/analytics-details/analytics-details.component';
import { MeetingFilesModule } from '@blockframes/event/form/meeting-files/meeting-files.module';
import { MeetingFilesComponent } from '@blockframes/event/form/meeting-files/meeting-files.component';

import { EventTypeGuard } from '@blockframes/event/guard/event-type.guard';


@NgModule({
  declarations: [EditComponent],
  imports: [
    CommonModule,
    LayoutEventEditModule,
    ScreeningDetailsModule,
    InvitationDetailsModule,
    MeetingDetailsModule,
    AnalyticsDetailsModule,
    MeetingFilesModule,
    RouterModule.forChild([
      {
        path: '',
        component: EditComponent,
        canActivate: [EventTypeGuard],
        children: [
          {
            path: 'screening',
            component: ScreeningDetailsComponent,
          },
          {
            path: 'meeting',
            component: MeetingDetailsComponent,
          },
          {
            path: 'invitations',
            component: InvitationDetailsComponent,
          },
          {
            path: 'attendance',
            component: AnalyticsDetailsComponent
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
