import { Component, ChangeDetectionStrategy, Input } from "@angular/core";
import { Company } from "@blockframes/utils/common-interfaces/identity";
import { hasSlug } from "@blockframes/utils/static-model/staticModels";

@Component({
  selector: 'movie-display-film-info-card',
  templateUrl: './display-film-info-card.component.html',
  styleUrls: ['./display-film-info-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MovieDisplayFilmInfoCardComponent {
  @Input() main;
  @Input() salesCast;
  @Input() budget;
  @Input() salesInfo;
  @Input() color;
  @Input() versionInfo;
  @Input() prizes;
  @Input() synopsis;
  @Input() keywords;
  @Input() releaseDate;
  @Input() stakeholders: Company[];
  @Input() salesAgent;

  public hasTheatricalRelease() {
    return hasSlug(this.salesInfo.originalRelease.map(r => r.media), 'MEDIAS', 'theatrical');
  }

  public hasEuropeanQualification() {
    return hasSlug(this.salesInfo.certifications, 'CERTIFICATIONS', 'europeanQualification');
  }
}
