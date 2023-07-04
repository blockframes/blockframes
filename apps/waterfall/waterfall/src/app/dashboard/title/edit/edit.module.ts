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
import { FormModule } from '@blockframes/waterfall/components/form/form.module';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { ContractsFormModule } from '@blockframes/waterfall/components/contracts-form/contracts-form.module';
import { RightHolderFormModule } from '@blockframes/waterfall/components/right-holder-form/right-holder-form.module';

// Pages
import { EditComponent } from './edit.component';


@NgModule({
  declarations: [EditComponent],
  imports: [
    CommonModule,
    FormModule,
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
      component: EditComponent,
      canDeactivate: [WaterfallFormGuard],
    }]),
  ],
})
export class EditModule { }
