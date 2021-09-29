import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MeetingComponent } from './meeting.component';
import { EventFromShellModule } from '../shell/shell.module';
import { DisplayNameModule } from '@blockframes/utils/pipes';
import { RouterModule } from '@angular/router';

// Material
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [MeetingComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    EventFromShellModule,
    DisplayNameModule,
    ClipboardModule,
    RouterModule.forChild([{ path: '', component: MeetingComponent }]),

    // Material
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ]
})
export class MeetingModule { }
