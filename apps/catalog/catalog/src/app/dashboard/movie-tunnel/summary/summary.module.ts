import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { TunnelPageModule } from '@blockframes/ui/tunnel/page/tunnel-page.module';
// Materials
import { TunnelSummaryComponent } from './summary.component';
import { MovieDisplayMainModule } from '@blockframes/movie/moviedisplay/main/main.module';

@NgModule({
  declarations: [TunnelSummaryComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    TunnelPageModule,
    MovieDisplayMainModule,
    RouterModule.forChild([{ path: '', component: TunnelSummaryComponent }])
  ],
})
export class TunnelSummaryModule {}
