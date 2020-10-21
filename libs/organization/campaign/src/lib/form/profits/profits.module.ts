import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { CampaignFormProfitsComponent } from './profits.component';

import { UploadModule } from '@blockframes/media/components/upload/upload.module';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [CampaignFormProfitsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    TunnelPageModule,
    UploadModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatIconModule,
    RouterModule.forChild([{ path: '', component: CampaignFormProfitsComponent }])
  ]
})
export class CampaignFormProfitsModule { }
