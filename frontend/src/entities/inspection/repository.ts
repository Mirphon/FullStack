import { isCarValid, type Car } from '../car/model';

export type Inspection = {
  id: string;
  car: Car;
  photoName: string;
  note: string;
  createdAt: string;
};

const key = 'car-damage-lab3.inspections';

function isInspection(value: unknown): value is Inspection {
  if (!value || typeof value !== 'object') return false;
  const item = value as Inspection;
  return typeof item.id === 'string' && typeof item.note === 'string'
    && typeof item.photoName === 'string' && typeof item.createdAt === 'string'
    && Number.isFinite(Date.parse(item.createdAt)) && Boolean(item.car)
    && ['brand', 'model', 'year', 'body'].every(field => typeof item.car[field as keyof Car] === 'string')
    && isCarValid(item.car);
}

async function read(): Promise<Inspection[]> {
  await new Promise(resolve => setTimeout(resolve, 250));
  try {
    const data: unknown = JSON.parse(localStorage.getItem(key) ?? '[]');
    if (!Array.isArray(data) || !data.every(isInspection)) throw new Error();
    return data;
  } catch {
    throw new Error('Не удалось загрузить историю. Проверьте доступ к хранилищу браузера и повторите попытку.');
  }
}

function write(items: Inspection[]) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    throw new Error('Не удалось сохранить изменения. Хранилище браузера недоступно или заполнено.');
  }
}

export const inspectionRepository = {
  list: read,
  async save(data: Pick<Inspection, 'car' | 'photoName' | 'note'>) {
    const items = await read();
    const item: Inspection = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    write([item, ...items]);
    return item;
  },
  async remove(id: string) {
    const items = await read();
    write(items.filter(item => item.id !== id));
  },
};
