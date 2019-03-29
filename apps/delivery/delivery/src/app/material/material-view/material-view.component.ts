import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Material } from '../+state';

@Component({
  selector: 'material-view',
  templateUrl: './material-view.component.html',
  styleUrls: ['./material-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaterialViewComponent {

  @Input() material: Material;
  @Output() isDeleted = new EventEmitter<boolean>();

  constructor(
  ) { }

  public deleteMaterial() {
    this.isDeleted.emit(true);
  }

}
