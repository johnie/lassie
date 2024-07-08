# Lassie Assignment - Movie Rental System

## Installation

1. Clone the repository:

```sh
git clone https://github.com/johnie/lassie.git
cd lassie
```

2. Install dependencies:

```sh
pnpm install <or> npm install
```

## Usage

Here's a basic example of how to use the movie rental system:

```typescript
import { generateStatement } from './index.js';
import { MOVIE_CODES } from './constants.js';

const movies = {
  F001: { title: 'Ran', code: MOVIE_CODES.REGULAR },
  F002: { title: 'Trois Couleurs: Bleu', code: MOVIE_CODES.REGULAR },
  F003: { title: 'Sunes Sommar', code: MOVIE_CODES.CHILDRENS },
  F004: { title: 'Yara', code: MOVIE_CODES.NEW },
};

const customer = {
  name: 'John Doe',
  rentals: [
    { movieID: 'F001', days: 3 },
    { movieID: 'F004', days: 2 },
  ],
};

const statement = generateStatement(customer, movies);

console.log(statement);
```

This will output a rental statement for the customer.

## Project Structure

- `index.ts`: Main file containing the core functions
- `constants.ts`: Contains constant values used throughout the project
- `types.ts`: type definitions
- `utils.ts`: Utility functions, including the template builder

## Testing

This project uses Vitest for testing. To run the tests:

1. Run the tests:

```sh
pnpm test
```
