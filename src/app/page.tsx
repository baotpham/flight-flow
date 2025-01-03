"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FlightScheduleResponse } from "@/types";
import axios from "axios";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search");

  const [search, setSearch] = useState(searchQuery || "");
  const [flightSchedule, setFlightSchedule] =
    useState<FlightScheduleResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateIata = (iata: string) => {
    const test = /^[a-zA-Z]{3}$/.test(iata);
    if (!test) {
      setError("Invalid IATA code");
    } else {
      setError(null);
      setSearch(iata);
    }
  };

  const onSearch = async () => {
    setError(null);
    setFlightSchedule(null);

    const params = new URLSearchParams();
    if (search) {
      params.set("search", search);
    }
    router.replace(`${pathname}?${params.toString()}`);

    setLoading(true);

    const response = await axios.get(`/api/flight-schedule?iata=${search}`);

    if (response.data.error) {
      setError(response.data.error);
    } else {
      setFlightSchedule(response.data.data);
    }

    setLoading(false);
  };

  return (
    <div className="p-20 flex flex-col items-start justify-start gap-10 w-full md:w-1/2">
      <div className="flex items-center justify-start w-full gap-2">
        <Input
          defaultValue={search}
          onChange={(e) => {
            validateIata(e.target.value);
          }}
        />

        <Button onClick={onSearch} disabled={!search || !!error}>
          Search
        </Button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        flightSchedule &&
        (flightSchedule.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold text-xs uppercase">
                  Country
                </TableHead>
                <TableHead className="font-bold text-xs uppercase">
                  Number of Flights
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flightSchedule.map((flight) => (
                <TableRow key={flight.country}>
                  <TableCell className="font-medium">
                    {flight.country}
                  </TableCell>
                  <TableCell>{flight.numberOfFlights}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-gray-500">No flight schedule found</p>
        ))
      )}
    </div>
  );
}
