// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Blockframes
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';

import { TitleFormModule } from '../../components/forms/title-form/form.module';
import { RightHolderFormModule } from '../../components/right-holder-form/right-holder-form.module';

// Pages
import { WaterfallEditTitleComponent } from './edit.component';


@NgModule({
  declarations: [WaterfallEditTitleComponent],
  imports: [
    CommonModule,
    TitleFormModule,
    LogoSpinnerModule,
    RightHolderFormModule,

    // Material
    MatIconModule,
    MatButtonModule,

    // Routing
    RouterModule.forChild([{
      path: '', 
      component: WaterfallEditTitleComponent,
    }]),
  ],
})
export class WaterfallEditTitleModule { }
