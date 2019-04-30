import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Material } from '../../material/+state';
import { DeliveryService } from '../+state';
import { MovieQuery, Stakeholder } from '@blockframes/movie';
import { OrganizationQuery } from '@blockframes/organization';

@Component({
  selector: 'delivery-movie-material-item',
  templateUrl: './movie-material-item.component.html',
  styleUrls: ['./movie-material-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieMaterialItemComponent implements OnInit {
  @Input() material: Material;
  @Input() stakeholders: Stakeholder[];

  // Visual bullshit for WoW effect
  public stateIcon: string;
  public stakeholder: string;

  public isOpen = true;
  public panelButtonLabel = 'LESS';

  constructor(
    private service: DeliveryService,
    private movieQuery: MovieQuery,
    private orgQuery: OrganizationQuery
  ) {}

  ngOnInit() {
    this.stakeholder = this.orgQuery.getEntity(
      this.stakeholders[1].orgId
    ).name;
  }

  public approvedToggle(material: Material) {
    this.service
      .approvedToggle(material, this.movieQuery.getActiveId())
      .catch(err => console.log(err));
    //TODO: Ask why we put .catch ? And why we put it without "try" before
  }

  public panelToggle() {
    this.isOpen = !this.isOpen;
    !!this.isOpen ? (this.panelButtonLabel = 'LESS') : (this.panelButtonLabel = 'MORE');
  }
}
