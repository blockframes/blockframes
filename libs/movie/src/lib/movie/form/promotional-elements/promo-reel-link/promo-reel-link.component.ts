import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormArray } from '@angular/forms';

@Component({
  selector: 'movie-form-promo-reel-link',
  templateUrl: './promo-reel-link.component.html',
  styleUrls: ['./promo-reel-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromoReelLinkComponent {
  @Input() form:FormArray;

}
