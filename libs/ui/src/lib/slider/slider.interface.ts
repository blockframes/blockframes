export interface Slider {
    /** Anmiations */
    autoplay: boolean;
    /** When should a new slide appear */
    interval: number;
    /** How long should it take for the animation */
    timing: string;
    /** Swipe to see new slides */
    swipe: boolean;

    /** Navigation */
    hideArrows: boolean;
    hideIndicators: boolean;

    /** Appearance */
    // maxWidth: string;
    // maxHeight: string;
    ratio: '1:1' | '16:9' | '4:3' | '3:2' | '8:5';
    loop: boolean;
    slideDirection: 'ltr' | 'rtl'
}