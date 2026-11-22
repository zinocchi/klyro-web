import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { BellRing } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { ApiError } from '../../../lib/api';
import { formatIDR } from '../../../lib/utils';
import { useAuthStore } from '../../../stores/authStore';
import { updateMe, updatePassword } from '../../auth/api/auth.api';
import {
  passwordSchema,
  profileSchema,
  type PasswordFormValues,
  type ProfileFormValues,
} from '../schemas/settings.schema';

export function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header>
        <h1 className="break-words text-heading-sm font-medium text-ink">{t('settings.title')}</h1>
        <p className="mt-1 text-body-sm text-slate">{t('settings.subtitle')}</p>
      </header>

      <ProfileCard />
      <PasswordCard />
    </div>
  );
}

/** Schema errors carry i18n keys; API errors arrive ready to display. */
function useFieldError() {
  const { t } = useTranslation();
  return (message?: string) =>
    !message ? undefined : message.startsWith('validation.') ? t(message) : message;
}

function ProfileCard() {
  const { t, i18n } = useTranslation();
  const translateError = useFieldError();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      monthly_budget: user?.monthly_budget != null ? String(user.monthly_budget) : '',
      daily_reminder_time: user?.daily_reminder_time ?? '',
      language: user?.language ?? 'id',
    },
  });

  const budget = useWatch({ control, name: 'monthly_budget' });

  const onSubmit = async (values: ProfileFormValues) => {
    setPending(true);
    try {
      const data = await updateMe({
        name: values.name,
        monthly_budget: values.monthly_budget === '' ? null : Number(values.monthly_budget),
        daily_reminder_time: values.daily_reminder_time === '' ? null : values.daily_reminder_time,
        language: values.language,
      });
      setUser(data.user);
      if (data.user.language !== i18n.language) void i18n.changeLanguage(data.user.language);
      toast.success(t('settings.profile.saved'));
    } catch (error) {
      if (error instanceof ApiError) {
        for (const field of error.fieldErrors) {
          if (field.field in values) {
            setError(field.field as keyof ProfileFormValues, { message: field.message });
          }
        }
        toast.error(error.message);
      } else {
        toast.error(t('common.genericError'));
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <h2 className="text-subheading font-medium text-ink">{t('settings.profile.title')}</h2>
        <p className="mt-1 text-body-sm text-slate">{t('settings.profile.description')}</p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <Input
            label={t('settings.profile.name')}
            placeholder={t('settings.profile.namePlaceholder')}
            autoComplete="name"
            error={translateError(errors.name?.message)}
            {...register('name')}
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Input
                label={t('settings.profile.budget')}
                placeholder={t('settings.profile.budgetPlaceholder')}
                inputMode="numeric"
                error={translateError(errors.monthly_budget?.message)}
                {...register('monthly_budget')}
              />
              <p className="text-caption text-iron">
                {/^\d+$/.test(budget)
                  ? formatIDR(Number(budget))
                  : t('settings.profile.budgetHint')}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <Input
                label={t('settings.profile.reminderTime')}
                type="time"
                error={translateError(errors.daily_reminder_time?.message)}
                {...register('daily_reminder_time')}
              />
              <p className="text-caption text-iron">{t('settings.profile.reminderTimeHint')}</p>
            </div>
          </div>

          <Select
            label={t('settings.profile.languageLabel')}
            error={translateError(errors.language?.message)}
            {...register('language')}
          >
            <option value="id">{t('settings.profile.languageId')}</option>
            <option value="en">{t('settings.profile.languageEn')}</option>
          </Select>

          <BrowserNotifications />

          <div className="flex justify-end">
            <Button type="submit" isLoading={pending} className="w-full sm:w-auto">
              {pending ? t('common.saving') : t('settings.profile.save')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function BrowserNotifications() {
  const { t } = useTranslation();
  const supported = typeof Notification !== 'undefined';
  const [permission, setPermission] = useState<NotificationPermission | null>(
    supported ? Notification.permission : null,
  );

  const request = async () => {
    if (!supported) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') toast.success(t('settings.profile.notifications.granted'));
    else if (result === 'denied') toast.error(t('settings.profile.notifications.denied'));
  };

  const status = !supported
    ? t('settings.profile.notifications.unsupported')
    : permission === 'granted'
      ? t('settings.profile.notifications.enabled')
      : permission === 'denied'
        ? t('settings.profile.notifications.blocked')
        : t('settings.profile.notifications.notEnabled');

  return (
    <div className="flex flex-col gap-3 rounded-[6px] border border-pebble p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-body-sm font-medium text-ink">
          {t('settings.profile.notifications.title')}
        </p>
        <p className="mt-1 text-caption text-iron">{status}</p>
      </div>
      <Button
        type="button"
        variant="secondary"
        onClick={request}
        disabled={!supported || permission === 'granted' || permission === 'denied'}
        className="w-full sm:w-auto"
      >
        <BellRing size={16} />
        {permission === 'granted'
          ? t('settings.profile.notifications.enabled')
          : t('settings.profile.notifications.enable')}
      </Button>
    </div>
  );
}

function PasswordCard() {
  const { t } = useTranslation();
  const translateError = useFieldError();
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: '', new_password: '' },
  });

  const onSubmit = async (values: PasswordFormValues) => {
    setPending(true);
    try {
      await updatePassword(values);
      reset();
      toast.success(t('settings.password.saved'));
    } catch (error) {
      if (error instanceof ApiError) {
        // 401 "Current password is incorrect" carries no field list — pin it to the field.
        const fields = error.fieldErrors.length
          ? error.fieldErrors
          : [{ field: 'current_password', message: error.message }];
        for (const field of fields) {
          if (field.field in values) {
            setError(field.field as keyof PasswordFormValues, { message: field.message });
          }
        }
        toast.error(error.message);
      } else {
        toast.error(t('common.genericError'));
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <h2 className="text-subheading font-medium text-ink">{t('settings.password.title')}</h2>
        <p className="mt-1 text-body-sm text-slate">{t('settings.password.description')}</p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <Input
            label={t('settings.password.current')}
            type="password"
            autoComplete="current-password"
            error={translateError(errors.current_password?.message)}
            {...register('current_password')}
          />

          <div className="flex flex-col gap-1">
            <Input
              label={t('settings.password.new')}
              type="password"
              autoComplete="new-password"
              error={translateError(errors.new_password?.message)}
              {...register('new_password')}
            />
            <p className="text-caption text-iron">{t('settings.password.newHint')}</p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" isLoading={pending} className="w-full sm:w-auto">
              {pending ? t('common.saving') : t('settings.password.save')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
