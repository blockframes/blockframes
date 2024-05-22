import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NotificationsFormComponent, SomeCheckedPipe, EveryCheckedPipe, ShowNotificationPipe } from './notifications-form.component';

// Material
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

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
