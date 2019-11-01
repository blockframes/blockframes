import { Component, Input } from '@angular/core';
@Component({
  selector: 'catalog-production-information',
  templateUrl: './production-information.component.html'
})
export class CatalogProductionInformationComponent {
  @Input() productionCompanies;
  @Input() salesAgentDealLogo
}
