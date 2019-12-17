import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayWidgetModule } from '../overlay-widget.module';
import { NotificationWidgetComponent } from './notification-widget.component'
import { FlexLayoutModule } from '@angular/flex-layout';

//Material
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

const material = [
  MatCardModule,
  MatListModule,
  MatDividerModule,
  MatButtonModule,
  MatIconModule
]

@NgModule({
  imports: [CommonModule,
    OverlayWidgetModule,
    FlexLayoutModule,
    ...material
  ],
  declarations: [NotificationWidgetComponent],
  exports: [NotificationWidgetComponent]
})

export class NotificationWidgetModule {}
