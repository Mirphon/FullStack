import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { inspectionRepository, type Inspection } from '../entities/inspection/repository';
import DataState from '../shared/ui/DataState';

export default function HistoryPage() {
  const [items, setItems] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Inspection | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const location = useLocation();
  const [saved, setSaved] = useState(Boolean(location.state?.saved));
  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try { setItems(await inspectionRepository.list()); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Ошибка загрузки.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    void reload();
    const onStorage = () => { void reload(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [reload]);

  async function remove() {
    if (!selected || deleting) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await inspectionRepository.remove(selected.id);
      setItems(current => current.filter(item => item.id !== selected.id));
      setSelected(null);
    } catch (reason) { setDeleteError(reason instanceof Error ? reason.message : 'Ошибка удаления.'); }
    finally { setDeleting(false); }
  }

  const filtered = items.filter(item => `${item.car.brand} ${item.car.model} ${item.car.year} ${item.note}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));

  return <section className="history-page">
    {saved && <Alert severity="success" onClose={() => setSaved(false)}>Осмотр сохранён.</Alert>}
    <div className="history-toolbar"><Button component={Link} to="/car" variant="contained">Новый осмотр</Button><Button onClick={reload} disabled={loading}>Обновить</Button></div>
    <p className="note">История хранится в этом браузере. Автоматическая оценка повреждений пока не выполняется.</p>
    <DataState loading={loading} error={error} empty={!items.length} onRetry={reload} />
    {!loading && !error && items.length > 0 && <>
      <TextField label="Поиск по автомобилю или примечанию" value={query} onChange={event => setQuery(event.target.value)} />
      <p role="status">Найдено осмотров: {filtered.length}</p>
      {filtered.length === 0 && <Alert severity="info">Ничего не найдено. Измените поисковый запрос.</Alert>}
      <div className="inspection-list">{filtered.map(item => <Card key={item.id} variant="outlined" className="inspection-card"><CardContent>
        <h2>{item.car.brand} {item.car.model}</h2>
        <p>{item.car.year}{item.car.body ? ` · ${item.car.body}` : ''}</p>
        <p className="note">{new Date(item.createdAt).toLocaleString('ru-RU')} · {item.photoName}</p>
        {item.note && <p className="inspection-note">{item.note}</p>}
        <Button color="error" onClick={() => { setDeleteError(''); setSelected(item); }}>Удалить осмотр</Button>
      </CardContent></Card>)}</div>
    </>}
    <Dialog open={Boolean(selected)} onClose={() => { if (!deleting) setSelected(null); }} aria-labelledby="delete-title">
      <DialogTitle id="delete-title">Удалить осмотр?</DialogTitle>
      <DialogContent><p>{selected?.car.brand} {selected?.car.model}. Восстановить запись после удаления не получится.</p>{deleteError && <Alert severity="error">{deleteError}</Alert>}</DialogContent>
      <DialogActions><Button disabled={deleting} onClick={() => setSelected(null)}>Отмена</Button><Button disabled={deleting} color="error" onClick={remove}>{deleting ? 'Удаление…' : 'Удалить'}</Button></DialogActions>
    </Dialog>
  </section>;
}
