// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Pages
import { AmortizationComponent } from './amortization.component';

// Blockframes
import { WaterfallAdminGuard } from '@blockframes/waterfall/guards/waterfall-admin.guard';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { TagModule } from '@blockframes/ui/tag/tag.module';
import { BfCommonModule } from '@blockframes/utils/bf-common.module';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';

@NgModule({
  declarations: [AmortizationComponent],
  imports: [
    BfCommonModule,

    ImageModule,
    LogoSpinnerModule,
    TagModule,

    // Material
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,

    // Routing
    RouterModule.forChild([{
      path: '',
      canActivate: [WaterfallAdminGuard],
      component: AmortizationComponent
    }]),
  ],
})
export class AmortizationModule { }
