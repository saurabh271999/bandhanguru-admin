"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, ChangeEvent, FormEvent } from "react";
import { storeUserData } from "../../utils/CheckLoggedin";
import { apiBaseUrl, apiUrls } from "../../apis";
import usePostQuery from "../../hooks/postQuery.hook.js";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    emailId: "",
    password: "",
  });

  // Inside your component:
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  // Use the postQuery hook for API calls
  const { postQuery, loading } = usePostQuery();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    postQuery({
      url: `${apiBaseUrl}${apiUrls.login}`,
      postData: formData,
      onSuccess: (response: any) => {
        // Check for both possible success indicators
        if (response?.status === "success" || response?.success) {
          const { token, user } = response.data;
          // Store user data with permissions
          storeUserData(user, token);
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            try {
              router.push("/dashboard");
            } catch (redirectError) {
              console.error("Redirect error:", redirectError);
              // Fallback: try window.location
              window.location.href = "/dashboard";
            }
          }, 1000);
        } else {
          setError(response?.message || "Login failed");
        }
      },
      onFail: (err: any) => {
        setError(
          err?.data?.message ||
            err?.message ||
            "Login failed. Please check your credentials."
        );
      },
    });
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--brand-surface)] via-white to-[var(--brand-surface)] login-page-container">
      {/* Clean brand background - no image */}

      {/* Login Card */}
      <div className="z-[1000] flex flex-col items-center justify-center shadow-xl bg-white rounded-2xl w-full max-w-[665px] p-8 m-4 relative">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-2">
          <div className="flex items-center mb-2">
            <Image
              src="/images/logo-1.png"
              alt="Bandhan Guru Logo"
              width={200}
              height={200}
            />
          </div>
        </div>

        {/* Heading */}
        <h2 className="font-semibold text-2xl text-[#1C1B1B] text-center mb-2">
          Access Your Account
        </h2>
        <p className="text-center text-[#8E8E93] mb-8">
          Welcome back, Admin! Log in to manage the BandhanGuru & Users.
        </p>

        {/* Error Message */}
        {error && (
          <div className="w-full max-w-[450px] mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          className="flex flex-col gap-6 w-full items-center"
          onSubmit={handleSubmit}
        >
          {/* emailId Input */}
          <div className="flex flex-col gap-2 items-start w-full max-w-[450px]">
            <label
              htmlFor="emailId"
              className="text-sm text-[#606060] font-medium"
            >
              Enter your Email
            </label>
            <input
              id="emailId"
              name="emailId"
              type="email"
              required
              value={formData.emailId}
              onChange={handleInputChange}
              className="w-full h-12 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)] focus:border-transparent text-gray-800 placeholder-gray-400 transition-all duration-200 input-focus"
              placeholder="Enter your email address"
              disabled={loading}
            />
          </div>

          {/* Password Input */}
          {/* Password Input */}
          <div className="flex flex-col gap-2 items-start w-full max-w-[450px]">
            <label
              htmlFor="password"
              className="text-sm text-[#606060] font-medium"
            >
              Enter your Password
            </label>
            <div className="relative w-full">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full h-12 border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)] focus:border-transparent text-gray-800 placeholder-gray-400 transition-all duration-200 input-focus"
                placeholder="Enter your password"
                disabled={loading}
              />
              {/* <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 cursor-pointer bg-transparent border-none outline-none transition-colors duration-200"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button> */}
            </div>
          </div>

          {/* Forgot Password Link */}
          {/* <div className="flex justify-end w-full max-w-[450px]">
            <button
              type="button"
              className="text-[var(--brand-primary)] cursor-pointer font-semibold text-sm hover:underline transition-colors duration-200"
            >
              Forget Password?
            </button>
          </div> */}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full max-w-[450px] h-12 bg-[var(--brand-primary)] cursor-pointer text-white rounded-lg font-semibold text-lg hover:bg-[var(--brand-primary-700)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center btn-hover"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
