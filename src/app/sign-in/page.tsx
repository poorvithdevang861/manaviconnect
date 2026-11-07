"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  GraduationCap
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { signInSchema, otpVerifySchema } from "@/lib/validations";

export default function SignInPage() {
  const router = useRouter();
  const [step, setStep] = useState<"identifier" | "otp">("identifier");
  const [identifier, setIdentifier] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState("");

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const result = signInSchema.safeParse({ identifier });
    if (!result.success) {
      setError(result.error.errors[0]?.message || "Enter a valid email or 10-digit mobile number");
      return;
    }

    setError("");
    setStep("otp");
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const result = otpVerifySchema.safeParse({ identifier, code: otpCode });
    if (!result.success) {
      setError(result.error.errors[0]?.message || "Enter a valid 6-digit code");
      return;
    }

    setError("");
    router.push("/");
  };

  const handlePasswordSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#fafafa]">
      
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            M
          </div>
          <span className="font-semibold text-2xl tracking-tight text-zinc-900">
            MANAVI
          </span>
        </Link>
        <p className="text-xs text-zinc-500 mt-1 font-mono">
          Private Verified Navodaya Alumni Community
        </p>
      </div>

      <Card className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-white border border-zinc-200/80 rounded-xl shadow-xs">
        
        {step === "identifier" ? (
          <div>
            <div className="mb-5">
              <h1 className="text-lg font-semibold text-zinc-900">Sign In</h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                Enter your registered mobile number or alumni email.
              </p>
            </div>

            {!usePassword ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Email address or Mobile number
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. poorvith@alumni.in or 9845012345"
                    className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors placeholder:text-zinc-400"
                    autoFocus
                  />
                  {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  Send One-Time Code
                  <ArrowRight size={13} />
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUsePassword(true);
                      setError("");
                    }}
                    className="text-xs text-orange-600 hover:underline font-medium"
                  >
                    Use a password instead
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handlePasswordSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Email address or Mobile number
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="name@alumni.in or 9845012345"
                    className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                  {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-xs"
                >
                  Sign In with Password
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUsePassword(false);
                      setError("");
                    }}
                    className="text-xs text-orange-600 hover:underline font-medium"
                  >
                    Use one-time code (OTP) instead
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-5">
              <h1 className="text-lg font-semibold text-zinc-900">Enter Verification Code</h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                We sent a 6-digit code to <span className="font-semibold text-zinc-800">{identifier}</span>.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5 text-center">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full px-3 py-2 text-center text-xl tracking-widest font-mono bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  autoFocus
                />
                {error && <p className="text-xs text-red-600 mt-1 text-center">{error}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                Verify & Enter
                <ArrowRight size={13} />
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep("identifier");
                    setError("");
                  }}
                  className="text-zinc-500 hover:text-zinc-800"
                >
                  Change identifier
                </button>
                <button
                  type="button"
                  onClick={() => alert("New code dispatched via email/SMS.")}
                  className="text-orange-600 hover:underline font-medium"
                >
                  Resend code
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer Link to Join */}
        <div className="pt-4 border-t border-zinc-100 text-center text-xs text-zinc-500">
          Not yet registered as an alumni?{" "}
          <Link href="/join" className="text-orange-600 font-medium hover:underline">
            Request to Join
          </Link>
        </div>

      </Card>

    </div>
  );
}
