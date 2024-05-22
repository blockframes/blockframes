// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Pages
import { WaterfallEditAmortizationComponent } from './edit.component';

// Blockframes
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { AmortizationFormGuard } from '../../../guards/amortization-form-guard';
import { BfCommonModule } from '@blockframes/utils/bf-common.module';
import { WaterfallRightListModule } from '../../../components/graph/right-list/right-list.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';

@NgModule({
  declarations: [WaterfallEditAmortizationComponent],
  imports: [
    BfCommonModule,
    ReactiveFormsModule,

    // Blockframes
    LogoSpinnerModule,
    WaterfallRightListModule,

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
