// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { DashboardTitleShellComponent } from './shell.component';
import { ToLabelModule } from '@blockframes/utils/pipes/to-label.pipe';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.pipe';
import { DisplayNameModule } from '@blockframes/utils/pipes/display-name.pipe';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';

// Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [DashboardTitleShellComponent],
  exports: [DashboardTitleShellComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    // Blockframes
    ToLabelModule,
    TranslateSlugModule,
    DisplayNameModule,
    ImageReferenceModule,
    // Material
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
  ],
})
export class DashboardTitleShellModule { }
