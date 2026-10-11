import { useState, type FormEvent } from 'react';
import { Alert, Button, TextField } from '@mui/material';
import { Link } from 'react-router-dom';

export default function AuthPage({ registration = false }: { registration?: boolean }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState(false);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordValid = registration ? password.length >= 8 : password.length > 0;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setMessage(emailValid && passwordValid && (!registration || Boolean(name.trim() && password === confirmation)));
  }

  return (
    <section className="auth-page">
      <p className="auth-intro">{registration ? 'Укажите имя, электронную почту и придумайте пароль.' : 'Введите электронную почту и пароль от своего аккаунта.'}</p>
      <form noValidate onSubmit={submit} onChange={() => setMessage(false)}>
        <div className="fields auth-fields">
          {registration && <TextField label="Имя" required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} error={submitted && !name.trim()} helperText={submitted && !name.trim() ? 'Введите имя' : ' '} slotProps={{ htmlInput: { maxLength: 80 } }} />}
          <TextField label="Электронная почта" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} error={submitted && !emailValid} helperText={submitted && !emailValid ? 'Введите корректный адрес почты' : ' '} slotProps={{ htmlInput: { maxLength: 254 } }} />
          <TextField label="Пароль" type="password" required autoComplete={registration ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} error={submitted && !passwordValid} helperText={submitted && !passwordValid ? (registration ? 'Используйте не меньше 8 символов' : 'Введите пароль') : (registration ? 'Не меньше 8 символов' : ' ')} />
          {registration && <TextField label="Повторите пароль" type="password" required autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} error={submitted && (!confirmation || password !== confirmation)} helperText={submitted && (!confirmation || password !== confirmation) ? 'Пароли должны совпадать' : ' '} />}
        </div>
        {message && <Alert severity="info">Данные заполнены корректно. Для {registration ? 'создания аккаунта' : 'входа в аккаунт'} нужно подключить сервер. Данные не отправлены.</Alert>}
        <Button type="submit" variant="contained" fullWidth>{registration ? 'Зарегистрироваться' : 'Войти'}</Button>
      </form>
      <p className="auth-switch">{registration ? 'Уже есть аккаунт?' : 'Нет аккаунта?'} <Link to={registration ? '/login' : '/register'}>{registration ? 'Войти' : 'Зарегистрироваться'}</Link></p>
      <Button component={Link} to="/" variant="outlined">На главную</Button>
    </section>
  );
}
