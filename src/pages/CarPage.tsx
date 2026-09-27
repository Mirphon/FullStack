import { useState, type FormEvent } from 'react';
import { Button, MenuItem, TextField } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { isCarValid, type Car } from '../types';

type Props = { car: Car; onChange: (car: Car) => void };

export default function CarPage({ car, onChange }: Props) {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const currentYear = new Date().getFullYear();
  const yearValid = /^\d{4}$/.test(car.year) && Number(car.year) >= 1900 && Number(car.year) <= currentYear;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (isCarValid(car)) navigate('/photo');
  }

  return (
    <section className="car-page">
      <p className="intro">Укажите основные сведения об автомобиле.</p>
      <form noValidate onSubmit={submit}>
        <div className="fields">
          <TextField label="Марка" required value={car.brand} onChange={e => onChange({ ...car, brand: e.target.value })} placeholder="Например, Toyota" error={submitted && !car.brand.trim()} helperText={submitted && !car.brand.trim() ? 'Укажите марку' : ' '} slotProps={{ inputLabel: { shrink: true }, htmlInput: { maxLength: 60 } }} />
          <TextField label="Модель" required value={car.model} onChange={e => onChange({ ...car, model: e.target.value })} placeholder="Например, Camry" error={submitted && !car.model.trim()} helperText={submitted && !car.model.trim() ? 'Укажите модель' : ' '} slotProps={{ inputLabel: { shrink: true }, htmlInput: { maxLength: 60 } }} />
          <TextField label="Год выпуска" required value={car.year} onChange={e => onChange({ ...car, year: e.target.value })} placeholder="Например, 2018" error={submitted && !yearValid} helperText={submitted && !yearValid ? `Введите год от 1900 до ${currentYear}` : ' '} slotProps={{ inputLabel: { shrink: true }, htmlInput: { inputMode: 'numeric', maxLength: 4 } }} />
          <TextField select label="Тип кузова" value={car.body} onChange={e => onChange({ ...car, body: e.target.value })} helperText="Необязательное поле">
            <MenuItem value="">Не выбран</MenuItem>
            {['Седан', 'Хэтчбек', 'Универсал', 'Кроссовер', 'Внедорожник', 'Купе', 'Минивэн', 'Пикап', 'Другой'].map(body => <MenuItem key={body} value={body}>{body}</MenuItem>)}
          </TextField>
        </div>
        <p className="note">* Обязательные поля</p>
        <div className="actions"><Button component={Link} to="/" variant="outlined">Назад</Button><Button type="submit" variant="contained">Далее: фотография →</Button></div>
      </form>
    </section>
  );
}
