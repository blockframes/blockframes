import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Component({
  //  TODO#1478 Sync Data and UI, remove movie-form-key-assets from selector
  selector: '[formGroup] movie-form-key-assets, [formGroupName] movie-form-key-assets, movie-form-key-assets',
  templateUrl: './key-assets.component.html',
  styleUrls: ['./key-assets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KeyAssetsComponent {

  constructor(private controlContainer: ControlContainer) { }

  get keyAssets() {
    return this.controlContainer.control
  }

}
