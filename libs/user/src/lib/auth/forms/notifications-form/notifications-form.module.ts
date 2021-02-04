import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NotificationsFormComponent, SomeCheckedPipe, EveryCheckedPipe, ShowNotificationPipe } from './notifications-form.component';

// Material
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    // Material
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatTooltipModule,
    RouterModule.forChild([{ path: '', component: NotificationsFormComponent }])
  ],
  declarations: [
    NotificationsFormComponent,
    SomeCheckedPipe,
    EveryCheckedPipe,
    ShowNotificationPipe
  ],
  exports: [
    NotificationsFormComponent
  ]
})
export class NotificationsFormModule { }
