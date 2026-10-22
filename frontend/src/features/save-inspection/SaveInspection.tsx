import { useState, type FormEvent } from 'react';
import { Alert, Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { Car } from '../../entities/car/model';
import { inspectionRepository } from '../../entities/inspection/repository';

type Props = { car: Car; photo: File | null; onSaved: () => void };

export default function SaveInspection({ car, photo, onSaved }: Props) {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    if (!photo) { setError('Добавьте фотографию автомобиля.'); return; }
    if (note.trim().length > 1000) { setError('Примечание должно содержать не больше 1000 символов.'); return; }
    setError('');
    setSaving(true);
    try {
      await inspectionRepository.save({ car: { ...car }, photoName: photo.name, note: note.trim() });
      onSaved();
      navigate('/history', { state: { saved: true } });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось сохранить осмотр.');
    } finally {
      setSaving(false);
    }
  }

  return <form className="save-inspection" noValidate onSubmit={submit} aria-busy={saving}>
    <TextField label="Примечание к осмотру" multiline minRows={2} value={note} disabled={saving}
      onChange={event => setNote(event.target.value)} error={note.length > 1000} helperText={`${note.length}/1000`} />
    <p className="note">Сохраняются данные автомобиля, примечание и имя файла. Само фото доступно только до обновления страницы.</p>
    {error && <Alert severity="error">{error}</Alert>}
    <Button variant="contained" type="submit" disabled={saving}>{saving ? 'Сохранение…' : 'Сохранить осмотр'}</Button>
  </form>;
}
