import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Spinner } from '../../../components/ui/Spinner';
import { KlyroLogo } from '../../../components/brand/KlyroLogo';
import { useAuthStore } from '../../../stores/authStore';
import { ApiError, login } from '../api/auth.api';
import { loginSchema, type LoginInput } from '../schemas/auth.schema';

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      toast.success(
        data.user.name ? `Selamat datang kembali, ${data.user.name}!` : 'Berhasil masuk!',
      );
      navigate('/dashboard', { replace: true });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        for (const field of error.fieldErrors) {
          if (field.field === 'email' || field.field === 'password') {
            setError(field.field, { message: field.message });
          }
        }
        toast.error(error.message);
        return;
      }
      toast.error('Gagal masuk. Periksa email dan password kamu.');
    },
  });

  const onSubmit = (values: LoginInput) => mutation.mutate(values);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cloud p-4 sm:p-6">
      <div className="w-full max-w-md rounded-[24px] border border-mist bg-snow p-6 shadow-[var(--shadow-xl)] sm:p-8">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <KlyroLogo height={36} />
          <h1 className="text-heading-sm font-medium text-ink">Welcome back</h1>
          <p className="text-body-sm text-slate">Sign in to continue to your Klyro workspace.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            label="Email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            label="Password"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" size="lg" fullWidth isLoading={mutation.isPending}>
            {mutation.isPending ? <Spinner size="sm" /> : null}
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-body-sm text-slate">
          No account yet?{' '}
          <Link to="/register" className="font-medium text-monday-violet hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
