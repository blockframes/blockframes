// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

// Component
import { HeaderComponent } from './header.component';

// Blockframes
import { DisplayNameModule } from '@blockframes/utils/pipes';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';



@NgModule({
  declarations: [HeaderComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    DisplayNameModule,
    ImageReferenceModule,

    // Material
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  exports: [HeaderComponent]
})
export class MovieHeaderModule { }
