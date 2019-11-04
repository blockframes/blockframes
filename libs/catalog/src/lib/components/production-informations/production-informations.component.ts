import { Component, Input } from '@angular/core';
import { Person } from '@blockframes/movie/movie/+state/movie.firestore';
@Component({
  selector: 'catalog-production-informations',
  templateUrl: './production-informations.component.html',
  styleUrls: ['./production-informations.component.scss']
})
export class CatalogProductionInformationsComponent {
  @Input() productionCompanies: Person[];
  @Input() salesAgentDealLogo: string;
}
