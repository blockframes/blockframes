// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Pages
import { WaterfallEditAmortizationComponent } from './edit.component';

// Blockframes
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { AmortizationFormGuard } from '../../guards/amortization-form-guard';
import { BfCommonModule } from '@blockframes/utils/bf-common.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [WaterfallEditAmortizationComponent],
  imports: [
    BfCommonModule,
    ReactiveFormsModule,

    // Blockframes
    LogoSpinnerModule,

    // Material
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatStepperModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatSelectModule,

    // Routing
    RouterModule.forChild([{
      path: '',
      component: WaterfallEditAmortizationComponent,
      canDeactivate: [AmortizationFormGuard],
    }]),
  ],
})
export class WaterfallEditAmortizationModule { }
