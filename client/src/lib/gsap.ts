import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { useGSAP } from '@gsap/react';

/**
 * Single place GSAP plugins get registered. Import gsap / ScrollTrigger /
 * useGSAP from here rather than from the packages directly.
 */
gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, DrawSVGPlugin, useGSAP);

/** Glyphs used for every "decoding" text effect, so they all read as one system. */
export const DECODE_CHARS = '01<>/\\[]{}#$%&*+=?!ABCDEFXZ';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export { gsap, ScrollTrigger, useGSAP };
