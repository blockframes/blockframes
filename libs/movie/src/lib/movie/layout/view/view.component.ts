import { Component, Input, ChangeDetectionStrategy, Directive, ViewEncapsulation, } from '@angular/core';

@Component({
  selector: 'movie-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent {
@Input() navLinks: { path: string, label: string }[];
}

@Directive({
  selector: 'movie-header, [movieHeader]',
  host: { class: 'movie-header' }
})
// tslint:disable-next-line: directive-class-suffix
export class MovieHeader {}