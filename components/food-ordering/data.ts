export type ProductCategory =
  | "Most Popular"
  | "Pizza"
  | "Burgers"
  | "Wraps"
  | "Bowls";

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  rating: number;
  prepTime: string;
  calories: number;
  description: string;
};

export const categories: ProductCategory[] = [
  "Most Popular",
  "Pizza",
  "Burgers",
  "Wraps",
  "Bowls",
];

export const products: Product[] = [
  {
    id: "p-01",
    name: "Truffle Mushroom Pizza",
    category: "Pizza",
    price: 13.99,
    rating: 4.8,
    prepTime: "18-24 min",
    calories: 620,
    description: "Wild mushroom blend, truffle cream, basil.",
  },
  {
    id: "p-02",
    name: "Smoked Brisket Burger",
    category: "Burgers",
    price: 11.5,
    rating: 4.7,
    prepTime: "14-19 min",
    calories: 740,
    description: "Chipotle mayo, smoked onions, sharp cheddar.",
  },
  {
    id: "p-03",
    name: "Hot Honey Pepperoni",
    category: "Pizza",
    price: 12.75,
    rating: 4.9,
    prepTime: "17-23 min",
    calories: 690,
    description: "Pepperoni, chili honey drizzle, mozzarella.",
  },
  {
    id: "p-04",
    name: "Grilled Chicken Wrap",
    category: "Wraps",
    price: 9.25,
    rating: 4.6,
    prepTime: "12-16 min",
    calories: 470,
    description: "Romaine, avocado crema, pickled onions.",
  },
  {
    id: "p-05",
    name: "Sesame Teriyaki Bowl",
    category: "Bowls",
    price: 10.99,
    rating: 4.7,
    prepTime: "13-17 min",
    calories: 540,
    description: "Chicken, jasmine rice, cucumber, sesame slaw.",
  },
  {
    id: "p-06",
    name: "Crispy Chicken Melt",
    category: "Most Popular",
    price: 10.49,
    rating: 4.8,
    prepTime: "11-15 min",
    calories: 590,
    description: "Buttermilk chicken, pickles, mustard aioli.",
  },
  {
    id: "p-07",
    name: "Garlic Margherita",
    category: "Most Popular",
    price: 11.99,
    rating: 4.7,
    prepTime: "15-21 min",
    calories: 580,
    description: "Roasted garlic oil, basil, fior di latte.",
  },
  {
    id: "p-08",
    name: "Classic Cheeseburger",
    category: "Most Popular",
    price: 9.95,
    rating: 4.6,
    prepTime: "10-14 min",
    calories: 670,
    description: "Double patty, lettuce, tomato, secret sauce.",
  },
];
