import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IconService } from '../../icon-service';

type Views = 'component' | 'icons';

@Component({
  selector: 'storybook-toolkit',
  templateUrl: './toolkit.component.html',
  styleUrls: ['./toolkit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolkitComponent implements OnInit {

  view: Views = 'component';

  constructor(icons: IconService) { }

  ngOnInit(): void {
  }

}
