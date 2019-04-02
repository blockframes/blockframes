import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Material } from '../+state';

@Component({
  selector: 'material-item',
  templateUrl: './material-item.component.html',
  styleUrls: ['./material-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaterialItemComponent {

  @Input() material: Material;
  @Output() isDeleted = new EventEmitter<boolean>();

  constructor(
  ) { }

  public deleteMaterial() {
    this.isDeleted.emit(true);
  }

}
