export type Car = {
  brand: string;
  model: string;
  year: string;
  body: string;
};

export function isCarValid(car: Car) {
  const year = Number(car.year);
  return Boolean(car.brand.trim() && car.model.trim() && /^\d{4}$/.test(car.year)
    && year >= 1900 && year <= new Date().getFullYear());
}
