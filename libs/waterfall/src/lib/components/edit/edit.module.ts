// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';

// Blockframes
import { WaterfallFormGuard } from '@blockframes/waterfall/guard';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { TitleFormModule } from '@blockframes/waterfall/components/forms/title-form/form.module';
import { ContractsFormModule } from '@blockframes/waterfall/components/contracts-form/contracts-form.module';
import { RightHolderFormModule } from '@blockframes/waterfall/components/right-holder-form/right-holder-form.module';

// Pages
import { WaterfallEditFormComponent } from './edit.component';


@NgModule({
  declarations: [WaterfallEditFormComponent],
  imports: [
    CommonModule,
    TitleFormModule,
    LogoSpinnerModule,
    ContractsFormModule,
    RightHolderFormModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatStepperModule,

    // Routing
    RouterModule.forChild([{
      path: '', 
      component: WaterfallEditFormComponent,
      canDeactivate: [WaterfallFormGuard],
    }]),
  ],
})
export class WaterfallEditFormModule { }
