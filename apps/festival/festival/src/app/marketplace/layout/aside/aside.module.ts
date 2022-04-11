import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AsideComponent } from './aside.component';
import { OrgAccessModule } from '@blockframes/organization/pipes/org-access.pipe';

// Material
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

@NgModule({
  declarations: [AsideComponent],
  imports: [
    RouterModule,
    CommonModule,
    OrgAccessModule,
    FlexLayoutModule,

    // Material
    MatListModule,
    MatIconModule,
    MatBadgeModule,
    MatButtonModule,
    MatToolbarModule
  ],
  exports: [AsideComponent]
})
export class AsideModule { }
