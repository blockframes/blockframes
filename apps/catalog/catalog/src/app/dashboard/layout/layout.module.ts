import { NgModule } from '@angular/core';
import { LayoutComponent } from './layout.component';
import { CommonModule } from '@angular/common';
import { WidgetModule } from '@blockframes/ui/widget/widget.module';
import { FlexLayoutModule } from '@angular/flex-layout';

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

const material = [
  MatButtonModule,
  MatDividerModule,
  MatChipsModule,
  MatInputModule,
  MatListModule,
  MatIconModule,
  MatSidenavModule,
  MatToolbarModule,
  MatCardModule
]

@NgModule({
  declarations: [LayoutComponent],
  imports: [CommonModule,
    WidgetModule,
    FlexLayoutModule,
  ...material
  ],
  exports: [LayoutComponent]
})

export class LayoutModule {}
