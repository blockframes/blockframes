import { Component, ChangeDetectionStrategy, Input } from "@angular/core";
import { getCodeIfExists } from "@blockframes/utils/static-model/staticModels";

@Component({
  selector: 'movie-display-principal-informations',
  templateUrl: './display-principal-informations.component.html',
  styleUrls: ['./display-principal-informations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MovieDisplayPrincipalInformationsComponent {
  @Input() main;
  @Input() salesCast;
  @Input() budget;
  @Input() salesInfo;

  public hasEuropeanQualification() {
    return this.salesInfo.certifications.some(r => r === getCodeIfExists('CERTIFICATIONS', 'european-qualification'))
  }
}
