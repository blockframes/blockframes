import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Material, MaterialService } from '../+state';

@Component({
  selector: 'material-view',
  templateUrl: './material-view.component.html',
  styleUrls: ['./material-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaterialViewComponent implements OnInit {

  @Input() material: Material;

  constructor(
    private service: MaterialService,
  ) { }

  ngOnInit() {
  }

  public deleteMaterial() {
    this.service.deleteMaterial(this.material.id);
  }

}
