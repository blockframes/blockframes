// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { WaterfallCtaDirective, DashboardWaterfallShellComponent, CanAccesPipe } from './shell.component';
import { DisplayNameModule } from '@blockframes/utils/pipes/display-name.pipe';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [DashboardWaterfallShellComponent, WaterfallCtaDirective, CanAccesPipe],
  exports: [DashboardWaterfallShellComponent, WaterfallCtaDirective],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,

    // Blockframes
    ImageModule,
    DisplayNameModule,

    // Material
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
})
export class DashboardWaterfallShellModule { }
