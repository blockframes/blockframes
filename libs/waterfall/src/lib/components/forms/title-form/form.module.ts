// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';

// Blockframes
import { ImageUploaderModule } from '@blockframes/media/image/uploader/uploader.module';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';

// Pages
import { TitleFormComponent } from './form.component';


@NgModule({
  declarations: [TitleFormComponent],
  exports: [TitleFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ImageUploaderModule,
    StaticSelectModule,

    // Material
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule,
    MatFormFieldModule,
  ],
})
export class TitleFormModule { }
