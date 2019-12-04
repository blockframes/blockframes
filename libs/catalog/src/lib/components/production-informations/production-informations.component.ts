import { Component, Input } from '@angular/core';
import { Company } from '@blockframes/utils/common-interfaces/identity';
import { ImgRef } from '@blockframes/utils';

@Component({
  selector: 'catalog-production-informations',
  templateUrl: './production-informations.component.html',
  styleUrls: ['./production-informations.component.scss']
})
export class CatalogProductionInformationsComponent {
  @Input() productionCompanies: Company[];
  @Input() salesAgentDealLogo: ImgRef;
}
