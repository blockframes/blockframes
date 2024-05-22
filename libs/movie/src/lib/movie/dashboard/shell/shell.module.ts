// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { MovieCtaDirective, DashboardTitleShellComponent } from './shell.component';
import { ToLabelModule } from '@blockframes/utils/pipes/to-label.pipe';
import { DisplayNameModule } from '@blockframes/utils/pipes/display-name.pipe';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { TagModule } from '@blockframes/ui/tag/tag.module';

// Material
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';

@NgModule({
  declarations: [DashboardTitleShellComponent, MovieCtaDirective],
  exports: [DashboardTitleShellComponent, MovieCtaDirective],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    // Blockframes
    ToLabelModule,
    DisplayNameModule,
    ImageModule,
    TagModule,
    // Material
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
  ],
})
export class DashboardTitleShellModule { }
