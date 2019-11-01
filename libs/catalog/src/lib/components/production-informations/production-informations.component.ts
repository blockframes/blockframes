import { Component, Input } from '@angular/core';
@Component({
  selector: 'catalog-production-informations',
  templateUrl: './production-informations.component.html',
  styleUrls: ['./production-informations.component.html']
})
export class CatalogProductionInformationsComponent {
  @Input() productionCompanies;
  @Input() salesAgentDealLogo
}
