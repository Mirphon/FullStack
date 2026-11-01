import CarForm from '../features/car-form/CarForm';
import type { Car } from '../entities/car/model';

export default function CarPage(props: { car: Car; onChange: (car: Car) => void }) {
  return <CarForm {...props} />;
}
