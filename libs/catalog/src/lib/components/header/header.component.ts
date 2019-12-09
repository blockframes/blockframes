import { Component } from '@angular/core';

// Transition from transparent to plain toolbar and vice versa
window.addEventListener('scroll', function(e) {
  const header = document.getElementById('header');
  if (document.documentElement.scrollTop || document.body.scrollTop > window.innerHeight) {
    header.classList.add('plain-toolbar');
    header.classList.remove('transparent-toolbar');
  } else {
    header.classList.add('transparent-toolbar');
    header.classList.remove('plain-toolbar');
  }
});

@Component({
  selector: 'catalog-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class CatalogHeaderComponent {}
