import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CatalogFooterComponent } from './footer.component';
// Material
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [CatalogFooterComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    // Material
    MatIconModule,
  ],
  exports: [CatalogFooterComponent]
})
export class CatalogFooterModule {}
