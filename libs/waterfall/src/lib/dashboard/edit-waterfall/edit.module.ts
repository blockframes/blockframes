// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';

// Blockframes
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';

import { WaterfallFormGuard } from '../../guards/waterfall-form-guard';
import { TitleFormModule } from '../../components/forms/title-form/form.module';
import { ContractsFormModule } from '../../components/contracts-form/contracts-form.module';
import { RightHolderFormModule } from '../../components/right-holder-form/right-holder-form.module';

// Pages
import { WaterfallEditFormComponent } from './edit.component';


@NgModule({
  declarations: [WaterfallEditFormComponent],
  imports: [
    CommonModule,

    ImageModule,
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
