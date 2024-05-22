// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Components
import { CampaignFormBudgetComponent } from './budget.component';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { FileUploaderModule } from '@blockframes/media/file/file-uploader/file-uploader.module';
import { BudgetPipeModule } from '../../pipes/budget.pipe';
import { ToLabelModule } from '@blockframes/utils/pipes/to-label.pipe';

// Materials
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [CampaignFormBudgetComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    TunnelPageModule,
    StaticSelectModule,
    FileUploaderModule,
    BudgetPipeModule,
    ToLabelModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    RouterModule.forChild([{ path: '', component: CampaignFormBudgetComponent }])

  ],
})
export class CampaignFormBudgetModule { }
