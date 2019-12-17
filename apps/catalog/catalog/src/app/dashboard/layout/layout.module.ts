import { NgModule } from '@angular/core';
import { LayoutComponent } from './layout.component';
import { CommonModule } from '@angular/common';
import { OverlayWidgetModule } from '@blockframes/ui/overlay-widget/overlay-widget.module.ts';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NotificationWidgetModule } from '@blockframes/ui/overlay-widget/notification-widget/nofitication-widget.module';
import { SearchWidgetModule } from '@blockframes/ui/overlay-widget/search-widget/search-widget.module';
// Material
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';

const material = [
  MatButtonModule,
  MatDividerModule,
  MatChipsModule,
  MatInputModule,
  MatListModule,
  MatIconModule,
  MatSidenavModule,
  MatToolbarModule,
  MatCardModule,
  MatBadgeModule
]

@NgModule({
  declarations: [LayoutComponent],
  imports: [CommonModule,
    OverlayWidgetModule,
    FlexLayoutModule,
    NotificationWidgetModule,
    SearchWidgetModule,
  ...material
  ],
  exports: [LayoutComponent]
})

export class LayoutModule {}
