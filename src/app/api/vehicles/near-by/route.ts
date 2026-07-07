import dbConnect from "@/lib/db";
import User from "@/model/user.model";
import Vehicle from "@/model/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
  try {
    await dbConnect()

    const {lat, lon, vehicleType} = await req.json();
    if(!lat || !lon) {
      return NextResponse.json(
        {message: "coordinates not found!"},
        {status: 400}
      )
    }

    if(!vehicleType) {
      return NextResponse.json(
        {message: "please select the vehicle type first!"},
        {status: 400}
      )
    }

    // To find --> must be online, status: approved, vehcile type must matched, withing range of 5km to pickup loation
    const partners = await User.find({
      role: "partner",
      partnerStatus: "approved",
      isOnline: true,
      location: {
        $near:{
          $geometry: {
            type:"Point",
            coordinates: [lon, lat]
          },
          $maxDistance:10000
        }
      }
    })

    const partnerIds = partners.map(p => p._id);

    if(partnerIds.length == 0) {
      return NextResponse.json(
        {message: "No vehcile found near-by"},
        {status: 200}
      )
    }

    const vehicles = Vehicle.find({
      owner: {$in:partnerIds},
      type: vehicleType,
      status: "approved",
      isActive: true,
    })

    if(!vehicles) {
      return NextResponse.json(
        {message: "sorry, we couldn't find any vehicle"},
        {status: 200}
      )
    } else {
      return NextResponse.json(
        vehicles,
        {status: 200},
      )
    }

  } catch (err) {
    console.log(err);
    return NextResponse.json(
        {message: "near by vehciles found error, err: ",err},
        {status: 500}
      )
  }
}