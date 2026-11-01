import AuthForm from '../features/auth-form/AuthForm';

export default function AuthPage(props: { registration?: boolean }) {
  return <AuthForm {...props} />;
}
