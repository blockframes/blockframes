import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { OrganizationWidgetComponent } from './organization-widget.component';

// Material
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

const material = [MatMenuModule, MatIconModule, MatDividerModule];

@NgModule({
  imports: [CommonModule, RouterModule, ...material],
  declarations: [OrganizationWidgetComponent],
  exports: [OrganizationWidgetComponent]
})
export class OrganizationWidgetModule {}
