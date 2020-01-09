import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { TunnelPageModule } from '@blockframes/ui/tunnel/page/tunnel-page.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { TunnelPreviousDealsComponent } from './previous-deals.component';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [TunnelPreviousDealsComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    TunnelPageModule,
    RouterModule.forChild([{ path: '', component: TunnelPreviousDealsComponent }]),
    MatCardModule
  ]
})
export class TunnelPreviousDealsModule {}
