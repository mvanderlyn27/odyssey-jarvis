import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PublicHeader from "@/components/layout/PublicHeader";
import { Label } from "@/components/ui/label";
import SocialAuth from "@/features/auth/components/SocialAuth";
import { useSession } from "@/features/auth/hooks/useSession";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { toast } from "sonner";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { data: session } = useSession();
  const { mutate: login, isPending, error } = useLogin();

  useEffect(() => {
    if (session) {
      navigate("/app/home");
    }
  }, [session, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(
      { email, password },
      {
        onError: (err) => {
          toast.error(err.message);
        },
      }
    );
  };

  return (
    <div className="bg-background text-foreground">
      <PublicHeader showNavLinks={false} />
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-background">
        <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center">Login to Jarvis</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Logging in..." : "Login"}
            </Button>
            {error && <p className="text-red-500 text-sm text-center">{error.message}</p>}
            <div className="text-center">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot Password?
              </Link>
            </div>
          </form>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <SocialAuth type="signIn" />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
