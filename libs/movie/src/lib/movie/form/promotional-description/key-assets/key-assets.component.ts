import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MoviePromotionalDescriptionControl } from '../promotional-description.form';
@Component({
  selector: '[form] movie-form-key-assets',
  templateUrl: './key-assets.component.html',
  styleUrls: ['./key-assets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KeyAssetsComponent {

  @Input() form: MoviePromotionalDescriptionControl['keyAssets'];
}
