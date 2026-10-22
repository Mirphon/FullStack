import { Alert, Button, CircularProgress } from '@mui/material';

export default function DataState({ loading, error, empty, onRetry }: {
  loading: boolean; error: string; empty: boolean; onRetry: () => void;
}) {
  if (loading) return <div className="data-state" role="status"><CircularProgress size={32} /><p>Загрузка осмотров…</p></div>;
  if (error) return <Alert severity="error" action={<Button color="inherit" onClick={onRetry}>Повторить</Button>}>{error}</Alert>;
  if (empty) return <div className="data-state" role="status"><h2>Осмотров пока нет</h2><p>Добавьте автомобиль и фотографию, затем сохраните первый осмотр.</p></div>;
  return null;
}
