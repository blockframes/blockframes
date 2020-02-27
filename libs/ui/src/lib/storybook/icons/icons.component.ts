import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { icons } from '../../icon-service';

@Component({
  selector: 'storybook-icons',
  templateUrl: './icons.component.html',
  styleUrls: ['./icons.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconsComponent {

  icons = icons;

  constructor(private clipboard: Clipboard, private snackBar: MatSnackBar) { }

  copy(name: string) {
    this.clipboard.copy(name);
    this.snackBar.open(`Copied: ${name}`, '', { duration: 1000 });
  }

}
