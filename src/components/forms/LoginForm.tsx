'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

// Demo credentials hint
const DEMO_ACCOUNTS = [
  { role: 'Citizen', email: 'citizen@demo.jandrishti.in', password: 'Demo@1234' },
  { role: 'Authority', email: 'authority@demo.jandrishti.in', password: 'Demo@1234' },
  { role: 'Super Admin', email: 'admin@demo.jandrishti.in', password: 'Demo@1234' },
];

export function LoginForm() {
  const { login } = useAuth();
  const { isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setError(null);
    const result = await login(data);
    if (!result.success) {
      setError(result.error ?? 'Login failed. Please check your credentials.');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">🇮🇳</span>
            <span className="text-2xl font-bold text-blue-800">JanDrishti <span className="text-orange-500">AI</span></span>
          </Link>
        </div>

        <Card className="shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your JanDrishti AI account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              {/* Global error */}
              {error && (
                <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...register('email')}
                  aria-invalid={!!errors.email}
                />
                {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register('password')}
                    aria-invalid={!!errors.password}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full" loading={isLoading}>
                {isLoading ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-blue-700 font-medium hover:underline">Register here</Link>
            </p>
          </CardContent>
        </Card>

        {/* Demo accounts */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-amber-800 mb-3 uppercase tracking-wide">⚡ Demo Accounts</p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => { setValue('email', acc.email); setValue('password', acc.password); setError(null); }}
                  className="w-full text-left text-xs rounded-md bg-white border border-amber-200 p-2.5 hover:bg-amber-50 transition-colors"
                >
                  <span className="font-semibold text-amber-900">{acc.role}</span>
                  <span className="text-amber-600 ml-2">{acc.email}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-amber-600 mt-2">Click a role to pre-fill credentials, then click Sign In.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
