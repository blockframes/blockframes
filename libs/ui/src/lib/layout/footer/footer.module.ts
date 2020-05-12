// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';

// Component
import { FooterComponent } from './footer.component';

// Blockframes
import { ImgAssetModule } from '../../theme';

// Material
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    RouterModule,
    ImgAssetModule,

    // Material
    MatButtonModule
  ],
  exports: [FooterComponent],
  declarations: [FooterComponent],
})
export class FooterModule { }
