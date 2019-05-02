import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'template-empty',
  templateUrl: './template-empty.component.html',
  styleUrls: ['./template-empty.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateEmptyComponent {

  constructor() {}
}
