'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/useToast';
import { profileSchema, type ProfileFormData } from '@/lib/validations';
import { SUPPORTED_LANGUAGES, INDIAN_STATES } from '@/lib/constants';
import { User, Mail, Phone, MapPin } from 'lucide-react';

export function ProfilePage() {
  const { user } = useAuthStore();
  const toast = useToast();

  const { register, handleSubmit, setValue, formState: { errors, isDirty } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name ?? '',
      phone: user?.phone ?? '',
      preferred_language: user?.preferred_language ?? 'en',
      city: user?.city ?? '',
      state: user?.state ?? '',
    },
  });

  function onSubmit(data: ProfileFormData) {
    // In production this calls the API; for demo show success toast
    console.log('Profile update:', data);
    toast.success('Profile updated', 'Your changes have been saved.');
  }

  if (!user) return null;

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">My Profile</h1>

        <div className="space-y-6">
          {/* Account info (read-only) */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4 text-blue-600" /> Account Information</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-md">
                <Mail className="h-4 w-4 text-slate-400" />
                <div><p className="text-xs text-slate-400">Email (cannot be changed)</p><p className="font-medium text-slate-700">{user.email}</p></div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-md">
                <User className="h-4 w-4 text-slate-400" />
                <div><p className="text-xs text-slate-400">Role</p><p className="font-medium text-slate-700">{user.role}</p></div>
              </div>
            </CardContent>
          </Card>

          {/* Editable profile */}
          <Card>
            <CardHeader><CardTitle className="text-base">Personal Details</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input id="full_name" {...register('full_name')} aria-invalid={!!errors.full_name} />
                  {errors.full_name && <p className="text-xs text-red-600">{errors.full_name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone"><Phone className="inline h-3.5 w-3.5 mr-1 text-slate-400" />Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="9876543210" {...register('phone')} aria-invalid={!!errors.phone} />
                  {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label>Preferred Language</Label>
                  <Select defaultValue={user.preferred_language} onValueChange={v => setValue('preferred_language', v, { shouldDirty: true })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LANGUAGES.map(l => <SelectItem key={l.code} value={l.code}>{l.nativeLabel} ({l.label})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="city"><MapPin className="inline h-3.5 w-3.5 mr-1 text-slate-400" />City</Label>
                    <Input id="city" {...register('city')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>State</Label>
                    <Select defaultValue={user.state ?? ''} onValueChange={v => setValue('state', v, { shouldDirty: true })}>
                      <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" disabled={!isDirty}>Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
