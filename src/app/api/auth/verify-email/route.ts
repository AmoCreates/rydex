import dbConnect from "@/lib/db";
import User from "@/model/user.model";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const {email, otp} = await req.json();
    if(!email || !otp) {
      return Response.json(
        {message: "email and otp is required"},
        {status: 400}
      )
    }

    const user = await User.findOne({email});
    if(!user) {
      console.log("user not found");
      return Response.json(
        {message: "user not found"},
        {status: 404}
      )
    }

    if(user.isEmailVerified) {
      return Response.json(
        {message: "email already verified"},
        {status: 400}
      )
    }

    if(user.otpExpiry < new Date()) {
      return Response.json(
        {message: "otp expired"},
        {status: 400}
      )
    }

    if(user.otp !== otp) {
      return Response.json(
        {message: "invalid otp"},
        {status: 400}
      )
    }

    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return Response.json(
      {message: "email verified successfully"},
      {status: 200}
    )
    
  } catch (error) {
    return Response.json(
      {message: "something went wrong, please try again later", error},
      {status: 500}
    )
  }
}