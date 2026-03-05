"use client";

import { FormEvent, Suspense, useContext, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, MessageCircle } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToastVariant, toastWithTimeout } from "@/hooks/use-toast";
import { AuthService } from "@/services/api/auth-service";
import { AuthContext } from "../Context";
import { useLogin } from "@/app/LoginContext";

type AuthStep = "identifier" | "email-password" | "phone-otp" | "phone-details";

const COUNTRY_OPTIONS = [
  { label: "US", code: "+1" },
  { label: "UK", code: "+44" },
  { label: "Ireland", code: "+353" },
  { label: "France", code: "+33" },
  { label: "Germany", code: "+49" },
  { label: "Italy", code: "+39" },
  { label: "Spain", code: "+34" },
  { label: "Portugal", code: "+351" },
  { label: "Netherlands", code: "+31" },
  { label: "Belgium", code: "+32" },
  { label: "Luxembourg", code: "+352" },
  { label: "Switzerland", code: "+41" },
  { label: "Austria", code: "+43" },
  { label: "Sweden", code: "+46" },
  { label: "Norway", code: "+47" },
  { label: "Denmark", code: "+45" },
  { label: "Finland", code: "+358" },
  { label: "Iceland", code: "+354" },
  { label: "Greece", code: "+30" },
  { label: "Poland", code: "+48" },
  { label: "Czechia", code: "+420" },
  { label: "Slovakia", code: "+421" },
  { label: "Hungary", code: "+36" },
  { label: "Romania", code: "+40" },
  { label: "Bulgaria", code: "+359" },
  { label: "Croatia", code: "+385" },
  { label: "Slovenia", code: "+386" },
  { label: "Serbia", code: "+381" },
  { label: "Bosnia", code: "+387" },
  { label: "Montenegro", code: "+382" },
  { label: "Albania", code: "+355" },
  { label: "North Macedonia", code: "+389" },
  { label: "Lithuania", code: "+370" },
  { label: "Latvia", code: "+371" },
  { label: "Estonia", code: "+372" },
  { label: "Ukraine", code: "+380" },
  { label: "Moldova", code: "+373" },
  { label: "Belarus", code: "+375" },
  { label: "Russia", code: "+7" },
  { label: "Georgia", code: "+995" },
  { label: "Armenia", code: "+374" },
  { label: "Azerbaijan", code: "+994" },
  { label: "Turkey", code: "+90" },
  { label: "UAE", code: "+971" },
  { label: "Saudi Arabia", code: "+966" },
  { label: "Qatar", code: "+974" },
  { label: "Bahrain", code: "+973" },
  { label: "Kuwait", code: "+965" },
  { label: "Oman", code: "+968" },
  { label: "Jordan", code: "+962" },
  { label: "Lebanon", code: "+961" },
  { label: "Iraq", code: "+964" },
  { label: "Israel", code: "+972" },
  { label: "Palestine", code: "+970" },
  { label: "Egypt", code: "+20" },
  { label: "Iran", code: "+98" },
  { label: "Yemen", code: "+967" },
  { label: "Cyprus", code: "+357" },
  { label: "Malta", code: "+356" },
  { label: "Australia", code: "+61" },
  { label: "New Zealand", code: "+64" },
  { label: "South Africa", code: "+27" },
  { label: "IN", code: "+91" },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_DIGITS_REGEX = /^\d{7,15}$/;
const OTP_LENGTH = 4;

const panelTransition = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -14 },
  transition: { duration: 0.25, ease: "easeOut" as const },
};

function maskPhone(phone: string) {
  const cleaned = String(phone || "").replace(/\D/g, "");
  if (cleaned.length <= 4) return `+${cleaned}`;
  return `+${cleaned.slice(0, cleaned.length - 4)}${"*".repeat(4)}`;
}

function SignupPageContent() {
  const { formData, setFormData } = useContext(AuthContext);
  const [step, setStep] = useState<AuthStep>("identifier");
  const [isLoading, setIsLoading] = useState(false);

  const [identifierInput, setIdentifierInput] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("+91");

  const [emailForPassword, setEmailForPassword] = useState("");
  const [isExistingEmailUser, setIsExistingEmailUser] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [phoneForOtp, setPhoneForOtp] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [phoneVerificationToken, setPhoneVerificationToken] = useState("");
  const [phoneProfileName, setPhoneProfileName] = useState("");
  const [phoneProfileEmail, setPhoneProfileEmail] = useState("");
  const [isFinalizingPhoneProfile, setIsFinalizingPhoneProfile] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const { setIsLoggedIn } = useLogin();
  const nextPathParam = searchParams.get("next") || "/";
  const nextPath =
    nextPathParam.startsWith("/") && !nextPathParam.startsWith("//")
      ? nextPathParam
      : "/";

  const trimmedIdentifier = identifierInput.trim();
  const isEmailMode = trimmedIdentifier.includes("@");
  const phoneDigits = useMemo(
    () => trimmedIdentifier.replace(/\D/g, ""),
    [trimmedIdentifier]
  );
  const isPhoneMode = !isEmailMode && phoneDigits.length > 0;

  const otpValue = otpDigits.join("");

  const persistFormData = (updates: Record<string, string>) => {
    setFormData({
      ...formData,
      ...updates,
    });
  };

  const handleIdentifierChange = (value: string) => {
    if (value.includes("@")) {
      setIdentifierInput(value.toLowerCase());
      return;
    }
    setIdentifierInput(value.replace(/[^\d]/g, ""));
  };

  const buildPhoneFromInput = () => {
    const localDigits = phoneDigits.replace(/^0+/, "");
    if (!PHONE_DIGITS_REGEX.test(localDigits)) {
      return "";
    }
    return `${selectedCountryCode}${localDigits}`;
  };

  const handleIdentifierSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const authService = new AuthService();

    if (isEmailMode) {
      const emailValue = trimmedIdentifier.toLowerCase();
      if (!EMAIL_REGEX.test(emailValue)) {
        toastWithTimeout(ToastVariant.Default, "Please enter a valid email");
        return;
      }

      setIsLoading(true);
      try {
        const result = await authService.checkUserExists({ email: emailValue });
        setEmailForPassword(emailValue);
        setPasswordInput("");
        setShowPassword(false);
        setIsExistingEmailUser(result.exists);
        persistFormData({ email: emailValue, password: "" });
        setStep("email-password");
      } catch (error: any) {
        toastWithTimeout(ToastVariant.Default, error?.message || "Failed to check account");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const fullPhone = buildPhoneFromInput();
    if (!fullPhone) {
      toastWithTimeout(ToastVariant.Default, "Please enter a valid mobile number");
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.startDummyPhoneSignup(fullPhone);
      setPhoneForOtp(result.phone_number);
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      setPhoneVerificationToken("");
      setPhoneProfileName("");
      setPhoneProfileEmail("");
      persistFormData({ phoneNumber: result.phone_number });
      setStep("phone-otp");
      toastWithTimeout(ToastVariant.Default, "OTP sent on WhatsApp.");
      setTimeout(() => otpInputRefs.current[0]?.focus(), 50);
    } catch (error: any) {
      toastWithTimeout(ToastVariant.Default, error?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const password = String(passwordInput || "").trim();
    if (!password) {
      toastWithTimeout(ToastVariant.Default, "Please enter password");
      return;
    }

    if (!isExistingEmailUser && password.length < 8) {
      toastWithTimeout(ToastVariant.Default, "Password should be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      const authService = new AuthService();
      let customerId = "";

      if (isExistingEmailUser) {
        const signInData = await authService.signInWithEmailPassword(emailForPassword, password);
        const grandSession = await authService.createGrandSession({ email: emailForPassword });
        customerId = String(grandSession?.customer_id || signInData?.user?.id || "").trim();
      } else {
        const grandSession = await authService.createGrandSession({
          email: emailForPassword,
          password,
        });
        const signInData = await authService.signInWithEmailPassword(emailForPassword, password);
        customerId = String(grandSession?.customer_id || signInData?.user?.id || "").trim();
      }

      if (!customerId) {
        throw new Error("Customer ID missing from auth response");
      }

      await authService.upserBusinessCustomer({
        customerId,
      });

      persistFormData({ email: emailForPassword, password });
      setIsLoggedIn({ email: emailForPassword });
      router.push(nextPath);
      router.refresh();
      toastWithTimeout(
        ToastVariant.Default,
        isExistingEmailUser ? "Login successful." : "Signup successful."
      );
    } catch (error: any) {
      toastWithTimeout(
        ToastVariant.Default,
        error?.message || (isExistingEmailUser ? "Login failed" : "Signup failed")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);

    if (digit && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const digits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH)
      .split("");

    if (digits.length === 0) {
      return;
    }

    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < digits.length; i += 1) {
      next[i] = digits[i];
    }
    setOtpDigits(next);
    otpInputRefs.current[Math.min(digits.length, OTP_LENGTH) - 1]?.focus();
  };

  const finalizePhoneLogin = async (params: {
    verificationToken: string;
    email: string;
    name?: string;
    updateProfileMetadata?: boolean;
  }) => {
    const normalizedEmail = String(params.email || "").trim().toLowerCase();
    const normalizedName = String(params.name || "").trim();
    const shouldUpdateProfileMetadata = params.updateProfileMetadata === true;

    if (!phoneForOtp) {
      throw new Error("Phone number missing. Please try again.");
    }

    if (!normalizedEmail) {
      throw new Error("Email is required");
    }

    const authService = new AuthService();
    await authService.completeDummyPhoneOtp({
      phoneNumber: phoneForOtp,
      verificationToken: params.verificationToken,
      email: normalizedEmail,
    });

    const grandSession = await authService.createGrandSession({
      phone: phoneForOtp,
      email: normalizedEmail,
    });

    const customerId = String(grandSession?.customer_id || "").trim();
    if (!customerId) {
      throw new Error("Customer ID missing from session creation response");
    }

    if (shouldUpdateProfileMetadata && normalizedName) {
      await authService.updateUserMetadata({
        name: normalizedName,
        user_name: normalizedName,
        phone_number: phoneForOtp,
      });

      await authService.upserBusinessCustomer({
        customerId,
        name: normalizedName,
      });
    } else {
      await authService.upserBusinessCustomer({
        customerId,
      });
    }

    persistFormData({
      phoneNumber: phoneForOtp,
      email: normalizedEmail,
      ...(normalizedName ? { name: normalizedName } : {}),
    });

    setIsLoggedIn({ phone_number: phoneForOtp, email: normalizedEmail });
    router.push(nextPath);
    router.refresh();
  };

  const handleVerifyOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!phoneForOtp) {
      toastWithTimeout(ToastVariant.Default, "Phone number missing. Please try again.");
      setStep("identifier");
      return;
    }

    if (otpValue.length !== OTP_LENGTH) {
      toastWithTimeout(ToastVariant.Default, "Please enter the 4-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const authService = new AuthService();
      const verificationResult = await authService.verifyDummyPhoneOtp(phoneForOtp, otpValue);
      const verificationToken = String(verificationResult.verification_token || "").trim();
      const existingUserName = String(verificationResult.existing_user?.name || "").trim();
      const existingUserEmail = String(verificationResult.existing_user?.email || "").trim().toLowerCase();
      const fallbackName = String(formData.name || "").trim();
      const fallbackEmail = String(formData.email || "").trim().toLowerCase();

      setPhoneVerificationToken(verificationToken);
      setPhoneProfileName(existingUserName || fallbackName);
      setPhoneProfileEmail(existingUserEmail || fallbackEmail);

      const shouldAutoFinalize =
        Boolean(existingUserName && existingUserEmail) &&
        verificationResult.requires_profile_completion !== true;

      if (shouldAutoFinalize) {
        try {
          await finalizePhoneLogin({
            verificationToken,
            email: existingUserEmail,
            name: existingUserName,
            updateProfileMetadata: false,
          });
          toastWithTimeout(ToastVariant.Default, "Login successful.");
          return;
        } catch (autoFinalizeError) {
          console.warn("Automatic phone login finalization failed:", autoFinalizeError);
          setStep("phone-details");
          toastWithTimeout(
            ToastVariant.Default,
            "OTP verified. Please confirm your name and email to continue."
          );
          return;
        }
      }

      setStep("phone-details");
      toastWithTimeout(ToastVariant.Default, "OTP verified. Please add your name and email.");
    } catch (error: any) {
      toastWithTimeout(ToastVariant.Default, error?.message || "Unable to verify OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompletePhoneProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const normalizedName = String(phoneProfileName || "").trim();
    const normalizedEmail = String(phoneProfileEmail || "").trim().toLowerCase();

    if (!phoneForOtp || !phoneVerificationToken) {
      toastWithTimeout(ToastVariant.Default, "Phone verification expired. Please verify OTP again.");
      setStep("identifier");
      return;
    }

    if (!normalizedName) {
      toastWithTimeout(ToastVariant.Default, "Please enter your name");
      return;
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      toastWithTimeout(ToastVariant.Default, "Please enter a valid email");
      return;
    }

    setIsFinalizingPhoneProfile(true);
    try {
      await finalizePhoneLogin({
        verificationToken: phoneVerificationToken,
        email: normalizedEmail,
        name: normalizedName,
        updateProfileMetadata: true,
      });
      toastWithTimeout(ToastVariant.Default, "Login successful.");
    } catch (error: any) {
      toastWithTimeout(ToastVariant.Default, error?.message || "Unable to complete signup.");
    } finally {
      setIsFinalizingPhoneProfile(false);
    }
  };

  const handleResendOtp = async () => {
    if (!phoneForOtp) {
      return;
    }
    setIsLoading(true);
    try {
      const authService = new AuthService();
      const result = await authService.startDummyPhoneSignup(phoneForOtp);
      setPhoneForOtp(result.phone_number);
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      setPhoneVerificationToken("");
      toastWithTimeout(ToastVariant.Default, "OTP resent on WhatsApp.");
      setTimeout(() => otpInputRefs.current[0]?.focus(), 50);
    } catch (error: any) {
      toastWithTimeout(ToastVariant.Default, error?.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await new AuthService().signInWithGoogle(nextPath);
    } catch (error: any) {
      toastWithTimeout(ToastVariant.Default, error?.message || "Failed to sign in with Google.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_bottom,_#f8dede_0,_#f4f4f5_55%,_#f8fafc_100%)] px-4 py-10">
      <div className="w-full max-w-[420px] border border-slate-200 bg-white p-6 shadow-[0_12px_34px_rgba(15,23,42,0.08)] sm:p-8">
        <Image
          src="/navbar/navbarlogo4.png"
          alt="Buy and Trust"
          width={94}
          height={72}
          className="h-auto w-[94px]"
          priority
        />

        <AnimatePresence mode="wait">
          {step === "identifier" ? (
            <motion.div key="identifier" {...panelTransition} className="mt-6">
              <form onSubmit={handleIdentifierSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email or Mobile number</label>
                  <div className="relative">
                    <Input
                      value={identifierInput}
                      onChange={(e) => handleIdentifierChange(e.target.value)}
                      placeholder=""
                      autoComplete="username"
                      inputMode={isPhoneMode ? "numeric" : "text"}
                      className={`h-12 rounded-none border-slate-300 ${
                        isPhoneMode ? "pr-28" : ""
                      }`}
                      disabled={isLoading}
                    />
                    {isPhoneMode ? (
                      <div className="absolute inset-y-0 right-2 flex items-center">
                        <Select
                          value={selectedCountryCode}
                          onValueChange={setSelectedCountryCode}
                          disabled={isLoading}
                        >
                          <SelectTrigger
                            className="h-8 w-[90px] rounded-none border-0 bg-transparent px-1 text-base font-semibold text-slate-700 shadow-none ring-0 focus:ring-0 focus:ring-offset-0"
                            disabled={isLoading}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent align="end" className="rounded-none">
                            {COUNTRY_OPTIONS.map((option) => (
                              <SelectItem key={option.code} value={option.code}>
                                {option.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : null}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 w-full rounded-none bg-[#F58A32] text-base font-medium text-white hover:bg-[#e67d27]"
                >
                  {isLoading ? "PLEASE WAIT..." : "SIGN IN"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>

              <AnimatePresence>
                {isPhoneMode ? (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="mt-5 flex items-center gap-2 text-[15px] text-slate-700"
                  > 
                   <img src="/logos_whatsapp-icon.png" alt="" />
                    <span>OTP will be sent to your WhatsApp number</span>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-sm text-slate-500">or</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <Button
                type="button"
                variant="outline"
                className="h-12 w-full rounded-none border-slate-300 bg-white text-base font-normal text-slate-700 hover:bg-slate-50"
                disabled={isLoading}
                onClick={handleGoogleSignIn}
              >
                <Image src="/signup/Google.svg" alt="Google" width={18} height={18} className="mr-3 h-[18px] w-[18px]" />
                Login with Google
              </Button>
            </motion.div>
          ) : null}

          {step === "email-password" ? (
            <motion.div key="email-password" {...panelTransition} className="mt-6">
              <h2 className="text-center text-[34px] font-semibold leading-none tracking-[-0.03em] text-slate-800">
                {isExistingEmailUser ? "Enter password" : "Create a password"}
              </h2>
              <p className="mt-2 text-center text-sm text-slate-500">{emailForPassword}</p>

              <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-5">
                <div className="space-y-2">
                  <label htmlFor="password-auth" className="text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password-auth"
                      type={showPassword ? "text" : "password"}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      autoComplete={isExistingEmailUser ? "current-password" : "new-password"}
                      placeholder={isExistingEmailUser ? "Enter your password" : "8+ characters"}
                      className="h-12 rounded-none border-slate-300 pr-11"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 w-full rounded-none bg-[#F58A32] text-base font-medium text-white hover:bg-[#e67d27]"
                >
                  {isLoading ? "PLEASE WAIT..." : "PROCEED"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>

              <button
                type="button"
                className="mt-4 text-sm text-slate-600 underline underline-offset-4"
                onClick={() => {
                  setStep("identifier");
                  setPasswordInput("");
                  setShowPassword(false);
                }}
                disabled={isLoading}
              >
                Use a different email or mobile number
              </button>
            </motion.div>
          ) : null}

          {step === "phone-otp" ? (
            <motion.div key="phone-otp" {...panelTransition} className="mt-6">
              <div className="flex items-start gap-3  font-semibold leading-tight tracking-[-0.03em] text-slate-800">
                <img src="/logos_whatsapp-icon.png" alt="" className="mt-1 h-[22px] w-[22px]" />
                <h2 className=" font-semibold leading-tight tracking-[-0.03em]">
                  We&apos;ve sent a 4-digit verification code to your WhatsApp number ({maskPhone(phoneForOtp)}).
                </h2>
              </div>

              <form onSubmit={handleVerifyOtp} className="mt-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Verification Code</span>
                    <button
                      type="button"
                      className="text-sm font-medium text-sky-500 hover:text-sky-600"
                      disabled={isLoading}
                      onClick={handleResendOtp}
                    >
                      Resend Code
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {otpDigits.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(element) => {
                          otpInputRefs.current[index] = element;
                        }}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={handleOtpPaste}
                        className="h-14 rounded-none border-slate-300 text-center text-2xl font-semibold tracking-[0.18em]"
                        inputMode="numeric"
                        maxLength={1}
                        autoComplete={index === 0 ? "one-time-code" : "off"}
                        disabled={isLoading}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 w-full rounded-none bg-[#F58A32] text-base font-medium text-white hover:bg-[#e67d27]"
                >
                  {isLoading ? "VERIFYING..." : "VERIFY ME"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>

              <button
                type="button"
                className="mt-4 text-sm text-slate-600 underline underline-offset-4"
                onClick={() => {
                  setStep("identifier");
                  setOtpDigits(Array(OTP_LENGTH).fill(""));
                  setPhoneForOtp("");
                  setPhoneVerificationToken("");
                  setPhoneProfileName("");
                  setPhoneProfileEmail("");
                }}
                disabled={isLoading}
              >
                Use a different number
              </button>
            </motion.div>
          ) : null}

          {step === "phone-details" ? (
            <motion.div key="phone-details" {...panelTransition} className="mt-6">
              <h2 className="text-center text-[34px] font-semibold leading-none tracking-[-0.03em] text-slate-800">
                Complete Profile
              </h2>
              <p className="mt-2 text-center text-sm text-slate-500">
                Add your name and email to continue
              </p>

              <form onSubmit={handleCompletePhoneProfile} className="mt-6 space-y-5">
                <div className="space-y-2">
                  <label htmlFor="phone-profile-name" className="text-sm font-medium text-slate-700">
                    Full Name
                  </label>
                  <Input
                    id="phone-profile-name"
                    type="text"
                    value={phoneProfileName}
                    onChange={(e) => setPhoneProfileName(e.target.value)}
                    className="h-12 rounded-none border-slate-300"
                    disabled={isFinalizingPhoneProfile}
                    autoComplete="name"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone-profile-email" className="text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <Input
                    id="phone-profile-email"
                    type="email"
                    value={phoneProfileEmail}
                    onChange={(e) => setPhoneProfileEmail(e.target.value)}
                    className="h-12 rounded-none border-slate-300"
                    disabled={isFinalizingPhoneProfile}
                    autoComplete="email"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isFinalizingPhoneProfile}
                  className="h-12 w-full rounded-none bg-[#F58A32] text-base font-medium text-white hover:bg-[#e67d27]"
                >
                  {isFinalizingPhoneProfile ? "PLEASE WAIT..." : "CONTINUE"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>

              <button
                type="button"
                className="mt-4 text-sm text-slate-600 underline underline-offset-4"
                onClick={() => {
                  setStep("identifier");
                  setOtpDigits(Array(OTP_LENGTH).fill(""));
                  setPhoneForOtp("");
                  setPhoneVerificationToken("");
                  setPhoneProfileName("");
                  setPhoneProfileEmail("");
                }}
                disabled={isFinalizingPhoneProfile}
              >
                Use a different number
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <SignupPageContent />
    </Suspense>
  );
}
