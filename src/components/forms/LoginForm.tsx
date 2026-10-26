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
import { AlertCircle, Eye, EyeOff, ShieldCheck, UserCheck } from 'lucide-react';
import { useState } from 'react';

export function LoginForm() {
  const { login } = useAuth();
  const { isLoading } = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setError(null);
    const result = await login(data);
    if (!result.success) setError(result.error ?? 'Login failed.');
  }

  function fillDemo(role: 'citizen' | 'admin') {
    if (role === 'citizen') {
      setValue('email', 'citizen@demo.jandrishti.in');
      setValue('password', 'Demo@1234');
    } else {
      setValue('email', 'authority@demo.jandrishti.in');
      setValue('password', 'Demo@1234');
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center px-4 py-12 font-sans">
      <div className="w-full max-w-md space-y-6">

        {/* Brand identity */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#071A2F] via-[#155EEF] to-[#0E9384] flex items-center justify-center text-white shadow-sm shadow-blue-500/25 ring-1 ring-black/5">
              <Eye className="h-4 w-4" />
            </div>
            <span className="text-2xl font-black tracking-tight text-[#071A2F]">
              JanDrishti<span className="text-[#155EEF] font-black">.ai</span>
            </span>
          </Link>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Civic Intelligence Platform</p>
        </div>

        <Card className="rounded-2xl border border-[#E4E7EC] shadow-[0_1px_3px_rgba(16,24,40,0.08)]">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</CardTitle>
            <CardDescription className="text-xs text-slate-500">Sign in to your JanDrishti AI verified account</CardDescription>
          </CardHeader>
          <CardContent>

            {/* Quick Fill Demo Accounts */}
            <div className="mb-5 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Quick Fill Demo Credentials
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemo('citizen')}
                  className="px-2.5 py-1.5 bg-white border border-[#E4E7EC] hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <UserCheck className="h-3.5 w-3.5 text-[#0E9384]" />
                  <span>Demo Citizen</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('admin')}
                  className="px-2.5 py-1.5 bg-white border border-[#E4E7EC] hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-[#155EEF]" />
                  <span>Demo Officer</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</Label>
                <Input id="email" type="email" placeholder="you@example.com"
                  autoComplete="email" {...register('email')} aria-invalid={!!errors.email}
                  className="rounded-xl border-[#E4E7EC] bg-slate-50 focus:bg-white text-xs" />
                {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                    autoComplete="current-password" {...register('password')}
                    aria-invalid={!!errors.password} className="pr-10 rounded-xl border-[#E4E7EC] bg-slate-50 focus:bg-white text-xs" />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label="Toggle password visibility">
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full bg-[#155EEF] hover:bg-blue-600 rounded-xl text-xs font-bold shadow-sm shadow-blue-500/30" loading={isLoading}>
                {isLoading ? 'Signing in…' : 'Sign In to Account'}
              </Button>
            </form>

            <p className="mt-4 text-center text-xs text-slate-500">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-[#155EEF] font-bold hover:underline">Register here</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
