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
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

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
