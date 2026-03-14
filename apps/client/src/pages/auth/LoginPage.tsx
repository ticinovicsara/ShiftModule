import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { Button, Input } from "../../components/ui";
import { DEFAULT_ROUTE_BY_ROLE, LABELS } from "../../constants";
import { AuthContext } from "../../context/AuthContext";

export function LoginPage() {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error("LoginPage must be used within AuthProvider");
  }

  const { login, role, isAuthenticated } = auth;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated && role) {
    return <Navigate to={DEFAULT_ROUTE_BY_ROLE[role]} replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login({ email, password });
    } catch {
      setError(LABELS.auth.invalidCredentials);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <h1 className="text-2xl font-bold text-slate-900 text-center">
        {LABELS.auth.title}
      </h1>
      <p className="text-md text-slate-500 text-center">
        {LABELS.auth.subtitle}
      </p>
      <Input
        label={LABELS.auth.email}
        leadingIcon={<span>@</span>}
        onChange={(event) => setEmail(event.target.value)}
        placeholder={LABELS.auth.email}
        value={email}
      />
      <Input
        label={LABELS.auth.password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder={LABELS.auth.password}
        type="password"
        value={password}
      />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button fullWidth loading={loading} type="submit">
        {LABELS.auth.signIn}
      </Button>
    </form>
  );
}
