// src/app/api/fighter-registration/route.ts
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      event_id,
      fighter_name,
      email,
      phone,
      birth_date,
      age,
      height_cm,
      weight_class,
      training_duration,
      combat_modality,
      health_conditions,
      gym_affiliation,
      liability_waiver_accepted,
    } = body;

    // Validate required fields
    if (
      !event_id ||
      !fighter_name ||
      !email ||
      !phone ||
      !birth_date ||
      !age ||
      !height_cm ||
      !weight_class ||
      !training_duration ||
      !combat_modality ||
      !liability_waiver_accepted
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createClientSupabaseClient();

    // Check if event exists
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, title")
      .eq("id", event_id)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Insert the registration
    const { data, error } = await supabase
      .from("fighter_registrations")
      .insert([
        {
          event_id,
          fighter_name,
          email,
          phone,
          birth_date,
          age,
          height_cm,
          weight_class,
          training_duration,
          combat_modality,
          health_conditions,
          gym_affiliation,
          liability_waiver_accepted,
          waiver_accepted_at: liability_waiver_accepted ? new Date().toISOString() : null,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating registration:", error);
      return NextResponse.json(
        { error: "Failed to submit registration" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registration submitted successfully",
        data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch registrations for a specific event (admin use)
export async function GET(req: NextRequest) {
  try {
    const supabase = createClientSupabaseClient();
    const { searchParams } = new URL(req.url);
    const event_id = searchParams.get("event_id");

    if (!event_id) {
      return NextResponse.json(
        { error: "event_id is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("fighter_registrations")
      .select("*")
      .eq("event_id", event_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching registrations:", error);
      return NextResponse.json(
        { error: "Failed to fetch registrations" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Fetch registrations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update registration status (admin use)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { registration_id, status } = body;

    if (!registration_id || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    const supabase = createClientSupabaseClient();

    const { data, error } = await supabase
      .from("fighter_registrations")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", registration_id)
      .select()
      .single();

    if (error) {
      console.error("Error updating registration:", error);
      return NextResponse.json(
        { error: "Failed to update registration" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registration updated successfully",
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove a registration (admin use)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const registration_id = searchParams.get("registration_id");

    if (!registration_id) {
      return NextResponse.json(
        { error: "registration_id is required" },
        { status: 400 }
      );
    }

    const supabase = createClientSupabaseClient();

    const { error } = await supabase
      .from("fighter_registrations")
      .delete()
      .eq("id", registration_id);

    if (error) {
      console.error("Error deleting registration:", error);
      return NextResponse.json(
        { error: "Failed to delete registration" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registration deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
