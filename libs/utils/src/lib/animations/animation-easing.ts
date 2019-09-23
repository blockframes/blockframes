export const enum Easing {
  easeInSine = ' cubic-bezier(0.47, 0, 0.745, 0.715)',
  easeOutSine = ' cubic-bezier(0.39, 0.575, 0.565, 1)',
  easeInOutSine = ' cubic-bezier(0.445, 0.05, 0.55, 0.95)',

  easeIncubic = ' cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  easeOutcubic = ' cubic-bezier(0.215, 0.61, 0.355, 1)',
  easeInOutcubic = ' cubic-bezier(0.645, 0.045, 0.355, 1)',

  easeInQuint = ' cubic-bezier(0.755, 0.05, 0.855, 0.06)',
  easeOutQuint = ' cubic-bezier(0.23, 1, 0.32, 1)',
  easeInOutQuint = ' cubic-bezier(0.86, 0, 0.07, 1)',

  easeInCirc = ' cubic-bezier(0.6, 0.04, 0.98, 0.335)',
  easeOutCirc = ' cubic-bezier(0.075, 0.82, 0.165, 1)',
  easeInOutCirc = ' cubic-bezier(0.785, 0.135, 0.15, 0.86)',

  /*TODO: search how to use this format https://easings.net/#easeInElastic */
  // easeInElastic = '',
  // easeOutElastic = '',
  // easeInOutElastic = '',

  easeInQuad = ' cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  easeOutQuad = ' cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeInOutQuad = ' cubic-bezier(0.455, 0.03, 0.515, 0.955)',

  easeInQuart = ' cubic-bezier(0.895, 0.03, 0.685, 0.22)',
  easeOutQuart = ' cubic-bezier(0.165, 0.84, 0.44, 1)',
  easeInOutQuart = ' cubic-bezier(0.77, 0, 0.175, 1)',

  easeInExpo = ' cubic-bezier(0.95, 0.05, 0.795, 0.035)',
  easeOutExpo = ' cubic-bezier(0.19, 1, 0.22, 1)',
  easeInOutExpo = ' cubic-bezier(1, 0, 0, 1)',

  easeInBack = ' cubic-bezier(0.6, -0.28, 0.735, 0.045)',
  easeOutBack = ' cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  easeInOutBack = ' cubic-bezier(0.68, -0.55, 0.265, 1.55)',

  /*TODO: search how to use this format https://easings.net/#easeInBounce */
  // easeInBounce = '',
  // easeOutBounce = '',
  // easeInOutBounce = '',
}