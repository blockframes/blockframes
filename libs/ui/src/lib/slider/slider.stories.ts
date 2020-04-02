import { SliderComponent } from './slider.component';
import { SliderModule } from './slider.module';
import { ToolkitModule } from '@blockframes/ui/storybook';
import { boolean, array, text, number } from '@storybook/addon-knobs';

export default {
  title: 'Bf Slider'
};

export const bfSlider = () => ({
  moduleMetadata: { imports: [SliderModule, ToolkitModule] },
  name: 'Bf Slider',
  component: SliderComponent,
  template: `
  <storybook-toolkit>
  <h1 title>Bf Slider</h1>
    <bf-slider 
    [autoplay]="autoplay"
    [loop]="loop"
    [swipe]="swipe"
    [ratio]="ratio"
    [interval]="interval"
    [hideIndicators]="hideIndicators">
      <ng-container *ngFor="let image of images">
        <bf-slide 
        [image]="image" 
        [overlayColor]="overlayColor"
        [hideOverlay]="hideOverlay">
        </bf-slide>
      </ng-container>
    </bf-slider>
</storybook-toolkit>
  `,
  props: {
    autoplay: boolean('autoplay', true),
    loop: boolean('loop', true),
    images: array('images', [
      'https://www.calliaweb.co.uk/wp-content/uploads/2015/10/600x600.jpg',
      'https://via.placeholder.com/600/24f355',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSGP3UPcCTWmSJSqwbBJkwk57hHN45w3kfC6-jnWKTKW6RuWnws&usqp=CAU',
      'https://via.placeholder.com/600/24f355',
      'https://www.calliaweb.co.uk/wp-content/uploads/2015/10/600x600.jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSGP3UPcCTWmSJSqwbBJkwk57hHN45w3kfC6-jnWKTKW6RuWnws&usqp=CAU',
      'https://via.placeholder.com/600/24f355',
      'https://www.calliaweb.co.uk/wp-content/uploads/2015/10/600x600.jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSGP3UPcCTWmSJSqwbBJkwk57hHN45w3kfC6-jnWKTKW6RuWnws&usqp=CAU',
      'https://via.placeholder.com/600/24f355',
      'https://www.calliaweb.co.uk/wp-content/uploads/2015/10/600x600.jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSGP3UPcCTWmSJSqwbBJkwk57hHN45w3kfC6-jnWKTKW6RuWnws&usqp=CAU'
    ]),
    swipe: boolean('swipe', true),
    ratio: text('ratio', ''),
    interval: number('interval', 5000),
    timing: text('timing', "350 ease-in"),
    hideArrows: boolean('hideArrows', false),
    hideIndicators: boolean('hideIndicators', false),
    slideDirection: text('slideDirection', 'ltr'),
    hideOverlay: boolean('hideOverlay', false),
    overlayColor: text('overlayColor', '#00000080')
  }
});