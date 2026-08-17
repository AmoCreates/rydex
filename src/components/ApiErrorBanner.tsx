import { AlertTriangle } from "lucide-react";

export default function ApiErrorBanner({
	message,
	className = "",
}: {
	message?: string | null;
	className?: string;
}) {
	if (!message) return null;

	return (
		<div
			className={`rounded-2xl border border-red-200 bg-red-50 p-3 sm:p-4 text-red-700 shadow-sm ${className}`}
		>
			<div className="flex items-start gap-3">
				<div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-red-100 text-red-600">
					<AlertTriangle className="h-4 w-4" />
				</div>
				<div className="flex-1">
					<p className="text-sm font-semibold text-red-800">Something went wrong</p>
					<p className="mt-0.5 text-sm text-red-700">{message}</p>
				</div>
			</div>
		</div>
	);
}
