import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Component({
  selector: '[formArray] movie-form-keywords, [formArrayName] movie-form-keywords',
  templateUrl: './keywords.component.html',
  styleUrls: ['./keywords.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class KeywordsComponent {

  constructor(private controlContainer: ControlContainer) {
    console.log('controlContianer', this.controlContainer)
  }

  // get keywords() {
  //   // console.log('controlContianer', this.controlContainer)
  //   return this.controlContainer.control
  // }

}
