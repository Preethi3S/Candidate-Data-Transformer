import { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowRight, BriefcaseBusiness, DatabaseZap, LockKeyhole, ShieldCheck } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export function AuthPage() {
  const [mode, setMode] = useState("signin");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { name: "", email: "", password: "" }
  });

  const isSignup = mode === "signup";

  async function onSubmit(values) {
    setSubmitting(true);
    setError("");
    try {
      if (isSignup) {
        await signUp(values);
      } else {
        await signIn({ email: values.email, password: values.password });
      }
    } catch (requestError) {
      const firstValidation = requestError.response?.data?.errors?.[0]?.message;
      setError(firstValidation || requestError.response?.data?.error || requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
    reset({ name: "", email: "", password: "" });
  }

  return (
    <main className="min-h-screen bg-field">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <section className="flex flex-col justify-between rounded-lg border border-ink/10 bg-ink p-6 text-white shadow-panel lg:p-8">
          <div>
            <div className="mb-10 inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold">
              <DatabaseZap className="h-4 w-4 text-coral" />
              Candidate Intelligence Platform
            </div>
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
              Sign in to transform messy candidate data into trusted profiles.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/70">
              Upload recruiter exports and resumes, inspect provenance, resolve conflicts, and project profiles into any downstream schema.
            </p>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-3">
            <Feature icon={BriefcaseBusiness} title="Recruiter-ready" text="Focused workflows for ingestion, review, and handoff." />
            <Feature icon={ShieldCheck} title="Explainable" text="Every field carries source, method, and confidence." />
            <Feature icon={LockKeyhole} title="Private" text="Sessions protect the working dashboard and APIs." />
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-md rounded-lg border border-ink/10 bg-white p-5 shadow-panel sm:p-6">
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-coral">
                {isSignup ? "Create account" : "Welcome back"}
              </p>
              <h2 className="mt-1 text-2xl font-semibold">{isSignup ? "Start a secure workspace" : "Sign in to your workspace"}</h2>
            </div>

            <div className="mb-5 grid grid-cols-2 rounded-md bg-field p-1">
              <button
                className={`rounded-md px-3 py-2 text-sm font-semibold transition ${!isSignup ? "bg-white text-ink shadow-sm" : "text-ink/60"}`}
                type="button"
                onClick={() => switchMode("signin")}
              >
                Sign in
              </button>
              <button
                className={`rounded-md px-3 py-2 text-sm font-semibold transition ${isSignup ? "bg-white text-ink shadow-sm" : "text-ink/60"}`}
                type="button"
                onClick={() => switchMode("signup")}
              >
                Sign up
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {isSignup && (
                <Field label="Name" type="text" autoComplete="name" registration={register("name", { required: isSignup })} />
              )}
              <Field label="Email" type="email" autoComplete="email" registration={register("email", { required: true })} />
              <Field label="Password" type="password" autoComplete={isSignup ? "new-password" : "current-password"} registration={register("password", { required: true })} />

              {error && (
                <div className="rounded-md border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-ink">
                  {error}
                </div>
              )}

              <button
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-steel disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Please wait" : isSignup ? "Create account" : "Sign in"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

function Feature({ icon: Icon, title, text }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <Icon className="mb-3 h-5 w-5 text-coral" />
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-white/60">{text}</p>
    </div>
  );
}

function Field({ label, type, autoComplete, registration }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-ink/70">{label}</span>
      <input
        className="min-h-11 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20"
        type={type}
        autoComplete={autoComplete}
        {...registration}
      />
    </label>
  );
}
