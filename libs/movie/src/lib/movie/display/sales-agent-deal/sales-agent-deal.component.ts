import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { createMovieSalesAgentDeal, MovieSalesAgentDeal } from '../../+state';
import { getLabelByCode } from '../../static-model/staticModels';

@Component({
  selector: '[deal] movie-display-salesdeal',
  templateUrl: './sales-agent-deal.component.html',
  styleUrls: ['./sales-agent-deal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplaySalesAgentDealComponent {

  public data : MovieSalesAgentDeal;
  public getLabelByCode = getLabelByCode;

  @Input() set deal(agentDeal: Partial<MovieSalesAgentDeal>) {
    this.data = createMovieSalesAgentDeal(agentDeal);
  }

}
