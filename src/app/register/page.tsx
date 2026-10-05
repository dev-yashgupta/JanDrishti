import { RegisterForm } from '@/components/forms/RegisterForm';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Register' };

export default function RegisterPage() {
  return <RegisterForm />;
}
