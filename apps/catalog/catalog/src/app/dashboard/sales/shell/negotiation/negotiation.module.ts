import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ConfirmDeclineComponentModule } from '@blockframes/contract/contract/components/confirm-decline/confirm-decline.module';

import { NegotiationComponent } from './negotiation.component';
import { NegotiationGuard } from './negotiation.guard';
import { NegotiationFormModule } from '@blockframes/contract/negotiation';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [NegotiationComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ConfirmDeclineComponentModule,
    NegotiationFormModule,
    MatIconModule,
    MatButtonModule,
    RouterModule.forChild([
      {
        path: '',
        component: NegotiationComponent,
        canActivate: [NegotiationGuard],
        canDeactivate: [NegotiationGuard]
      }
    ]),
  ]
})
export class NegotiationModule { }
