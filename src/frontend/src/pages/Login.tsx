import { useState } from "react";

const VALID_USERNAME = "divineadmin";
const VALID_PASSWORD = "divine@0907";

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      sessionStorage.setItem("dp_auth", "1");
      onLogin();
    } else {
      setError("Invalid username or password.");
    }
  }

  return (
    <div
      style={{ fontFamily: "'Open Sans', sans-serif" }}
      className="min-h-screen flex items-center justify-center bg-[#0f1117] px-4"
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/assets/uploads/2D-3.png"
            alt="Divine Properties"
            className="h-16 w-auto mb-3 object-contain"
          />
          <h1 className="text-[#c9a84c] text-xl font-semibold tracking-wide">
            Divine Properties
          </h1>
          <p className="text-gray-400 text-sm mt-1">Admin Portal</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-8 shadow-2xl"
        >
          <h2 className="text-white text-lg font-semibold mb-6">Sign In</h2>

          {error && (
            <div className="mb-4 px-3 py-2 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Username */}
          <div className="mb-4">
            <label
              htmlFor="login-username"
              className="block text-gray-300 text-[14px] mb-1.5 font-medium"
            >
              Username
            </label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              placeholder="Enter username"
              required
              className="w-full h-[40px] px-3 rounded-md bg-[#0f1117] border border-[#2a2d3a] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#c9a84c] transition-colors"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label
              htmlFor="login-password"
              className="block text-gray-300 text-[14px] mb-1.5 font-medium"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Enter password"
                required
                className="w-full h-[40px] px-3 pr-10 rounded-md bg-[#0f1117] border border-[#2a2d3a] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#c9a84c] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-[40px] bg-[#c9a84c] hover:bg-[#b8963e] text-[#0f1117] font-semibold rounded-md text-sm transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
