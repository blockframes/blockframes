import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AsideComponent } from './aside.component';
import { OrgAccessModule } from '@blockframes/organization/pipes/org-access.pipe';
import { SidenavAuthModule } from '@blockframes/auth/components/sidenav-auth/sidenav-auth.module';
import { SidenavWidgetModule } from '@blockframes/auth/components/sidenav-widget/sidenav-widget.module';

// Material
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

@NgModule({
  declarations: [AsideComponent],
  imports: [
    RouterModule,
    CommonModule,
    OrgAccessModule,
    FlexLayoutModule,
    SidenavAuthModule,
    SidenavWidgetModule,

    // Material
    MatListModule,
    MatIconModule,
    MatToolbarModule
  ],
  exports: [AsideComponent]
})
export class AsideModule { }
