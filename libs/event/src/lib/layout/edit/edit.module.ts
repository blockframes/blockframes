import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { EventEditComponent } from './edit.component';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module'
import { DisplayNameModule } from '@blockframes/utils/pipes';
import { TimePickerModule } from '@blockframes/ui/form/time-picker/time-picker.module';
import { StatusModule } from '@blockframes/invitation/pipes/status.pipe';
import { AppBarModule } from '@blockframes/ui/app-bar';
import { InvitationFormUserModule } from '@blockframes/invitation/form/user/user.module';
import { GuestListModule } from '@blockframes/invitation/components/guest-list/guest-list.module';

// Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';



@NgModule({
  declarations: [EventEditComponent],
  exports: [EventEditComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    TimePickerModule,
    RouterModule,
    ImageReferenceModule,
    DisplayNameModule,
    StatusModule,
    GuestListModule,
    AppBarModule,
    InvitationFormUserModule,

    // Material
    MatDividerModule,
    MatCardModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatCheckboxModule,
    MatProgressBarModule,
  ]
})
export class EventEditModule { }
