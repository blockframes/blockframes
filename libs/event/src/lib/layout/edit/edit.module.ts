import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { EventEditComponent } from './edit.component';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { DisplayNameModule } from '@blockframes/utils/pipes';
import { TimePickerModule } from '@blockframes/ui/form/time-picker/time-picker.module';
import { StatusModule } from '@blockframes/invitation/pipes/status.pipe';
import { AppBarModule } from '@blockframes/ui/app-bar';
import { InvitationFormUserModule } from '@blockframes/invitation/form/user/user.module';
import { GuestListModule } from '@blockframes/invitation/components/guest-list/guest-list.module';
import { ConfirmModule } from '@blockframes/ui/confirm/confirm.module';
import { EditDetailsModule } from '../../form/edit-details/edit-details.module';

// Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';


@NgModule({
  declarations: [EventEditComponent],
  exports: [EventEditComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    TimePickerModule,
    RouterModule,
    ImageModule,
    DisplayNameModule,
    StatusModule,
    GuestListModule,
    AppBarModule,
    InvitationFormUserModule,
    ConfirmModule,
    EditDetailsModule,

    // Material
    MatDividerModule,
    MatCardModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatSlideToggleModule,
    MatProgressBarModule,
    MatRadioModule,
    MatTooltipModule
  ]
})
export class EventEditModule { }
