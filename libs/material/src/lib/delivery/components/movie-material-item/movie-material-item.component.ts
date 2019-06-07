import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Material } from '../../../material/+state';

@Component({
  selector: 'delivery-movie-material-item',
  templateUrl: './movie-material-item.component.html',
  styleUrls: ['./movie-material-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieMaterialItemComponent {
  @Input() material: Material;
  @Output() approved = new EventEmitter();

  public stakeholder: string;
  public isOpen = true;
  public panelButtonLabel = 'LESS';

  public approvedToggle(material: Material) {
    this.approved.emit(material);
  }

  public panelToggle() {
    this.isOpen = !this.isOpen;
    !!this.isOpen ? (this.panelButtonLabel = 'LESS') : (this.panelButtonLabel = 'MORE');
  }
}
