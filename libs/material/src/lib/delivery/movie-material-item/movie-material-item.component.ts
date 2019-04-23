import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Material } from '../../material/+state';
import { DeliveryService } from '../+state';
import { MovieQuery } from '@blockframes/movie';

@Component({
  selector: 'delivery-movie-material-item',
  templateUrl: './movie-material-item.component.html',
  styleUrls: ['./movie-material-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieMaterialItemComponent implements OnInit {
  @Input() material: Material;

  // Visual bullshit for WoW effect
  public stateIcons = ['dummy', 'accepted', 'available', 'delivered', 'pending', 'refused'];
  public paymentIcons = ['dummy', 'payed', 'not_payed'];
  public stateIcon: string;
  public paymentIcon: string;

  constructor(
    private service: DeliveryService,
    private movieQuery: MovieQuery,
    ) {}

  ngOnInit() {
    this.stateIcon = this.stateIcons[this.randomNumberPicker(5)];
    this.paymentIcon = this.paymentIcons[this.randomNumberPicker(2)];
  }

  public deliveredToggle(material: Material) {
    this.service
      .deliveredToggle(material, this.movieQuery.getActiveId())
      .catch(err => console.log(err));
  }

  public randomNumberPicker(scale: number) {
    return Math.floor(Math.random() * scale) + 1;
  }
}
