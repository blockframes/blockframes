import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';
import { Observable } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatLegacyChipInputEvent as MatChipInputEvent } from '@angular/material/legacy-chips';
import { UntypedFormControl } from '@angular/forms';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'movie-form-story-elements',
  templateUrl: './story-elements.component.html',
  styleUrls: ['./story-elements.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormStoryElementsComponent implements OnInit {
  values$: Observable<string[]>;
  form = this.shell.getForm('movie');
  keyword = new UntypedFormControl();
  public separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(private shell: MovieFormShellComponent, private dynTitle: DynamicTitleService) {
    this.dynTitle.setPageTitle('Storyline Elements')
  }

  ngOnInit() {
    this.values$ = this.form.keywords.valueChanges.pipe(startWith(this.form.keywords.value));
  }

  public add(event: MatChipInputEvent): void {
    const { value = '' } = event;

    this.form.keywords.add(value.trim());
    this.keyword.reset();
  }

  public remove(i: number): void {
    this.form.keywords.removeAt(i);
  }
}
