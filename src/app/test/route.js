import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET(request) {
  const patient = await prisma.appointment.findMany({
    where: {
      date: { gte: new Date("2023-10-23") },
    },
  });

  return NextResponse.json(patient);
}
