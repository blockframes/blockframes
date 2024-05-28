// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Component
import { TitleStatusComponent } from './title-status.component';

// Blockframes
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { AppPipeModule } from '@blockframes/utils/pipes/app.pipe';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([{path: '', component: TitleStatusComponent}]),
    TunnelPageModule,
    FlexLayoutModule,
    ImageModule,
    AppPipeModule,

    // Material
    MatRadioModule,
    MatCardModule
  ],
  declarations: [TitleStatusComponent],
})
export class TitleStatusModule { }
