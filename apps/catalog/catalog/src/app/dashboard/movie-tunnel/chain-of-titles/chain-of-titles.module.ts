import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ChainOfTitlesComponent } from './chain-of-titles.component';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { UploadModule } from '@blockframes/media/components/upload/upload.module';
import { FlexLayoutModule } from '@angular/flex-layout';
// Materials
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [ChainOfTitlesComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TunnelPageModule,
    UploadModule,
    FlexLayoutModule,
    // Materials
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    RouterModule.forChild([{ path: '', component: ChainOfTitlesComponent}])
  ],
  exports: [ChainOfTitlesComponent]
})
export class ChainOfTitlesModule { }
