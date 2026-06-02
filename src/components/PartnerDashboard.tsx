"use client";
import { RootState } from "@/Toolkit/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "motion/react";
import { Check, Clock, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

type Step = {
	id: number;
	title: string;
	route?: string;
};

const STEPS: Step[] = [
	{ id: 1, title: "Vehicle", route: "/partner/onboarding/vehicle" },
	{ id: 2, title: "Docs", route: "/partner/onboarding/documents" },
	{ id: 3, title: "Bank", route: "/partner/onboarding/bank" },
	{ id: 4, title: "Review" },
	{ id: 5, title: "Video KYC" },
	{ id: 6, title: "Pricing" },
	{ id: 7, title: "Final Review" },
	{ id: 8, title: "Live" },
];
const TOTAL_STEPS = 8;

const PartnerDashboard = () => {
	const [currentStep, setCurrentStep] = useState(0);
	const { userData } = useSelector((state: RootState) => state.user);
	const router = useRouter();
	useEffect(() => {
		if (userData) {
			setCurrentStep(userData.partnerOnBoardingStep! + 1 || 0);
		}
	}, [userData]);

	const progress = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;

	return (
		<div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 pt-28 px-4 pb-20">
			<div className="max-w-7xl mx-auto space-y-16">
				<div>
					<h1 className="text-4xl font-bold">Partner Onboarding</h1>
					<p className="text-gray-600 mt-3">
						Complete all steps to activate your account.
					</p>
				</div>

				<div className="bg-white rounded-3xl border border-gray-300 shadow-[0_25px_70px_rgba(0,0,0,0.15)] p-6 sm:p-8 overflow-x-auto relative">
					<div className="absolute left-0 right-0 px-6 sm:px-8 top-15">
						<div className=" flex items-center w-full h-1 bg-gray-200 rounded-full overflow-hidden">
							<motion.div
								className="h-full bg-black"
								initial={{ width: 0 }}
								animate={{ width: `${progress}%` }}
								transition={{ duration: 0.5, ease: "easeInOut" }}
							/>
						</div>
					</div>

					<div className=" flex items-center justify-between w-full">
						{STEPS.map((step) => {
							const isCompleted = step.id < currentStep;
							const isActive = step.id === currentStep;
							const route = isActive || isCompleted ? step.route : undefined;
							return (
								<div key={step.id} className="flex flex-col items-center z-10">
									<div
										className={`h-15 w-15 rounded-full flex items-center justify-center text-center leading-3.75 text-sm font-medium ${
											isCompleted
												? "bg-black text-white hover:scale-110 transition cursor-pointer"
												: isActive
													? "bg-gray-100 border border-black text-white hover:scale-110 transition cursor-pointer"
													: "bg-gray-300 text-white cursor-not-allowed"
										} transition-colors duration-300 `}
										onClick={() => {
											if (route) {
												router.push(route);
											} else {
												return;
											}
										}}
									>
										<div className="relative flex justify-center items-center">
											{step.id > currentStep && (
												<Lock className="absolute text-gray-500 z-30" />
											)}
											{step.id == currentStep && (
												<Clock className="absolute text-gray-500" />
											)}
											{step.id < currentStep && (
												<Check className="absolute text-white" />
											)}
										</div>
									</div>
									<p className="mt-3 text-sm font-semibold text-center">
										{step.title}
									</p>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
};

export default PartnerDashboard;
