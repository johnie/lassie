import type { Customer, Movie, MoviesDatabase, RentalStatement, RentalCalculation } from '@/types.js';
import {
  REGULAR_THRESHOLD_DAYS,
  CHILDRENS_THRESHOLD_DAYS,
  NEW_RELEASE_BONUS_THRESHOLD_DAYS,
  REGULAR_BASE_PRICE,
  CHILDRENS_BASE_PRICE,
  NEW_RELEASE_DAILY_RATE,
  EXTENDED_RENTAL_DAILY_RATE,
  BASE_FREQUENT_RENTER_POINTS,
  BONUS_FREQUENT_RENTER_POINTS,
  MOVIE_CODES,
} from '@/constants.js';
import { templateBuilder } from '@/utils.js';

export function calculateAmount(movie: Movie, days: number) {
  switch (movie.code) {
    case MOVIE_CODES.REGULAR:
      return REGULAR_BASE_PRICE + Math.max(0, days - REGULAR_THRESHOLD_DAYS) * EXTENDED_RENTAL_DAILY_RATE;
    case MOVIE_CODES.NEW:
      return days * NEW_RELEASE_DAILY_RATE;
    case MOVIE_CODES.CHILDRENS:
      return CHILDRENS_BASE_PRICE + Math.max(0, days - CHILDRENS_THRESHOLD_DAYS) * EXTENDED_RENTAL_DAILY_RATE;
    default:
      return 0;
  }
}

function calculateFrequentRenterPoints(movie: Movie, days: number) {
  if (movie.code === MOVIE_CODES.NEW && days > NEW_RELEASE_BONUS_THRESHOLD_DAYS) {
    return BASE_FREQUENT_RENTER_POINTS + BONUS_FREQUENT_RENTER_POINTS;
  }

  return BASE_FREQUENT_RENTER_POINTS;
}

export function generateStatement(customer: Customer, movies: MoviesDatabase): RentalStatement {
  const errors: string[] = [];
  const rentalCalculations = customer.rentals
    .map((rental) => {
      const movie = movies[rental.movieID];
      if (!movie) {
        errors.push(`Movie with ID ${rental.movieID} not found`);
        return null;
      }
      const amount = calculateAmount(movie, rental.days);
      const points = calculateFrequentRenterPoints(movie, rental.days);
      return { movie, amount, points };
    })
    .filter(Boolean) as RentalCalculation[];

  const totalAmount = rentalCalculations.reduce((sum, calc) => sum + calc.amount, 0);
  const totalPoints = rentalCalculations.reduce((sum, calc) => sum + calc.points, 0);
  const rentalLines = rentalCalculations.map((calc) => `\t${calc.movie.title}\t${calc.amount.toFixed(2)}`).join('\n');

  const rentalTemplate = [
    'Rental Record for {customerName}',
    '{rentalLines}',
    'Amount owed is {totalAmount}',
    'You earned {totalPoints} frequent renter points',
  ].join('\n');

  const statement = templateBuilder(rentalTemplate, {
    customerName: customer.name,
    rentalLines,
    totalAmount: totalAmount.toFixed(2),
    totalPoints,
  });

  return { statement, errors };
}
