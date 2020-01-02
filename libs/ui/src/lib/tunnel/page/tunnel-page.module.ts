import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TunnelPageComponent } from './tunnel-page.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

const material = [
  MatButtonModule,
  MatIconModule
]

@NgModule({
  declarations: [ TunnelPageComponent ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ...material
  ],
  exports: [TunnelPageComponent]
})
export class TunnelPageModule {}
