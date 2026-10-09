import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

const steps = [
  { title: 'Начало', text: 'Нажмите кнопку и перейдите к осмотру автомобиля.' },
  { title: 'Данные автомобиля', text: 'Укажите марку, модель и год выпуска.' },
  { title: 'Фотография', text: 'Добавьте фотографию автомобиля целиком.' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const auth = pathname === '/login' || pathname === '/register';
  const step = auth ? -1 : pathname === '/car' ? 1 : pathname === '/photo' ? 2 : 0;

  return (
    <div className="app">
      <aside className="sidebar">
        <Link className="brand" to="/">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5a3 3 0 0 1 3-2h8a3 3 0 0 1 3 2l2 6v9a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-2H6v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9l2-6Zm2 .5L5.5 10h13L17 5.5H7ZM7 12a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm10 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" /></svg>
          Осмотр авто
        </Link>
        <nav className="account-links" aria-label="Аккаунт">
          <Link to="/login" aria-current={pathname === '/login' ? 'page' : undefined}>Вход</Link>
          <Link to="/register" aria-current={pathname === '/register' ? 'page' : undefined}>Регистрация</Link>
        </nav>
        <h2>Как это работает</h2>
        <ol className="guide">
          {steps.map((item, index) => (
            <li key={item.title} aria-current={step === index ? 'step' : undefined}>
              <span className={step === index ? 'guide-number active' : 'guide-number'}>{index + 1}</span>
              <div><h3>{item.title}</h3><p>{item.text}</p></div>
            </li>
          ))}
        </ol>
      </aside>
      <main className={auth ? 'main auth-main' : step === 0 ? 'main home' : 'main'}>
        <h1 tabIndex={-1}>{auth ? (pathname === '/login' ? 'Вход в аккаунт' : 'Регистрация') : ['Оценка повреждений автомобиля', 'Данные автомобиля', 'Фотография автомобиля'][step]}</h1>
        {!auth && <nav aria-label="Этапы осмотра">
          <ol className="steps">
            {['Начало', 'Автомобиль', 'Фотография'].map((label, index) => (
              <li key={label} className={index === step ? 'current' : index < step ? 'completed' : ''} aria-current={index === step ? 'step' : undefined}>
                <span className="step-circle" aria-hidden="true">{index < step ? '✓' : index + 1}</span>
                <span>{label}</span>
                {index < 2 && <svg className="step-arrow" viewBox="0 0 64 24" aria-hidden="true"><path d="M2 12h58M49 2l11 10-11 10" /></svg>}
              </li>
            ))}
          </ol>
        </nav>}
        {children}
      </main>
    </div>
  );
}
