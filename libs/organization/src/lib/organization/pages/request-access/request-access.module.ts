// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// BlockFrames
import { OrgRequestAccessComponent } from './request-access.component';
import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';
// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    AppLogoModule,
    MatButtonModule,
    MatIconModule,
    RouterModule.forChild([{ path: '', component: OrgRequestAccessComponent }])
  ],
  declarations: [OrgRequestAccessComponent],
  exports: [OrgRequestAccessComponent]
})
export class OrgRequestAccessModule {}
