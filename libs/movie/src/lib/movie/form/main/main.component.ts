// Angular
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

// Component
import { MovieFormShellComponent } from '../shell/shell.component';

// RxJs
import { Subscription, Observable } from 'rxjs';
import { startWith, distinctUntilChanged } from 'rxjs/operators';

// Material
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'movie-form-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormMainComponent implements OnInit, OnDestroy {
  form = this.shell.getForm('movie');
  public movieId = this.route.snapshot.params.movieId;
  contentType = this.form.contentType.valueChanges.pipe(startWith(this.form.contentType.value))
  valuesCustomGenres$: Observable<string[]>;
  customGenreCtrl = new FormControl();
  public separatorKeysCodes: number[] = [ENTER, COMMA];

  public displayedColumns = {
    firstName: 'First Name',
    lastName: 'Last Name',
    status: 'Status',
    category: 'Category',
    description: 'Description',
    filmography: 'Filmography'
  }


  private sub: Subscription;
  constructor(private shell: MovieFormShellComponent, private route: ActivatedRoute, private dynTitle: DynamicTitleService) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Main Information')
    this.valuesCustomGenres$ = this.form.customGenres.valueChanges.pipe(startWith(this.form.customGenres.value));

    this.validateRunningTime(this.form.runningTime.value);
    this.sub = this.form.runningTime.valueChanges.pipe(distinctUntilChanged())
      .subscribe(runningTime => this.validateRunningTime(runningTime));
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  public addCustomGenre(event: MatChipInputEvent): void {
    const { value = '' } = event;

    this.form.customGenres.add(value)
    this.customGenreCtrl.reset();
  }

  public removeCustomGenre(i: number): void {
    this.form.customGenres.removeAt(i);
  }

  get international() {
    return this.form.title.get('international');
  }

  get original() {
    return this.form.title.get('original');
  }

  private validateRunningTime({ status, time }: { status: string, time: number }) {
    if ((status === 'confirmed' || status === 'estimated') && (!time || time <= 0)) {
      this.form.runningTime.get('time').markAsTouched()
      this.form.runningTime.get('time').setErrors({ required: true });
    } else {
      this.form.runningTime.get('time').setErrors(null);
    }
  }
}
