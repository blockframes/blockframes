import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CampaignFormFundingsComponent } from './fundings.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { FormTableModule } from '@blockframes/ui/form/table/form-table.module';
import { FileUploaderModule } from '@blockframes/media/file/file-uploader/file-uploader.module';
import { FundingsPipeModule } from '../../pipes/fundings.pipe';
import { BudgetPipeModule } from '../../pipes/budget.pipe';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';


@NgModule({
  declarations: [CampaignFormFundingsComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    TunnelPageModule,
    FormTableModule,
    FileUploaderModule,
    FundingsPipeModule,
    BudgetPipeModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDividerModule,
    RouterModule.forChild([{ path: '', component: CampaignFormFundingsComponent }])
  ]
})
export class CampaignFormFundingsModule { }
