// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Pages
import { WaterfallEditAmortizationComponent } from './edit.component';

// Blockframes
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { AmortizationFormGuard } from '../../guards/amortization-form-guard';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [WaterfallEditAmortizationComponent],
  imports: [
    CommonModule,

    // Blockframes
    LogoSpinnerModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatStepperModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,

    // Routing
    RouterModule.forChild([{
      path: '',
      component: WaterfallEditAmortizationComponent,
      canDeactivate: [AmortizationFormGuard],
    }]),
  ],
})
export class WaterfallEditAmortizationModule { }
