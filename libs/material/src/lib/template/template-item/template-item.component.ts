import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { template } from '@angular/core/src/render3';

@Component({
  selector: 'template-item',
  templateUrl: './template-item.component.html',
  styleUrls: ['./template-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateItemComponent {

  @Input() template;

  constructor() { }
}
