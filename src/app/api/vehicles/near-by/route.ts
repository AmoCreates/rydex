import dbConnect from "@/lib/db";
import User from "@/model/user.model";
import Vehicle from "@/model/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { lat, lon, vehicleType } = await req.json();
    const parsedLat = Number(lat);
    const parsedLon = Number(lon);
    const vType = vehicleType.toLowerCase();

    if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLon)) {
      return NextResponse.json(
        { message: "coordinates not found!" },
        { status: 400 },
      );
    }

    if (!vehicleType) {
      return NextResponse.json(
        { message: "please select the vehicle type first!" },
        { status: 400 },
      );
    }

    const partners = await User.find({
      role: "partner",
      partnerStatus: "approved",
      partnerOnBoardingStep: 7,
      isOnline: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parsedLon, parsedLat],
          },
          $maxDistance: 10000,
        },
      },
    });

    const partnerIds = partners.map((p) => p._id);

    if (partnerIds.length === 0) {
      return NextResponse.json(
        { message: "No vehicle found near-by" },
        { status: 200 },
      );
    }

    let vehicles = [];
    if(vType !== "all") {
      vehicles = await Vehicle.find({
        owner: { $in: partnerIds },
        type: vType,
        status: "approved",
        isActive: true,
      }).lean();
    } else {
      vehicles = await Vehicle.find({
        owner: { $in: partnerIds },
        status: "approved",
        isActive: true,
      }).lean();
    }


    if (vehicles.length === 0) {
      return NextResponse.json(
        { message: "sorry, we couldn't find any nearby vehicle, please try with different vehicle type" },
        { status: 200 },
      );
    }

    return NextResponse.json(vehicles, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "near by vehicles found error", error: err },
      { status: 500 },
    );
  }
}