import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MeetingComponent } from './meeting.component';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { EditDetailsModule } from '@blockframes/event/form/edit-details/edit-details.module';

@NgModule({
  declarations: [MeetingComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    EditDetailsModule,
    // Router
    RouterModule.forChild([{ path: '', component: MeetingComponent }])
  ]
})
export class MeetingModule { }
