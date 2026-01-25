import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Mail, Lock, ArrowRight } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Card } from '@/app/components/ui/card';

export function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle sign in logic here
    console.log('Sign in:', { email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-[#3A6FF8] shadow-sm shadow-blue-500/20">
            <BarChart3 className="size-6 text-white" />
          </div>
          <span className="text-2xl text-zinc-100">QuantPulse India</span>
        </Link>

        <Card className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl text-zinc-100 mb-2">Welcome Back</h1>
            <p className="text-zinc-400">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-zinc-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-zinc-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="size-4 rounded border-[rgba(100,150,255,0.2)] bg-[rgba(15,23,42,0.6)] text-[#3A6FF8]"
                />
                <span className="text-sm text-zinc-400">Remember me</span>
              </label>
              <Link to="#" className="text-sm text-[#5B8DFF] hover:text-[#7AA3FF]">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
            >
              Sign In
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[rgba(100,150,255,0.1)]">
            <p className="text-center text-sm text-zinc-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#5B8DFF] hover:text-[#7AA3FF]">
                Sign up
              </Link>
            </p>
          </div>
        </Card>

        <p className="text-center text-xs text-zinc-500 mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
