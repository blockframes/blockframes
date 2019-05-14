import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Material } from '../../material/+state';
import { DeliveryService } from '../+state';
import { MovieQuery } from '@blockframes/movie';

@Component({
  selector: 'delivery-movie-material-item',
  templateUrl: './movie-material-item.component.html',
  styleUrls: ['./movie-material-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieMaterialItemComponent {
  @Input() material: Material;

  public stakeholder: string;
  public isOpen = true;
  public panelButtonLabel = 'LESS';

  constructor(
    private service: DeliveryService,
    private movieQuery: MovieQuery,
  ) {}

  public approvedToggle(material: Material) {
    this.service
      .approvedToggle(material, this.movieQuery.getActiveId())
      .catch(err => console.log(err));
  }

  public panelToggle() {
    this.isOpen = !this.isOpen;
    !!this.isOpen ? (this.panelButtonLabel = 'LESS') : (this.panelButtonLabel = 'MORE');
  }
}
