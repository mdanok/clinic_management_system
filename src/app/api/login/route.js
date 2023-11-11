import { NextResponse } from "next/server";
import prisma from "../prismaClient";
import { ERROR_MESSAGES, STATUS_CODES } from "@/consts/Errors";

export async function POST(req) {
  try {
    const data = await req.json();
    if (!data.username || !data.password) {
      return NextResponse.json(
        { error: STATUS_CODES.BAD_REQUEST, message: "Invalid request" },
        { status: STATUS_CODES.BAD_REQUEST }
      );
    }

    const login = await prisma.doctor.findFirst({
      where: {
        username: data.username,
        hashedPassword: sha256Hash(data.password),
      },
    });

    if (login && validateLoginResult(login)) {
      return NextResponse.json(login, { status: STATUS_CODES.OK });
    } else {
      return NextResponse.json(
        {
          error: STATUS_CODES.BAD_REQUEST,
          message: ERROR_MESSAGES.ACCOUNT_NOT_FOUND,
        },
        { status: STATUS_CODES.BAD_REQUEST }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: STATUS_CODES.BAD_REQUEST, message: ERROR_MESSAGES.SERVER_ERROR },
      { status: STATUS_CODES.BAD_REQUEST }
    );
  }
}

function validateLoginResult(loginResult) {
  return loginResult.id !== undefined && loginResult.username !== undefined;
}

export function sha256Hash(inputString) {
  const sha256 = crypto.createHash("sha256");
  sha256.update(inputString);
  return sha256.digest("hex");
}
