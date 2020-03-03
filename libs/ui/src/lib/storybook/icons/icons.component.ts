import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { icons } from '../../icon-service';
import { startWith, debounceTime, map } from 'rxjs/operators';

@Component({
  selector: 'storybook-icons',
  templateUrl: './icons.component.html',
  styleUrls: ['./icons.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconsComponent {

  color = '';
  search = new FormControl('');
  icons$ = this.search.valueChanges.pipe(
    startWith(this.search.value),
    debounceTime(200),
    map(search => icons.filter(({ name }) => name.toLowerCase().indexOf(search) === 0))
  );

  constructor(private clipboard: Clipboard, private snackBar: MatSnackBar, private cdr: ChangeDetectorRef) { }

  copy(name: string) {
    this.clipboard.copy(name);
    this.snackBar.open(`Copied: ${name}`, '', { duration: 1000 });
  }

  setColor(color: string) {
    this.color = color;
    this.cdr.markForCheck();
  }

}
