import { Component, ChangeDetectionStrategy, Input } from "@angular/core";
import { Company } from "@blockframes/utils/common-interfaces/identity";

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
  @Input() europeanQualification;
  @Input() versionInfo;
  @Input() prizes;
  @Input() synopsis;
  @Input() keywords;
  @Input() releaseDate;
  @Input() productionCompanies: Company[];
  @Input() salesAgent;
}
