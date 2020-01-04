import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Component({
  selector: '[formControl] movie-form-key-assets, [formControlName] movie-form-key-assets, movie-form-key-assets',
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
