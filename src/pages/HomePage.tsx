import { Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <section className="welcome">
      <p>Укажите данные автомобиля и добавьте фото,<br className="desktop-break" /> на котором он виден целиком.</p>
      <Button component={Link} to="/car" variant="contained" size="large">Начать осмотр</Button>
    </section>
  );
}
