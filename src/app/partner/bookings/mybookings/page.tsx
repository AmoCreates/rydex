"use client";
import { IBooking } from "@/model/booking.mode";
import axios from "axios";
import { Car } from "lucide-react";
import React, { useEffect, useState } from "react";



const Page = () => {
	const [bookings, setBookings] = useState<IBooking[]>([]);
  const [filter, setFilter] = useState<filter>("All")
	useEffect(() => {
		const getActiveRides = async () => {
			try {
				const { data } = await axios.get(
					"/api/partner/bookings/mybookings",
				);
				console.log(data.bookings);
				if (data.success) {
					setBookings(data.bookings);
				}
			} catch (error) {
				if (axios.isAxiosError(error)) {
					console.log(error.response?.data?.message);
				} else {
					console.log(error);
				}
			}
		};

		getActiveRides();
	}, []);
	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="max-w-3xl mx-auto py-6">
						<div className="flex items-center gap-3">
							<div className="bg-blue-100 p-2 rounded-lg">
								<Car className="w-5 h-5 text-blue-600" />
							</div>
							<div>
								<h1 className="text-2xl font-semibold text-gray-900">
									Partner Bookings
                  <p className="text-gray-500 text-sm mt-1">{bookings.length} {bookings.length === 1 ? "ride" : "rides"} assigned to you</p>
								</h1>
							</div>
						</div>
					</div>
				</div>
			</header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center items-center mb-6">
            <div className="text-sm text-gray-500">

            </div>
            <select></select>
          </div>
        </div>
      </main>
		</div>
	);
};

export default Page;
