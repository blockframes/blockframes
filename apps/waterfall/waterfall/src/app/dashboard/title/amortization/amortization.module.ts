// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Pages
import { AmortizationComponent } from './amortization.component';

// Blockframes
import { WaterfallAdminGuard } from '@blockframes/waterfall/guards/waterfall-admin.guard';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [AmortizationComponent],
  imports: [
    CommonModule,

    ImageModule,

    // Material
    MatButtonModule,
    MatTooltipModule,

    // Routing
    RouterModule.forChild([{
      path: '',
      canActivate: [WaterfallAdminGuard],
      component: AmortizationComponent
    }]),
  ],
})
export class AmortizationModule { }
