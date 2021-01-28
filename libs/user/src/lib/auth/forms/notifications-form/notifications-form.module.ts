import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { NotificationsFormComponent } from './notifications-form.component';

// Material
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,

    // Material
    MatCheckboxModule,
    MatRadioModule,
    MatDividerModule,
    MatSlideToggleModule,
  ],
  declarations: [
    NotificationsFormComponent,
  ],
  exports: [
    NotificationsFormComponent
  ]
})
export class NotificationsFormModule { }
