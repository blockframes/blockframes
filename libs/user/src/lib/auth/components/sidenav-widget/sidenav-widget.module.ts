import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { SidenavWidgetComponent } from './sidenav-widget.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    
    MatIconModule,
    MatBadgeModule,
    MatButtonModule
  ],
  declarations: [SidenavWidgetComponent],
  exports: [SidenavWidgetComponent]
})
export class SidenavWidgetModule {}