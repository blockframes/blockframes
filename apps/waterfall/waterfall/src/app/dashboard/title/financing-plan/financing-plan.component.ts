// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';

// Blockframes


@Component({
  selector: 'waterfall-title-financing-plan',
  templateUrl: './financing-plan.component.html',
  styleUrls: ['./financing-plan.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinancingPlanComponent {

  path = '/assets/images/demo-cannes/documents.svg';

  switch() {
    if (this.path === '/assets/images/demo-cannes/documents.svg') {
      this.path = '/assets/images/demo-cannes/Contracts_View Producer.svg';
    } else if (this.path === '/assets/images/demo-cannes/Contracts_View Producer.svg') {
      this.path = '/assets/images/demo-cannes/Gestion des Documents_Contracts_Coproducer.svg';
    } else {
      this.path = '/assets/images/demo-cannes/documents.svg';
    }
  }
}
