import { FlightScheduleResponse } from "@/types";
import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const iata = searchParams.get("iata");

  try {
    const flightSchedule = await axios.get(
      `https://api.flightapi.io/compschedule/${process.env.FLIGHT_API_KEY}?mode=arrivals&iata=${iata}&day=1`
    );

    const flightData = new Map<string, number>();

    for (const data of flightSchedule.data) {
      const arrivalData = data.airport.pluginData.schedule.arrivals.data;

      for (const arrival of arrivalData) {
        const country = arrival.flight.airport.origin.position.country.name;

        if (flightData.has(country)) {
          flightData.set(country, flightData.get(country)! + 1);
        } else {
          flightData.set(country, 1);
        }
      }
    }

    const data: FlightScheduleResponse = [];

    for (const [country, numberOfFlights] of flightData.entries()) {
      data.push({ country, numberOfFlights });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ data: [], error: error });
  }
}
