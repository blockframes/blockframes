// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { WaterfallCtaDirective, DashboardWaterfallShellComponent } from './shell.component';
import { DisplayNameModule } from '@blockframes/utils/pipes/display-name.pipe';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [DashboardWaterfallShellComponent, WaterfallCtaDirective],
  exports: [DashboardWaterfallShellComponent, WaterfallCtaDirective],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,

    // Blockframes
    DisplayNameModule,
    ImageModule,

    // Material
    MatTabsModule,
    MatIconModule,
    MatButtonModule
  ],
})
export class DashboardWaterfallShellModule { }
