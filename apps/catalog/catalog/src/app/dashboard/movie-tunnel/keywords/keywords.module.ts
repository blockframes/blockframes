import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TunnelKeywordsComponent } from './keywords.component';
import { TunnelPageModule } from '@blockframes/ui/tunnel/page/tunnel-page.module';
// Material
import { MatCardModule } from '@angular/material/card';

const material = [
  MatCardModule
]
@NgModule({
  declarations: [TunnelKeywordsComponent],
  imports: [
    TunnelPageModule,
    RouterModule.forChild([{ path: '', component: TunnelKeywordsComponent }]),
    ...material
  ],
})
export class TunnelKeywordsModule {}
