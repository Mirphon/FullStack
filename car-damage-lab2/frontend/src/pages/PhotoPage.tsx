import { useEffect, useRef, useState } from 'react';
import { Alert, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import type { Car } from '../types';

type Props = { car: Car; photo: File | null; onChange: (file: File | null) => void };

export default function PhotoPage({ car, photo, onChange }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!photo) { setPreview(''); return; }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  function selectPhoto(file?: File) {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Выберите фотографию в формате JPG, PNG или WebP.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Размер фотографии должен быть не больше 10 МБ.');
      return;
    }
    setError('');
    onChange(file);
  }

  return (
    <section className="photo-page">
      <div className="car-summary"><div><span>{car.brand} {car.model} · {car.year}{car.body ? ` · ${car.body}` : ''}</span></div><Button component={Link} to="/car" size="small" color="inherit">Изменить</Button></div>
      <input ref={input} type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={e => { selectPhoto(e.target.files?.[0]); e.target.value = ''; }} />
      {preview ? (
        <div className="photo-preview">
          <img src={preview} alt="Выбранная фотография автомобиля" onError={() => { setError('Не удалось прочитать изображение. Выберите другой файл.'); onChange(null); }} />
          <div className="photo-caption"><span>{photo?.name}</span><Button onClick={() => { onChange(null); setError(''); }} color="error">Удалить</Button></div>
        </div>
      ) : (
        <div className="upload-area">
          <svg className="upload-symbol" viewBox="0 0 64 64" aria-hidden="true"><rect x="5" y="5" width="54" height="54" rx="5" /><circle cx="44" cy="21" r="6" /><path d="m6 46 16-17 27 29" /></svg>
          <h2>Прикрепите фото своего авто</h2>
          <p>Автомобиль должен быть виден целиком.</p>
          <p className="file-hint">JPG, PNG или WebP · до 10 МБ</p>
          <Button variant="contained" onClick={() => input.current?.click()}>Выбрать фотографию</Button>
        </div>
      )}
      {error && <Alert severity="error" className="photo-alert">{error}</Alert>}
      <p className="note">Снимайте при хорошем освещении, без бликов и размытия.</p>
      <div className="actions"><Button component={Link} to="/car" variant="outlined">Назад</Button>{photo && <Button variant="contained" onClick={() => input.current?.click()}>Заменить фотографию</Button>}</div>
    </section>
  );
}
