
// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Component
import { WaterfallBudgetFormComponent } from './budget-form.component';

// Blockframes
import { FileUploaderModule } from '@blockframes/media/file/file-uploader/file-uploader.module';

@NgModule({
  declarations: [WaterfallBudgetFormComponent],
  exports: [WaterfallBudgetFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FileUploaderModule,
  ],
})
export class WaterfallBudgetFormModule { }
