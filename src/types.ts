import { MOVIE_CODES } from '@/constants.js';

export type MovieCode = (typeof MOVIE_CODES)[keyof typeof MOVIE_CODES];

export type Movie = {
  title: string;
  code: MovieCode;
};

export type Rental = {
  movieID: string;
  days: number;
};

export type RentalStatement = {
  statement: string;
  errors: string[];
};

export type RentalCalculation = {
  movie: Movie;
  amount: number;
  points: number;
};

export type Customer = {
  name: string;
  rentals: Rental[];
};

export type MoviesDatabase = {
  [key: string]: Movie;
};

export type PricingRule = {
  basePrice: number;
  thresholdDays: number;
  dailyRate: number;
  bonusThresholdDays?: number;
};
