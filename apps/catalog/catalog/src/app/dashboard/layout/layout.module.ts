import { NgModule } from '@angular/core';
import { LayoutComponent } from './layout.component';
import { CommonModule } from '@angular/common';
// Material
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';

const material = [
  MatButtonModule,
  MatDividerModule,
  MatBadgeModule,
  MatInputModule,
  MatListModule,
  MatIconModule,
  MatSidenavModule,
  MatToolbarModule
]

@NgModule({
  declarations: [LayoutComponent],
  imports: [CommonModule,
  ...material
  ],
  exports: [LayoutComponent]
})

export class LayoutModule {}
