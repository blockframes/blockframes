import { SliderComponent } from './slider.component';
import { SliderModule } from './slider.module';
import { ToolkitModule } from '@blockframes/ui/storybook';
import { boolean, array } from '@storybook/addon-knobs';

export default {
    title: 'Bf Slider'
};

export const bfSlider = () => ({
    moduleMetadata: { imports: [SliderModule, ToolkitModule] },
    name: 'Bf Slider',
    component: SliderComponent,
    template: `
  <storybook-toolkit>
    <h1 title>Slider</h1>
      <bf-slider></bf-slider>
  </storybook-toolkit>
`,
    props: {
      autoplay: boolean('autoplay', true),
      loop: boolean('loop', true),
    }
});


