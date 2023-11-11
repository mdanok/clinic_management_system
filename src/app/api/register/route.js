import { NextResponse } from "next/server";
import prisma from "../prismaClient";
import { ERROR_MESSAGES, STATUS_CODES } from "@/consts/Errors";
import crypto from "crypto";

export async function POST(req) {
  try {
    const { password, firstName, lastName, gender, email } = await req.json();
    if (!password || !firstName || !lastName || !gender || !email) {
      return NextResponse.json(
        {
          error: STATUS_CODES.BAD_REQUEST,
          message: ERROR_MESSAGES.MISSING_FIELDS,
        },
        { status: STATUS_CODES.BAD_REQUEST }
      );
    }

    const existingUser = await prisma.doctor.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        {
          error: STATUS_CODES.BAD_REQUEST,
          message: "Email already taken",
        },
        { status: STATUS_CODES.BAD_REQUEST }
      );
    }

    const hashedPassword = sha256Hash(password);

    const newUser = await prisma.doctor.create({
      data: {
        email,
        hashedPassword,
        firstName,
        lastName,
        gender,
      },
    });

    return NextResponse.json(
      {
        message: "Doctor successfully registered",
        user: newUser,
      },
      { status: STATUS_CODES.OK }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: ERROR_MESSAGES.SERVER_ERROR,
      },
      { status: STATUS_CODES.INTERNAL_SERVER_ERROR }
    );
  }
}

export function sha256Hash(inputString) {
  const sha256 = crypto.createHash("sha256");
  sha256.update(inputString);
  return sha256.digest("hex");
}
