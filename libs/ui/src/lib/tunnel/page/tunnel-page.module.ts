import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TunnelPageComponent } from './tunnel-page.component';

@NgModule({
  declarations: [ TunnelPageComponent ],
  imports: [
    CommonModule,
    FlexLayoutModule,
  ],
  exports: [TunnelPageComponent]
})
export class TunnelPageModule {}
