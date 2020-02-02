import { NgModule } from '@angular/core';
import { LayoutComponent } from './layout.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Widgets
import { NotificationWidgetModule } from '@blockframes/notification';
import { SearchWidgetModule } from '@blockframes/ui/search-widget';

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
];

@NgModule({
  declarations: [LayoutComponent],
  imports: [CommonModule,
    FlexLayoutModule,
    RouterModule,
    NotificationWidgetModule,
    SearchWidgetModule,
    ...material
  ],
  exports: [LayoutComponent]
})

export class LayoutModule {}
