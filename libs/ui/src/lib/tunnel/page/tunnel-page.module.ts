import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { TunnelPageComponent } from './tunnel-page.component';

@NgModule({
  declarations: [ TunnelPageComponent ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    RouterModule,
    RouterModule.forChild([{ path: '', component: TunnelPageComponent }])
  ],
  exports: [TunnelPageComponent]
})
export class TunnelPageModule {}
