export interface Slider {
    // Anmiations
    autoplay: boolean;
    // When should a new slide appear
    interval: number;
    // How long should it take for the animation
    timing: string;
    // Swipe to see new slides
    swipe: boolean;

    // Navigation
    hideArrows: boolean;
    hideIndicators: boolean;

    //Apperance
    ratio: '1:1' | '6:5' | '5:4' | '4:3' | '2:1' | '16:9';
    loop: boolean;
    slideDirection: 'ltr' | 'rtl',
    theme: 'light' | 'dark';
    arrowBack: string;
    arrowForward: string;
}