import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Material } from '../../material/+state';
import { DeliveryService } from '../+state';
import { MovieQuery } from '@blockframes/movie';

@Component({
  selector: 'delivery-view-item',
  templateUrl: './delivery-view-item.component.html',
  styleUrls: ['./delivery-view-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryViewItemComponent implements OnInit {
  @Input() material: Material;

  // Visual bullshit for WoW effect
  public stateIcons = ['dummy', 'accepted', 'available', 'delivered', 'pending', 'refused'];
  public paymentIcons = ['dummy', 'payed', 'not_payed'];
  public stateIcon: string;
  public paymentIcon: string;

  public isOpen = true;
  public disableMaterial = false;
  public panelButtonLabel = 'LESS';
  public disableButtonLabel = 'DISABLE';

  constructor(private service: DeliveryService, private movieQuery: MovieQuery) {}

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

  public panelToggle() {
    this.isOpen = !this.isOpen;
    !!this.isOpen ? (this.panelButtonLabel = 'LESS') : (this.panelButtonLabel = 'MORE');
  }

  public disableToggle() {
    this.disableMaterial = !this.disableMaterial;
    this.isOpen = false;
    this.panelButtonLabel = 'MORE';
    !!this.disableMaterial
      ? (this.disableButtonLabel = 'ENABLE')
      : (this.disableButtonLabel = 'DISABLE');
  }
}
