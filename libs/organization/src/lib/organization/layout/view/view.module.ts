import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { AppBarModule } from '@blockframes/ui/app-bar';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { OrgAddressModule } from '@blockframes/organization/pipes';

// Components
import { ViewComponent } from './view.component';

// Material
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatToolbarModule } from '@angular/material/toolbar';

@NgModule({
  declarations: [ViewComponent],
  exports: [ViewComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    ImageModule,
    AppBarModule,
    ToLabelModule,
    OrgAddressModule,
    // Material
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule
  ]
})
export class OrganizationViewModule { }
