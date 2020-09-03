import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieTunnelComponent } from '../movie-tunnel.component';

@Component({
  selector: 'catalog-movie-tunnel-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BudgetComponent {
  form = this.tunnel.form;

  constructor(private tunnel: MovieTunnelComponent, private dynTitle: DynamicTitleService) {
    this.dynTitle.setPageTitle('Budget, Quotas, Critics', 'Title information')
  }

  // get estimatedBudget() {
  //   return this.form.get('budget').get('estimatedBudget');
  // }

  // get certifications() {
  //   return this.form.get('salesInfo').get('certifications');
  // }

  // get rating() {
  //   return this.form.get('salesInfo').get('rating');
  // }

  // get boxOffice() {
  //   return this.form.get('budget').get('boxOffice');
  // }

  // get review() {
  //   return this.form.get('movieReview');
  // }
}
