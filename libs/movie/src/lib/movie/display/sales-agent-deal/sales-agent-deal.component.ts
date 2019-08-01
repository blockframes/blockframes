import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { createMovieSalesAgentDeal, MovieSalesAgentDeal } from '../../+state';
import { getLabelByCode } from '../../staticModels';

@Component({
  selector: '[agentDeal] movie-display-sales-agentdeal',
  templateUrl: './sales-agent-deal.component.html',
  styleUrls: ['./sales-agent-deal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplaySalesAgentDealComponent {

  public data : MovieSalesAgentDeal;
  public getLabelByCode = getLabelByCode;

  @Input() set agentDeal(agentDeal: Partial<MovieSalesAgentDeal>) {
    this.data = createMovieSalesAgentDeal(agentDeal);
  }

}
