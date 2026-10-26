'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { profileSchema, type ProfileFormData } from '@/lib/validations';
import { SUPPORTED_LANGUAGES, INDIAN_STATES } from '@/lib/constants';
import type { Language } from '@/types';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Globe,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Sparkles,
  Building,
} from 'lucide-react';

export function ProfilePage() {
  const { user, updateProfile, isLoading: isAuthLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name ?? '',
      phone: user?.phone ?? '',
      preferred_language: user?.preferred_language ?? 'en',
      city: user?.city ?? '',
      state: user?.state ?? '',
    },
  });

  // Re-sync form fields whenever user state is loaded or updated
  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name || '',
        phone: user.phone || '',
        preferred_language: user.preferred_language || 'en',
        city: user.city || '',
        state: user.state || '',
      });
    }
  }, [user, reset]);

  const selectedLanguage = watch('preferred_language') || user?.preferred_language || 'en';
  const selectedState = watch('state') || user?.state || '';

  async function onSubmit(data: ProfileFormData) {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSavedSuccess(false);

    try {
      const res = await updateProfile({
        full_name: data.full_name,
        phone: data.phone || undefined,
        preferred_language: data.preferred_language as Language,
        city: data.city || undefined,
        state: data.state || undefined,
      });

      if (res.success && res.user) {
        setSavedSuccess(true);
        reset({
          full_name: res.user.full_name || '',
          phone: res.user.phone || '',
          preferred_language: res.user.preferred_language || 'en',
          city: res.user.city || '',
          state: res.user.state || '',
        });
        setTimeout(() => setSavedSuccess(false), 5000);
      } else {
        setErrorMessage(res.error || 'Failed to update profile.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  // If user is not authenticated and auth is not loading
  if (!user && !isAuthLoading) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-200">
            <UserIcon className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Sign in Required</h2>
          <p className="text-sm text-slate-500 mb-6">Please log in to your JanDrishti account to view and update your profile.</p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm">
            <Link href="/login">Go to Login</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  // Get initials for avatar
  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'JD';

  const roleLabel =
    user?.role === 'SUPER_ADMIN'
      ? 'Super Administrator'
      : user?.role === 'AUTHORITY'
      ? 'Municipal Authority'
      : 'Verified Citizen';

  const roleBadgeColor =
    user?.role === 'SUPER_ADMIN'
      ? 'bg-purple-50 text-purple-700 border-purple-200'
      : user?.role === 'AUTHORITY'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back navigation & Page Title */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-9 w-9 p-0 rounded-xl border-slate-200 hover:bg-slate-50"
            >
              <Link href={user?.role === 'AUTHORITY' || user?.role === 'SUPER_ADMIN' ? '/admin/dashboard' : '/dashboard'}>
                <ArrowLeft className="h-4 w-4 text-slate-600" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Profile &amp; Settings</h1>
              <p className="text-xs text-slate-500">Manage your JanDrishti civic account, regional details, and preferences</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${roleBadgeColor}`}>
              <ShieldCheck className="h-3.5 w-3.5" />
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Profile Header Hero Card */}
        <div className="mb-6 p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-2xl flex items-center justify-center shadow-lg ring-4 ring-white/10 shrink-0">
              {initials}
            </div>
            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-bold">{user?.full_name || 'JanDrishti User'}</h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-white/10 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-blue-200 border border-white/10">
                  <Sparkles className="h-3 w-3 text-amber-300" /> Verified Account
                </span>
              </div>
              <p className="text-sm text-slate-300 flex items-center justify-center sm:justify-start gap-2">
                <Mail className="h-3.5 w-3.5 text-blue-300" />
                {user?.email}
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
                {user?.city && (
                  <span className="flex items-center gap-1 text-slate-300">
                    <MapPin className="h-3.5 w-3.5 text-rose-400" />
                    {user.city}{user.state ? `, ${user.state}` : ''}
                  </span>
                )}
                <span className="flex items-center gap-1 text-slate-300">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Active Citizen
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Messages */}
        {savedSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 animate-in fade-in duration-200 shadow-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold">Profile updated successfully!</p>
              <p className="text-emerald-700 text-xs">Your changes have been saved to the JanDrishti database and your session has been synchronized.</p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-3 animate-in fade-in duration-200 shadow-sm">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold">Failed to update profile</p>
              <p className="text-red-700 text-xs">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Editable Personal Details Form */}
          <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/60 border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-blue-600" />
                    Personal &amp; Contact Details
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Update your display name, regional location, and notification preferences
                  </CardDescription>
                </div>
                {isDirty && (
                  <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                    Unsaved Changes
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="full_name" className="text-xs font-semibold text-slate-700">
                    Full Name <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="full_name"
                      placeholder="e.g. Priya Sharma"
                      className="pl-10 h-10 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
                      {...register('full_name')}
                      aria-invalid={!!errors.full_name}
                    />
                  </div>
                  {errors.full_name && (
                    <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" /> {errors.full_name.message}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">
                    Indian Mobile Number
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-500">
                      +91
                    </span>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="9876543210"
                      className="pl-12 h-10 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
                      {...register('phone')}
                      aria-invalid={!!errors.phone}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">Used for SMS updates regarding status changes on reported civic issues</p>
                  {errors.phone && (
                    <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" /> {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Preferred Language */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                    Preferred Language
                  </Label>
                  <Select
                    value={selectedLanguage}
                    onValueChange={(val) => setValue('preferred_language', val, { shouldDirty: true })}
                  >
                    <SelectTrigger className="h-10 rounded-xl border-slate-200 text-sm">
                      <SelectValue placeholder="Choose language" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LANGUAGES.map((l) => (
                        <SelectItem key={l.code} value={l.code} className="text-sm">
                          {l.nativeLabel} ({l.label})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-slate-400">AI summaries and citizen notifications will be translated to this language</p>
                </div>

                {/* City & State Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-slate-400" />
                      City / Municipal Area
                    </Label>
                    <Input
                      id="city"
                      placeholder="e.g. Pune, Jaipur, Lucknow"
                      className="h-10 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
                      {...register('city')}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      State / UT
                    </Label>
                    <Select
                      value={selectedState}
                      onValueChange={(val) => setValue('state', val, { shouldDirty: true })}
                    >
                      <SelectTrigger className="h-10 rounded-xl border-slate-200 text-sm">
                        <SelectValue placeholder="Select Indian State" />
                      </SelectTrigger>
                      <SelectContent className="max-h-56">
                        {INDIAN_STATES.map((s) => (
                          <SelectItem key={s} value={s} className="text-sm">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!isDirty || isSubmitting}
                    onClick={() => {
                      if (user) {
                        reset({
                          full_name: user.full_name || '',
                          phone: user.phone || '',
                          preferred_language: user.preferred_language || 'en',
                          city: user.city || '',
                          state: user.state || '',
                        });
                      }
                    }}
                    className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold h-10 px-4"
                  >
                    Discard Changes
                  </Button>

                  <Button
                    type="submit"
                    disabled={!isDirty || isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs h-10 px-6 shadow-sm transition-all flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving to Database...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Account Security & Non-Editable Information */}
          <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/60 border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Account Security &amp; Credentials
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                System identity and security parameters linked to your government/civic account
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-xl gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Registered Email Address</p>
                    <p className="text-sm font-bold text-slate-800 font-mono">{user?.email}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-white px-2.5 py-1 rounded-md border border-slate-200 self-start sm:self-auto">
                  Primary Identity
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-xl gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Civic Role</p>
                    <p className="text-sm font-bold text-slate-800">{roleLabel}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-white px-2.5 py-1 rounded-md border border-slate-200 self-start sm:self-auto">
                  {user?.role}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
