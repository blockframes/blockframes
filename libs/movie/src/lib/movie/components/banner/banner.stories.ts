import { object } from '@storybook/addon-knobs';
import { MOVIES } from '@blockframes/utils/mocks';
import { MovieBannerModule } from './banner.module';
import { ThemeWidgetModule } from '@blockframes/ui/theme/theme-widget/theme-widget.module';

export default {
  title: 'Movie Banner'
};

export const movieBanner = () => ({
  moduleMetadata: { imports: [MovieBannerModule, ThemeWidgetModule] },
  name: 'Movie Banner',
  template: `
    <theme-widget theme="dark"></theme-widget>
    <movie-banner [movie]="movie"></movie-banner>`,
  props: {
    movie: object('movie', MOVIES[0]),
  }
});


