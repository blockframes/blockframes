import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionComponent } from './action.component';
import { InvitationActionPipeModule } from './action.pipe';
import { FlexLayoutModule } from '@angular/flex-layout';
import { EventTimeModule } from '@blockframes/event/pipes/event-time.pipe'
import { TagModule } from '@blockframes/ui/tag/tag.module';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SnackbarErrorModule } from '@blockframes/ui/snackbar/error/snackbar-error.module';
import { SnackbarLinkModule } from '@blockframes/ui/snackbar/link/snackbar-link.module';

@NgModule({
  declarations: [ActionComponent],
  exports: [ActionComponent],
  imports: [
    CommonModule,
    EventTimeModule,
    FlexLayoutModule,
    InvitationActionPipeModule,
    TagModule,
    RouterModule,

    MatTooltipModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    SnackbarErrorModule,
    SnackbarLinkModule,
  ]
})
export class InvitationActionModule { }
