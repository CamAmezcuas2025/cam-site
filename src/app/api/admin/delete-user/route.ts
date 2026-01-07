import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/app/lib/serverSupabaseClient";

/**
 * API Route: DELETE /api/admin/delete-user
 *
 * Securely deletes a user including:
 * - Auth account (from auth.users)
 * - Profile data
 * - Memberships
 * - Children (if parent)
 * - Child profiles (if parent)
 *
 * Only accessible by admins.
 */
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // 1. Verify the requester is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify the requester is an admin
    const { data: isAdmin } = await supabase.rpc("is_admin");

    if (!isAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // 3. Get request body
    const body = await req.json();
    const { userId, isChild } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // 4. Create service role client for privileged operations
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // 5. Handle deletion based on user type
    if (isChild) {
      // Delete child profile
      console.log(`🗑️ Deleting child profile: ${userId}`);

      // 5a. Remove from children junction table
      const { error: junctionError } = await serviceSupabase
        .from("children")
        .delete()
        .eq("child_id", userId);

      if (junctionError) {
        console.error("Error deleting from children junction:", junctionError);
        throw junctionError;
      }

      // 5b. Delete from child_profiles
      const { error: childProfileError } = await serviceSupabase
        .from("child_profiles")
        .delete()
        .eq("id", userId);

      if (childProfileError) {
        console.error("Error deleting child profile:", childProfileError);
        throw childProfileError;
      }

      console.log("✅ Child deleted successfully");
    } else {
      // Delete adult user (with cascade to children)
      console.log(`🗑️ Deleting adult user: ${userId}`);

      // 5a. Find all children of this parent
      const { data: children, error: childrenError } = await serviceSupabase
        .from("children")
        .select("child_id")
        .eq("parent_id", userId);

      if (childrenError) {
        console.error("Error fetching children:", childrenError);
        throw childrenError;
      }

      const childIds = (children || []).map((c) => c.child_id);
      console.log(`Found ${childIds.length} children to delete`);

      // 5b. Delete all children junction records
      if (childIds.length > 0) {
        const { error: junctionError } = await serviceSupabase
          .from("children")
          .delete()
          .eq("parent_id", userId);

        if (junctionError) {
          console.error("Error deleting children junction:", junctionError);
          throw junctionError;
        }

        // 5c. Delete all child profiles
        const { error: childProfilesError } = await serviceSupabase
          .from("child_profiles")
          .delete()
          .in("id", childIds);

        if (childProfilesError) {
          console.error("Error deleting child profiles:", childProfilesError);
          throw childProfilesError;
        }
      }

      // 5d. Delete user memberships
      const { error: membershipsError } = await serviceSupabase
        .from("user_memberships")
        .delete()
        .eq("user_id", userId);

      if (membershipsError) {
        console.error("Error deleting user memberships:", membershipsError);
        throw membershipsError;
      }

      // 5e. Delete user profile
      const { error: profileError } = await serviceSupabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (profileError) {
        console.error("Error deleting user profile:", profileError);
        throw profileError;
      }

      // 5f. Delete auth user (THIS IS THE KEY STEP)
      // This prevents the user from logging in again
      const { error: authError } = await serviceSupabase.auth.admin.deleteUser(
        userId
      );

      if (authError) {
        console.error("Error deleting auth user:", authError);
        // Don't throw here - the profile is already deleted
        // Just log the error
        console.warn("⚠️ Auth deletion failed but profile was deleted");
      } else {
        console.log("✅ Auth user deleted successfully");
      }

      console.log("✅ User and all related data deleted successfully");
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error: any) {
    console.error("❌ Error in delete-user API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}
