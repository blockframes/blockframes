import { Component, ChangeDetectionStrategy } from '@angular/core';

/** Transition from transparent to plain toolbar and vice versa. */
window.addEventListener('scroll', function(e) {
  const toolbar = document.getElementById('toolbar');
  if (document.documentElement.scrollTop || document.body.scrollTop > window.innerHeight) {
    toolbar.classList.add('plain-toolbar');
    toolbar.classList.remove('transparent-toolbar');
  } else {
    toolbar.classList.add('transparent-toolbar');
    toolbar.classList.remove('plain-toolbar');
  }
});

@Component({
  selector: 'catalog-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogToolbarComponent {}
