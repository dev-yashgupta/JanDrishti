'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { registerSchema, type RegisterFormData } from '@/lib/validations';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { SUPPORTED_LANGUAGES, INDIAN_STATES } from '@/lib/constants';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const { isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema) as never,
    defaultValues: { role: 'CITIZEN', preferred_language: 'en' },
  });

  async function onSubmit(data: RegisterFormData) {
    setError(null);
    const result = await registerUser({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone || undefined,
      password: data.password,
      preferred_language: data.preferred_language as 'en',
      city: data.city || undefined,
      state: data.state || undefined,
      role: data.role,
    });
    if (!result.success) {
      setError(result.error ?? 'Registration failed. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">🇮🇳</span>
            <span className="text-2xl font-bold text-blue-800">JanDrishti <span className="text-orange-500">AI</span></span>
          </Link>
        </div>

        <Card className="shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">Create Your Account</CardTitle>
            <CardDescription>Join JanDrishti AI and help your community</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Role selector */}
              <div className="grid grid-cols-2 gap-3">
                {(['CITIZEN', 'AUTHORITY'] as const).map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setValue('role', role)}
                    className={`rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                      watch('role') === role
                        ? 'border-blue-700 bg-blue-50 text-blue-800'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    {role === 'CITIZEN' ? '👤 Citizen' : '👮 Authority'}
                  </button>
                ))}
              </div>

              {/* Full name */}
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" placeholder="Priya Sharma" autoComplete="name" {...register('full_name')} aria-invalid={!!errors.full_name} />
                {errors.full_name && <p className="text-xs text-red-600">{errors.full_name.message}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" {...register('email')} aria-invalid={!!errors.email} />
                {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number <span className="text-slate-400">(optional)</span></Label>
                <Input id="phone" type="tel" placeholder="9876543210" autoComplete="tel" {...register('phone')} aria-invalid={!!errors.phone} />
                {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 chars, 1 uppercase, 1 number"
                    autoComplete="new-password"
                    {...register('password')}
                    aria-invalid={!!errors.password}
                    className="pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label="Toggle password">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    {...register('confirm_password')}
                    aria-invalid={!!errors.confirm_password}
                    className="pr-10"
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label="Toggle confirm password">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirm_password && <p className="text-xs text-red-600">{errors.confirm_password.message}</p>}
              </div>

              {/* Language */}
              <div className="space-y-1.5">
                <Label>Preferred Language</Label>
                <Select defaultValue="en" onValueChange={v => setValue('preferred_language', v)}>
                  <SelectTrigger aria-label="Language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map(l => (
                      <SelectItem key={l.code} value={l.code}>
                        {l.nativeLabel} ({l.label})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City / State */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="city">City <span className="text-slate-400">(optional)</span></Label>
                  <Input id="city" placeholder="Jaipur" {...register('city')} />
                </div>
                <div className="space-y-1.5">
                  <Label>State <span className="text-slate-400">(optional)</span></Label>
                  <Select onValueChange={v => setValue('state', v)}>
                    <SelectTrigger aria-label="State">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full" loading={isLoading}>
                {isLoading ? 'Creating account…' : 'Create Account'}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-700 font-medium hover:underline">Login here</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
