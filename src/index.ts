import type { Customer, Movie, MoviesDatabase, RentalCalculation, RentalStatement } from '@/types.js';
import { BASE_FREQUENT_RENTER_POINTS, BONUS_FREQUENT_RENTER_POINTS, PRICING_RULES } from '@/constants.js';
import { templateBuilder } from '@/utils.js';

export function calculateAmount(movie: Movie, days: number): number {
  const rule = PRICING_RULES[movie.code];
  if (!rule) {
    throw new Error(`Invalid movie code: ${movie.code}`);
  }

  return rule.basePrice + Math.max(0, days - rule.thresholdDays) * rule.dailyRate;
}

export function calculateFrequentRenterPoints(movie: Movie, days: number): number {
  const rule = PRICING_RULES[movie.code];
  if (!rule) {
    throw new Error(`Invalid movie code: ${movie.code}`);
  }

  const bonusPoints = rule.bonusThresholdDays && days > rule.bonusThresholdDays ? BONUS_FREQUENT_RENTER_POINTS : 0;

  return BASE_FREQUENT_RENTER_POINTS + bonusPoints;
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
