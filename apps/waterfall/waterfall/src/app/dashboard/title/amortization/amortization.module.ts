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
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

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
