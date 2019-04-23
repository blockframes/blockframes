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
  public stateIcons = ['accepted', 'available', 'delivered', 'pending', 'refused'];
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
    this.stateIcon = this.stateIcons[this.randomNumberPicker(5)];
    this.stakeholder = this.orgQuery.getEntity(
      this.stakeholders[this.randomNumberPicker(this.stakeholders.length)].orgId
    ).name;
  }

  public deliveredToggle(material: Material) {
    this.service
      .deliveredToggle(material, this.movieQuery.getActiveId())
      .catch(err => console.log(err));
    //TODO: Ask why we put .catch ? And why we put it without "try" before
  }

  public randomNumberPicker(scale: number) {
    return Math.floor(Math.random() * scale);
  }

  public panelToggle() {
    this.isOpen = !this.isOpen;
    !!this.isOpen ? (this.panelButtonLabel = 'LESS') : (this.panelButtonLabel = 'MORE');
  }
}
