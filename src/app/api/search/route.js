import prisma from "../prismaClient";
import { NextResponse } from "next/server";
import { ERROR_MESSAGES, STATUS_CODES } from "@/consts/Errors";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const data = await req.json();

    if (!data.doctor_id || !data.search_term) {
      return NextResponse.json(
        {
          error: STATUS_CODES.BAD_REQUEST,
          message: ERROR_MESSAGES.MISSING_FIELDS,
        },
        { status: STATUS_CODES.BAD_REQUEST }
      );
    }

    const searchResults = await prisma.patient.findMany({
      where: {
        doctorId: data.doctor_id,
        fullName: {
          contains: data.search_term,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        fullName: true,
        gender: true,
      },
    });

    if (searchResults.length > 0) {
      return NextResponse.json(searchResults);
    } else {
      return NextResponse.json(
        {
          error: STATUS_CODES.NOT_FOUND,
          message: ERROR_MESSAGES.NOT_RESULTS_FOUND,
        },
        { status: 404 }
      );
    }
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
