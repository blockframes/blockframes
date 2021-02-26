// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// BlockFrames
import { OrgRequestAccessComponent } from './request-access.component';
import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    AppLogoModule,
    ImageModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    RouterModule.forChild([{ path: '', component: OrgRequestAccessComponent }])
  ],
  declarations: [OrgRequestAccessComponent],
  exports: [OrgRequestAccessComponent]
})
export class OrgRequestAccessModule {}
