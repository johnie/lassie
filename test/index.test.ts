import { describe, it, expect, vi } from 'vitest';
import type { Customer, Movie, MoviesDatabase } from '@/types.js';
import {
  REGULAR_THRESHOLD_DAYS,
  CHILDRENS_THRESHOLD_DAYS,
  REGULAR_BASE_PRICE,
  CHILDRENS_BASE_PRICE,
  NEW_RELEASE_DAILY_RATE,
  EXTENDED_RENTAL_DAILY_RATE,
  MOVIE_CODES,
} from '@/constants.js';
import { calculateAmount, generateStatement } from '@/index.js';
import { templateBuilder } from '@/utils.js';

vi.mock('@/utils.js', () => ({
  templateBuilder: vi.fn((template, data) => {
    return Object.entries(data).reduce((acc, [key, value]) => {
      return acc.replace(new RegExp(`{${key}}`, 'g'), String(value));
    }, template);
  }),
}));

describe('Movie Rental System', () => {
  const movies: MoviesDatabase = {
    F001: { title: 'Ran', code: MOVIE_CODES.REGULAR },
    F002: { title: 'Trois Couleurs: Bleu', code: MOVIE_CODES.REGULAR },
    F003: { title: 'Sunes Sommar', code: MOVIE_CODES.CHILDRENS },
    F004: { title: 'Yara', code: MOVIE_CODES.NEW },
  };

  describe('calculateAmount', () => {
    it('calculates correct amount for regular movies', () => {
      const regularMovie: Movie = { title: 'Regular Movie', code: MOVIE_CODES.REGULAR };
      expect(calculateAmount(regularMovie, 1)).toBe(REGULAR_BASE_PRICE);
      expect(calculateAmount(regularMovie, REGULAR_THRESHOLD_DAYS)).toBe(REGULAR_BASE_PRICE);
      expect(calculateAmount(regularMovie, REGULAR_THRESHOLD_DAYS + 1)).toBe(
        REGULAR_BASE_PRICE + EXTENDED_RENTAL_DAILY_RATE,
      );
      expect(calculateAmount(regularMovie, REGULAR_THRESHOLD_DAYS + 2)).toBe(
        REGULAR_BASE_PRICE + 2 * EXTENDED_RENTAL_DAILY_RATE,
      );
    });

    it('calculates correct amount for new release movies', () => {
      const newMovie: Movie = { title: 'New Movie', code: MOVIE_CODES.NEW };
      expect(calculateAmount(newMovie, 1)).toBe(NEW_RELEASE_DAILY_RATE);
      expect(calculateAmount(newMovie, 2)).toBe(2 * NEW_RELEASE_DAILY_RATE);
      expect(calculateAmount(newMovie, 3)).toBe(3 * NEW_RELEASE_DAILY_RATE);
    });

    it("calculates correct amount for children's movies", () => {
      const childrensMovie: Movie = { title: "Children's Movie", code: MOVIE_CODES.CHILDRENS };
      expect(calculateAmount(childrensMovie, 1)).toBe(CHILDRENS_BASE_PRICE);
      expect(calculateAmount(childrensMovie, CHILDRENS_THRESHOLD_DAYS)).toBe(CHILDRENS_BASE_PRICE);
      expect(calculateAmount(childrensMovie, CHILDRENS_THRESHOLD_DAYS + 1)).toBe(
        CHILDRENS_BASE_PRICE + EXTENDED_RENTAL_DAILY_RATE,
      );
      expect(calculateAmount(childrensMovie, CHILDRENS_THRESHOLD_DAYS + 2)).toBe(
        CHILDRENS_BASE_PRICE + 2 * EXTENDED_RENTAL_DAILY_RATE,
      );
    });

    it('returns 0 for unknown movie code', () => {
      const unknownMovie: Movie = { title: 'Unknown Movie', code: 'unknown' as any };
      expect(calculateAmount(unknownMovie, 1)).toBe(0);
    });
  });

  describe('generateStatement', () => {
    const customer: Customer = {
      name: 'martin',
      rentals: [
        { movieID: 'F001', days: 3 },
        { movieID: 'F002', days: 1 },
        { movieID: 'F003', days: 5 },
        { movieID: 'F004', days: 2 },
      ],
    };

    it('generates correct statement and no errors for valid rentals', () => {
      const result = generateStatement(customer, movies);

      expect(result.errors).toHaveLength(0);

      expect(templateBuilder).toHaveBeenCalledWith(
        [
          'Rental Record for {customerName}',
          '{rentalLines}',
          'Amount owed is {totalAmount}',
          'You earned {totalPoints} frequent renter points',
        ].join('\n'),
        {
          customerName: 'martin',
          rentalLines: expect.stringContaining('Ran\t3.50'),
          totalAmount: '16.00',
          totalPoints: 4,
        },
      );

      expect(result.statement).toBe(
        'Rental Record for martin\n' +
          '\tRan\t3.50\n' +
          '\tTrois Couleurs: Bleu\t2.00\n' +
          '\tSunes Sommar\t4.50\n' +
          '\tYara\t6.00\n' +
          'Amount owed is 16.00\n' +
          'You earned 4 frequent renter points',
      );
    });

    it('generates statement and reports errors for non-existent movies', () => {
      const customerWithInvalidMovie: Customer = {
        name: 'invalid',
        rentals: [
          { movieID: 'F001', days: 1 },
          { movieID: 'INVALID', days: 1 },
          { movieID: 'F003', days: 1 },
        ],
      };
      const result = generateStatement(customerWithInvalidMovie, movies);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toBe('Movie with ID INVALID not found');

      expect(result.statement).toContain('Rental Record for invalid');
      expect(result.statement).toContain('Ran\t2.00');
      expect(result.statement).toContain('Sunes Sommar\t1.50');
      expect(result.statement).not.toContain('INVALID');
    });

    it('generates empty statement when all movies are invalid', () => {
      const customerWithAllInvalidMovies: Customer = {
        name: 'allInvalid',
        rentals: [
          { movieID: 'INVALID1', days: 1 },
          { movieID: 'INVALID2', days: 1 },
        ],
      };
      const result = generateStatement(customerWithAllInvalidMovies, movies);

      expect(result.errors).toHaveLength(2);
      expect(result.errors).toContain('Movie with ID INVALID1 not found');
      expect(result.errors).toContain('Movie with ID INVALID2 not found');

      expect(result.statement).toContain('Rental Record for allInvalid');
      expect(result.statement).toContain('Amount owed is 0.00');
      expect(result.statement).toContain('You earned 0 frequent renter points');
    });
  });
});
