import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Material } from '../../../material/+state';

@Component({
  selector: 'delivery-movie-material-item',
  templateUrl: './movie-material-item.component.html',
  styleUrls: ['./movie-material-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieMaterialItemComponent implements OnInit {
  @Input() material: Material;
  @Output() approved = new EventEmitter();

  public materialApproved: boolean;
  public stakeholder: string;
  public isOpen = true;
  public panelButtonLabel = 'LESS';

  ngOnInit() {
    this.materialApproved = this.material.approved;
  }

  public panelToggle() {
    this.isOpen = !this.isOpen;
    !!this.isOpen ? (this.panelButtonLabel = 'LESS') : (this.panelButtonLabel = 'MORE');
  }
}
