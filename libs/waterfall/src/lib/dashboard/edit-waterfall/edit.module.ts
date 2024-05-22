// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Blockframes
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { WaterfallFormGuard } from '../../guards/waterfall-form-guard';
import { WaterfallGraphModule } from '../../components/graph/graph.module';
import { TitleFormModule } from '../../components/forms/title-form/form.module';
import { ContractListModule } from '../../components/document/contract/contract-list/contract-list.module';
import { RightHolderFormModule } from '../../components/rightholder/rightholder-form/rightholder-form.module';
import { VersionSelectorModule } from '../../components/version/version-selector/version-selector.module';
import { ToLabelModule } from '@blockframes/utils/pipes';

// Pages
import { WaterfallEditFormComponent } from './edit.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';

@NgModule({
  declarations: [WaterfallEditFormComponent],
  imports: [
    CommonModule,

    ImageModule,
    TitleFormModule,
    LogoSpinnerModule,
    ContractListModule,
    WaterfallGraphModule,
    RightHolderFormModule,
    VersionSelectorModule,
    ToLabelModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatStepperModule,
    MatTooltipModule,
    MatDialogModule,

    // Routing
    RouterModule.forChild([{
      path: '', 
      component: WaterfallEditFormComponent,
      canDeactivate: [WaterfallFormGuard],
    }]),
  ],
})
export class WaterfallEditFormModule { }
