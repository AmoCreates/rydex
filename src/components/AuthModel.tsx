"use client";
import axios from "axios";
import { Lock, Mail, UserRound, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
	open: boolean;
	onClose: () => void;
};

type Steps = "login" | "signup" | "otp";

const AuthModel = ({ open, onClose }: Props) => {
	const [step, setStep] = useState<Steps>("login");
	const [err, setErr] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState(["", "", "", "", "", ""]);

	async function handleSignup(formData: FormData) {
		const name = formData.get("name");
		const email = formData.get("email");
		const password = formData.get("password");

		if (!name || !email || !password) {
			setErr("All fields are required");
			return;
		}

		const emailValue = String(email).trim();
		const passwordValue = String(password);

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
			setErr("Please enter a valid email address");
			return;
		}

		if (passwordValue.length < 6) {
			setErr("Password must be at least 6 characters long");
			return;
		}

		setLoading(true);
		setErr("");

		try {
			setEmail(emailValue);
			const response = await axios.post("/api/auth/signup", {
				name,
				email: emailValue,
				password: passwordValue,
			});
			if (response.status == 201) {
				setStep("otp");
			}
		} catch (error: unknown | any) {
			const message =
				error?.response?.data?.message ||
				error?.response?.data?.error ||
				error?.message ||
				"Signup failed";
			setErr(message);
		} finally {
			setLoading(false);
		}
	}

	async function handleLogin(formData: FormData) {
		const email = formData.get("email");
		const password = formData.get("password");
		if (!email || !password) {
			setErr("All fields are required");
			return;
		}

		const emailValue = String(email).trim();
		const passwordValue = String(password);

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
			setErr("Please enter a valid email address");
			return;
		}

		if (passwordValue.length < 6) {
			setErr("Password must be at least 6 characters long");
			return;
		}

		setLoading(true);
		setErr("");
		try {
			const res = await signIn("credentials", {
				email: emailValue,
				password: passwordValue,
				redirect: false,
			});

			if (res?.error) {
				const normalizedError =
					res.error === "CredentialsSignin" ||
					res.error === "Configuration"
						? "Invalid email or password"
						: res.error.replace(/[-_]/g, " ") || "Login failed";

				setErr(normalizedError);
				return;
			}

			if (res?.ok) {
				onClose();
				router.push("/");
				return;
			}

			setErr("Login failed");
		} catch (error: unknown | any) {
			setErr("Login failed");
			setErr(error?.message || "Login failed");
		} finally {
			setLoading(false);
		}
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (step === "login") await handleLogin(new FormData(e.currentTarget));
		else if (step === "signup")
			await handleSignup(new FormData(e.currentTarget));
	};

	async function verifyEmail() {
		if (otp.some((digit) => digit.trim() === "")) {
			setErr("Please enter the complete 6-digit OTP");
			return;
		}

		setErr("");
		setLoading(true);

		try {
			const { data } = await axios.post("/api/auth/verify-email", {
				email,
				otp: otp.join(""),
			});
			setTimeout(() => {
				setStep("login");
			}, 600);
			setErr("Email Verified Successfully");
			setTimeout(() => {
				setErr("");
			}, 5000);
		} catch (error) {
			setLoading(false);
			console.log(error);
			setErr("Invalid OTP");
		} finally {
			setLoading(false);
			setOtp(["", "", "", "", "", ""]);
		}
	}

	const handleChangeOtp = (idx: number, value: string) => {
		if (!/^[0-9]*$/.test(value)) return;
		const newOtp = [...otp];
		newOtp[idx] = value;
		setOtp(newOtp);

		if (value && idx < otp.length - 1) {
			document.getElementById(`otp-${idx + 1}`)?.focus();
			return;
		}

		if (!value && idx > 0) {
			document.getElementById(`otp-${idx - 1}`)?.focus();
			return;
		}
	};

	return (
		<AnimatePresence>
			{open && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-90 bg-black/80 backdrop-blur-sm"
				>
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 40 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						transition={{ duration: 0.35, ease: "easeOut" }}
						exit={{ opacity: 0, scale: 0.95, y: 80 }}
						className="fixed inset-0 z-100 flex items-center justify-center px-4"
					>
						<div className="relative w-full max-w-md rounded-3xl bg-white border border-black/10 shadow-[0_40px_100px_rgba(0, 0, 0, 0.35)] p-6 sm:p-8 text-black">
							<X
								className="absolute cursor-pointer right-4 top-4 text-gray-500 hover:text-black transition"
								onClick={onClose}
							/>
							<div className="text-center">
								<h1 className="text-3xl font-extrabold tracking-widest">
									RYDEX
								</h1>
								<p className="text-sm text-gray-500">
									Premium Vehicle Booking
								</p>
							</div>

							<button
								className={`w-full h-11 mt-4 rounded-xl border border-black/20 flex items-center justify-center gap-3 text-sm font-semibold hover:bg-black hover:text-white transition duration-300 ${loading ? "cursor-not-allowed bg-black text-white" : "cursor-pointer active:scale-95 transition"}`}
								disabled={loading}
								onClick={async () => {
									setLoading(true);
									await signIn("google", {
										callbackUrl: "/",
									});
									setLoading(false);
								}}
							>
								{loading ? (
									"Logging in..."
								) : (
									<>
										<Image
											src="/google.png"
											width={20}
											height={20}
											alt="google"
											priority
										/>{" "}
										Continue with Google
									</>
								)}
							</button>

							<div className="flex items-center justify-center my-6 gap-3">
								<hr className="grow border-black/20" />
								<p className="text-gray-500 text-sm">OR</p>
								<hr className="grow border-black/20" />
							</div>

							<p className="text-[12px] text-zinc-400 -mt-3 text-center">
								dummy admin email | pass ::{" "}
								<span className="font-bold text-zinc-500">
									admin@mail.com | 123456
								</span>
							</p>

							{step === "login" && (
								<motion.div
									initial={{ opacity: 0, x: 20 }}
									animate={{ opacity: 1, x: 0 }}
								>
									<h1 className="text-xl font-semibold">
										Welcome Back
									</h1>
									<form
										onSubmit={handleSubmit}
										className="mt-5 space-y-4"
									>
										<div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
											<label htmlFor="email">
												<Mail
													size={18}
													className="text-gray-500"
												/>
											</label>
											<input
												type="email"
												id="email"
												placeholder="Email"
												name="email"
												className="w-full bg-transparent outline-none text-sm"
											/>
										</div>
										<div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
											<label htmlFor="pass">
												<Lock
													size={18}
													className="text-gray-500"
												/>
											</label>
											<input
												type="password"
												id="pass"
												placeholder="Password"
												name="password"
												maxLength={16}
												minLength={6}
												className="w-full bg-transparent outline-none text-sm"
											/>
										</div>
										{err && (
											<div
												className={`${err == "Email Verified Successfully" ? "text-green-700" : "text-red-500"}`}
											>
												*{err}
											</div>
										)}
										<button
											className={`w-full h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition flex justify-center items-center gap-3 ${loading ? "cursor-not-allowed bg-gray-900" : "cursor-pointer active:scale-95 transition"}`}
											disabled={loading}
										>
											{loading
												? "Logging in..."
												: "Login"}
										</button>
									</form>
									<div className="flex mt-5 items-center flex-col text-[15px]">
										<p className="text-gray-500">
											Don&#39;t have an account?
										</p>
										<button
											onClick={() => {
												setStep("signup");
												setErr("");
											}}
											className="font-semibold hover:underline cursor-pointer"
										>
											Sign Up
										</button>
									</div>
								</motion.div>
							)}

							{step === "signup" && (
								<motion.div
									initial={{ opacity: 0, x: 20 }}
									animate={{ opacity: 1, x: 0 }}
								>
									<h1 className="text-xl font-semibold">
										Create Account
									</h1>
									<form
										onSubmit={handleSubmit}
										className="mt-5 space-y-4"
									>
										<div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
											<label htmlFor="name">
												<UserRound
													size={18}
													className="text-gray-500"
												/>
											</label>
											<input
												type="name"
												id="name"
												placeholder="Name"
												name="name"
												minLength={3}
												className="w-full bg-transparent outline-none text-sm"
											/>
										</div>
										<div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
											<label htmlFor="email">
												<Mail
													size={18}
													className="text-gray-500"
												/>
											</label>
											<input
												type="email"
												id="email"
												placeholder="Email"
												name="email"
												className="w-full bg-transparent outline-none text-sm"
											/>
										</div>
										<div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
											<label htmlFor="pass">
												<Lock
													size={18}
													className="text-gray-500"
												/>
											</label>
											<input
												type="password"
												id="pass"
												placeholder="Password"
												name="password"
												maxLength={16}
												minLength={6}
												className="w-full bg-transparent outline-none text-sm"
											/>
										</div>
										{err && (
											<div className="text-red-500">
												*{err}
											</div>
										)}
										<button
											className={`w-full h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900  flex justify-center items-center transition ${loading ? "cursor-not-allowed bg-gray-900" : "cursor-pointer active:scale-95 transition"}`}
											disabled={loading}
										>
											{loading
												? "Sending OTP..."
												: "Send OTP"}
										</button>
									</form>
									<div className="flex mt-5 items-center flex-col text-[15px]">
										<p className="text-gray-500">
											Already have an account?
										</p>
										<button
											className="font-semibold hover:underline cursor-pointer"
											onClick={() => {
												setStep("login");
												setErr("");
											}}
										>
											Login
										</button>
									</div>
								</motion.div>
							)}

							{step === "otp" && (
								<motion.div
									key="otp"
									initial={{ opacity: 0, x: 20 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -20 }}
								>
									<h1 className="text-xl font-semibold">
										Enter OTP
									</h1>
									<p className="text-gray-500 text-sm">
										Sent to{" "}
										<span className="text-green-600 font-medium">
											{email}
										</span>
									</p>
									<div className="mt-5 space-y-4 flex justify-between gap-2">
										{otp.map((digit, idx) => (
											<input
												key={idx}
												id={`otp-${idx}`}
												value={digit}
												name={`otp-${idx}`}
												maxLength={1}
												onChange={(e) =>
													handleChangeOtp(
														idx,
														e.target.value,
													)
												}
												className="w-10 h-10 sm:w-12 text-center text-lg font-semibold rounded-xl bg-white border border-black/20 outline-none"
											/>
										))}
									</div>
									{err && (
										<div
											className={`${err == "Email Verified Successfully" ? "text-green-700" : "text-red-500"}`}
										>
											*{err}
										</div>
									)}
									<button
										className={`mt-6 w-full h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 flex justify-center items-center gap-3 active:scale-95 transition cursor-pointer ${loading ? "cursor-not-allowed bg-gray-900" : "cursor-pointer active:scale-95 transition"}`}
										onClick={verifyEmail}
										disabled={loading}
									>
										{loading
											? "Verifying OTP..."
											: "Verify Email"}
									</button>
									<div className="flex mt-2 items-center flex-col text-[15px]">
										<button
											onClick={() => {
												setStep("signup");
												setErr("");
											}}
											disabled={loading}
											className="font-semibold hover:underline cursor-pointer text-gray-500 disabled:no-underline disabled:cursor-not-allowed"
										>
											Re-Enter Email
										</button>
									</div>
								</motion.div>
							)}
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default AuthModel;
