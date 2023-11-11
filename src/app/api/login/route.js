import { NextResponse } from "next/server";
import prisma from "../prismaClient";
import { ERROR_MESSAGES, STATUS_CODES } from "@/consts/Errors";
import { SignJWT, importJWK } from "jose";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    const data = await req.json();
    if (!data.email || !data.password) {
      return NextResponse.json(
        { error: STATUS_CODES.BAD_REQUEST, message: "Invalid request" },
        { status: STATUS_CODES.BAD_REQUEST }
      );
    }

    const login = await prisma.doctor.findFirst({
      where: {
        email: data.email,
        hashedPassword: sha256Hash(data.password),
      },
    });

    if (login && validateLoginResult(login)) {
      const jwt = await createJWT({
        userId: login.id,
      });
      return NextResponse.json({ token: jwt }, { status: STATUS_CODES.OK });
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
  return loginResult.id !== undefined && loginResult.email !== undefined;
}

export function sha256Hash(inputString) {
  const sha256 = crypto.createHash("sha256");
  sha256.update(inputString);
  return sha256.digest("hex");
}

async function createJWT(payload) {
  const algorithm = "HS256";
  const jwk = await importJWK({ k: JWT_SECRET, alg: algorithm, kty: "oct" });

  return new SignJWT(payload)
    .setProtectedHeader({ alg: algorithm })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(jwk);
}
