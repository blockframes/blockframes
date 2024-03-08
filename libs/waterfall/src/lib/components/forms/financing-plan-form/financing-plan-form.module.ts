
// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Component
import { WaterfallFinancingPlanFormComponent } from './financing-plan-form.component';

// Blockframes
import { FileUploaderModule } from '@blockframes/media/file/file-uploader/file-uploader.module';

@NgModule({
  declarations: [WaterfallFinancingPlanFormComponent],
  exports: [WaterfallFinancingPlanFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FileUploaderModule,
  ],
})
export class WaterfallFinancingPlanFormModule { }
