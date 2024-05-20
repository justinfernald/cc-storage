import { CSSObject, keyframes } from '@emotion/react';
import { Property } from 'csstype';

import { dropShadow } from './utils';

const scalePopKeyFrames = keyframes({
  'from, to': [
    {
      transform: 'scale(1)',
    },
    dropShadow(2),
  ],
  '50%': [
    {
      transform: 'scale(1.1)',
    },
    dropShadow(3),
  ],
});

/**
 * Returns a CSSObject representing the scale pop animation.
 * @param duration The duration of the animation. Default is '0.5s'.
 * @param timingFunction The timing function of the animation. Default is 'cubic-bezier(0.0, 1.01, 0.0, 1.65)'.
 * @returns The CSSObject representing the scale pop animation.
 */
export const scalePop = (
  duration = '0.5s',
  timingFunction = 'cubic-bezier(0.0, 1.01, 0.0, 1.65)',
): CSSObject => ({
  animation: `${scalePopKeyFrames} ${duration} ${timingFunction}`,
});

const fadeInKeyFrames = keyframes({
  from: {
    opacity: 0,
  },
  to: {
    opacity: 1,
  },
});

/**
 * Creates a CSSObject for a fade-in animation.
 * @param duration The duration of the animation. Default is '0.6s'.
 * @param timingFunction The timing function of the animation. Default is 'ease'.
 * @param delay The delay before the animation starts. Default is '0s'.
 * @returns The CSSObject for the fade-in animation.
 */
export const fadeIn = (
  duration = '0.6s',
  timingFunction = 'ease',
  delay = '0s',
): CSSObject => ({
  animation: `${fadeInKeyFrames} ${duration} ${timingFunction}`,
  animationDelay: delay,
  opacity: 1,
});

const fadeOutKeyFrames = keyframes({
  from: {
    opacity: 1,
  },
  to: {
    opacity: 0,
  },
});

/**
 * Creates a fade out animation CSS object.
 * @param duration The duration of the animation. Default is '0.6s'.
 * @param timingFunction The timing function of the animation. Default is 'ease'.
 * @returns The CSS object representing the fade out animation.
 */
export const fadeOut = (duration = '0.6s', timingFunction = 'ease'): CSSObject => ({
  animation: `${fadeOutKeyFrames} ${duration} ${timingFunction}`,
  opacity: 0,
});

const scaleTransitionKeyFrames = (initial: number, final: number) =>
  keyframes({
    from: {
      transform: `scale(${initial})`,
    },
    to: {
      transform: `scale(${final})`,
    },
  });

/**
 * Creates a CSSObject for a scale transition animation.
 * @param duration The duration of the animation. Default is '0.5s'.
 * @param from The initial scale value. Default is 1.
 * @param to The final scale value. Default is 0.
 * @param timingFunction The timing function of the animation. Default is 'ease'.
 * @returns The CSSObject for the scale transition animation.
 */
export const scaleTransition = (
  duration = '0.5s',
  from = 1,
  to = 0,
  timingFunction = 'ease',
): CSSObject => ({
  animation: `${scaleTransitionKeyFrames(from, to)} ${duration} 1 ${timingFunction}`,
  transform: `scale(${to})`,
});

const waveMovementKeyFrames = (axis: 'x' | 'y' = 'x') =>
  keyframes({
    from: {
      [axis === 'x' ? 'left' : 'bottom']: 0,
    },
    to: {
      [axis === 'x' ? 'left' : 'bottom']: `100vh`,
    },
    // from: {
    //   bottom: 0,
    //   left: '50%',
    // },
    // '50%': {
    //   bottom: '50%',
    //   left: '60%',
    // },
    // to: {
    //   bottom: '100%',
    //   left: '40%',
    // },
  });

/**
 * Generates CSS properties for wave movement animation.
 * @param duration The duration of the animation. Default is '2s'.
 * @param timingFunction The timing function of the animation. Default is 'ease-in-out'.
 * @returns The CSS properties for wave movement animation.
 */
export const waveMovement = (
  duration = '2s',
  timingFunction = 'ease-in-out',
): CSSObject => ({
  animation: `${waveMovementKeyFrames()} ${duration} alternate infinite ${timingFunction}, ${waveMovementKeyFrames(
    'y',
  )} ${'3s'} alternate infinite ${timingFunction}`,
  // bottom: '100%',
  // left: '25%',
});

const displayFixerKeyFrames = (
  display: Property.Display | string[] | Property.Display[] | undefined,
) =>
  keyframes({
    from: {
      display,
    },
    to: {
      display,
    },
  });

/**
 * Returns a CSSObject that fixes the display property during and after an animation.
 * @param duringDisplay The display property value during the animation.
 * @param afterDisplay The display property value after the animation.
 * @param duration The duration of the animation.
 * @returns The CSSObject with the animation and display properties.
 */
export const displayFixer = (
  duringDisplay: Property.Display | string[] | Property.Display[] | undefined = 'block',
  afterDisplay: Property.Display | string[] | Property.Display[] | undefined = 'block',
  duration = '0.6s',
): CSSObject => ({
  animation: `${displayFixerKeyFrames(
    duringDisplay,
  )} ${duration} alternate infinite linear`,
  display: afterDisplay,
});

/**
 * Creates an array of CSS objects representing the animation for fading in an element with a specified display property.
 * @param duringDisplay The display property or array of display properties to apply during the animation.
 * @param afterDisplay The display property or array of display properties to apply after the animation.
 * @param duration The duration of the animation.
 * @param timingFunction The timing function of the animation.
 * @returns An array of CSS objects representing the animation.
 */
export const fadeInDisplay = (
  duringDisplay: Property.Display | string[] | Property.Display[] | undefined = 'block',
  afterDisplay: Property.Display | string[] | Property.Display[] | undefined = 'block',
  duration = '0.6s',
  timingFunction = 'ease',
): CSSObject[] =>
  combineAnimations(
    displayFixer(duringDisplay, afterDisplay, duration),
    fadeIn(duration, timingFunction),
  );

/**
 * Creates an array of CSS objects that define a fade-out animation with optional display settings.
 *
 * @param duringDisplay The display property or array of display properties to apply during the animation. Defaults to 'block'.
 * @param afterDisplay The display property or array of display properties to apply after the animation. Defaults to 'block'.
 * @param duration The duration of the animation. Defaults to '0.6s'.
 * @param timingFunction The timing function of the animation. Defaults to 'ease'.
 * @returns An array of CSS objects defining the fade-out animation.
 */
export const fadeOutDisplay = (
  duringDisplay: Property.Display | string[] | Property.Display[] | undefined = 'block',
  afterDisplay: Property.Display | string[] | Property.Display[] | undefined = 'block',
  duration = '0.6s',
  timingFunction = 'ease',
): CSSObject[] =>
  combineAnimations(
    displayFixer(duringDisplay, afterDisplay, duration),
    fadeOut(duration, timingFunction),
  );

/**
 * Combines multiple CSS animations into a single animation.
 * @param animations - The CSS animations to combine.
 * @returns The combined CSS animation.
 */
export const combineAnimations = (...animations: CSSObject[]): CSSObject[] => [
  ...animations,
  {
    animation: animations.map((animation) => animation.animation).join(', '),
  },
];
