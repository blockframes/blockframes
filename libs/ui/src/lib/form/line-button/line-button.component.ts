import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'bf-line-button',
  templateUrl: 'line-button.component.html',
  styleUrls: ['./line-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineButtonComponent {
  @Input() buttonText = 'Add'
  @Output() buttonClick = new EventEmitter();
} 