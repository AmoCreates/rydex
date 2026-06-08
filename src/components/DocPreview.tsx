"use client";
import Image from "next/image";
import Link from "next/link";
import { Eye } from "lucide-react";
import { motion } from "motion/react";

const DocPreview = ({
	label,
	url,
}: {
	label: string;
	url: string | undefined;
}) => {
	const isImg = url?.match(/\.(jpeg|jpg|webp|png)$/i);
	const isPdf = url?.endsWith(".pdf");
	return (
		<div className="bg-gray-50 rounded-2xl border overflow-hidden shadow-sm group">
			<div className="px-4 py-2 text-sm font-semibold text-white bg-black/80">
				{label}
			</div>
			<Link
				href={url || "#"}
				target="_blank"
				className="h-60 relative flex items-center justify-center bg-white overflow-hidden"
			>
				{!url ? (
					<span className="text-xs text-gray-400">Image Not Uploaded</span>
				) : (
					<>
						{isImg && (
							<Image
								src={url}
								alt={label}
								fill
								className="object-cover transition-transform duration-500 group-hover:scale-110"
							/>
						)}

            {isPdf && (
              <iframe src={url} className="transition-transform duration-500 group-hover:scale-110"/>
            )}

						<motion.div
							initial={{ opacity: 0 }}
							whileHover={{ opacity: 1 }}
							className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white gap-2 backdrop-blur-[2px] transition-all"
						>
							<div className="bg-white/20 p-2 rounded-full">
								<Eye size={24} />
							</div>
							<span className="text-xs font-bold uppercase tracking-wider">
								Click to View
							</span>
						</motion.div>
					</>
				)}
			</Link>
		</div>
	);
};

export default DocPreview;
