import type { MovieCode, PricingRule } from '@/types.js';

export const REGULAR_THRESHOLD_DAYS = 2;
export const CHILDRENS_THRESHOLD_DAYS = 3;
export const NEW_RELEASE_THRESHOLD_DAYS = 0;

export const NEW_RELEASE_BONUS_THRESHOLD_DAYS = 2;

export const REGULAR_BASE_PRICE = 2;
export const CHILDRENS_BASE_PRICE = 1.5;
export const NEW_RELEASE_BASE_PRICE = 0;

export const NEW_RELEASE_DAILY_RATE = 3;
export const EXTENDED_RENTAL_DAILY_RATE = 1.5;

export const BASE_FREQUENT_RENTER_POINTS = 1;
export const BONUS_FREQUENT_RENTER_POINTS = 1;

export const MOVIE_CODES = {
  REGULAR: 'regular',
  NEW: 'new',
  CHILDRENS: 'childrens',
} as const;

export const PRICING_RULES: Record<MovieCode, PricingRule> = {
  [MOVIE_CODES.REGULAR]: {
    basePrice: REGULAR_BASE_PRICE,
    thresholdDays: REGULAR_THRESHOLD_DAYS,
    dailyRate: EXTENDED_RENTAL_DAILY_RATE,
  },
  [MOVIE_CODES.CHILDRENS]: {
    basePrice: CHILDRENS_BASE_PRICE,
    thresholdDays: CHILDRENS_THRESHOLD_DAYS,
    dailyRate: EXTENDED_RENTAL_DAILY_RATE,
  },
  [MOVIE_CODES.NEW]: {
    basePrice: NEW_RELEASE_BASE_PRICE,
    thresholdDays: NEW_RELEASE_THRESHOLD_DAYS,
    dailyRate: NEW_RELEASE_DAILY_RATE,
    bonusThresholdDays: NEW_RELEASE_BONUS_THRESHOLD_DAYS,
  },
} as const;
