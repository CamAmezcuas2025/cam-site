// src/app/admin/(admin)/page.tsx
/**
 * ============================================================================
 * CONSOLIDATED ADMIN DASHBOARD - MASTER USER MANAGEMENT
 * ============================================================================
 * 
 * This is the MAIN admin interface for managing all users and memberships.
 * 
 * FEATURES:
 * - View all users (adults + children) in one table
 * - Edit membership expiration dates inline
 * - Edit user profile data (belt, phone, notes) inline
 * - Save changes button with confirmation
 * - Filter by status: All, Active, Expiring Soon (≤30 days), Past Due
 * - Send email reminders to users with expiring/expired memberships
 * - Quick stats cards showing totals
 * - Real-time updates via Supabase subscriptions
 * 
 * DATABASE TABLES USED:
 * - profiles: User info (name, email, avatar, belt_level, phone, admin_notes, etc.)
 * - user_memberships: Active memberships with end_date
 * - admin_memberships: Membership types/plans
 * - children: Junction table (parent_id, child_id)
 * - child_profiles: Actual child data (full_name, avatar, belt_level, etc.)
 * 
 * ============================================================================
 */

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClientSupabaseClient } from "@/app/lib/clientSupabaseClient";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Users,
  Search,
  ShieldCheck,
  Mail,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Baby,
  Loader2,
  Save,
  StickyNote,
  Trash2,
  Phone,
  Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  role: string;
  belt_level?: string | null;
  edad?: number | null;
  estatura?: number | null;
  peso?: number | null;
  tiempoEntrenando?: string | null;
  is_parent?: boolean | null;
  membership_end_date?: string | null;
  membership_type?: string | null;
  membership_category?: string | null;
  parent_name?: string | null;
  parent_id?: string | null;
  is_child?: boolean;
  admin_notes?: string | null;
}

interface EditedProfile {
  belt_level?: string;
  phone?: string;
  admin_notes?: string;
  membership_end_date?: string;
}

type FilterTab = "all" | "active" | "expiring" | "pastdue";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ConsolidatedAdminPanel() {
  const router = useRouter();
  const supabase = createClientSupabaseClient();
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);
  const hasFetched = useRef(false);
  const [skipNextRefetch, setSkipNextRefetch] = useState(false);

  // Scroll refs for dual scrollbars
  const topScrollRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);

  // Editing state
  const [editedProfiles, setEditedProfiles] = useState<Record<string, EditedProfile>>({});
  const [savingProfileId, setSavingProfileId] = useState<string | null>(null);

  // Delete state
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // ============================================================================
  // DATA FETCHING FUNCTION
  // ============================================================================
  
  const fetchAllProfiles = useCallback(async () => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    try {
        // STEP 1: Fetch all regular users (adults)
        const { data: adults, error: adultsError } = await supabase
          .from("profiles")
          .select(`
            id,
            full_name,
            email,
            phone,
            avatar,
            role,
            belt_level,
            edad,
            estatura,
            peso,
            tiempoEntrenando,
            is_parent,
            admin_notes
          `)
          .neq("role", "admin")
          .order("full_name", { ascending: true });

        if (adultsError) {
          console.error("❌ Error fetching adults:", adultsError);
          throw adultsError;
        }

        // STEP 2: Fetch user memberships separately
        const { data: memberships, error: membershipsError } = await supabase
          .from("user_memberships")
          .select(`
            user_id,
            end_date,
            active,
            membership_id
          `)
          .eq("active", true);

        if (membershipsError) {
          console.error("❌ Error fetching memberships:", membershipsError);
        }

        // STEP 3: Fetch admin memberships
        const { data: adminMemberships, error: adminMembershipsError } = await supabase
          .from("admin_memberships")
          .select(`
            id,
            name,
            type,
            category
          `);

        if (adminMembershipsError) {
          console.error("❌ Error fetching admin memberships:", adminMembershipsError);
        }

        // Create membership lookup maps
        const membershipMap = new Map();
        const adminMembershipMap = new Map();

        (adminMemberships || []).forEach((am: any) => {
          adminMembershipMap.set(am.id, am);
        });

        (memberships || []).forEach((m: any) => {
          membershipMap.set(m.user_id, {
            end_date: m.end_date,
            adminMembership: adminMembershipMap.get(m.membership_id),
          });
        });

        // STEP 4: Format adult profiles with membership data
        const formattedAdults = (adults || []).map((p: any) => {
          const userMembership = membershipMap.get(p.id);
          const adminMembership = userMembership?.adminMembership;
          
          return {
            ...p,
            membership_end_date: userMembership?.end_date ?? null,
            membership_type: adminMembership?.name || adminMembership?.type || null,
            membership_category: adminMembership?.category || null,
            is_child: false,
            parent_name: null,
            parent_id: null,
          };
        });

        // STEP 5: Fetch children data through junction table
        const { data: childrenJunction, error: childrenJunctionError } = await supabase
          .from("children")
          .select(`
            id,
            parent_id,
            child_id
          `);

        if (childrenJunctionError) {
          console.error("❌ Error fetching children junction:", childrenJunctionError);
        }

        // STEP 6: Get all child IDs and fetch their profiles
        const childIds = (childrenJunction || []).map((c: any) => c.child_id).filter(Boolean);
        const parentIds = (childrenJunction || []).map((c: any) => c.parent_id).filter(Boolean);

        let childProfilesMap = new Map();
        let parentMap = new Map();

        if (childIds.length > 0) {
          const { data: childProfiles, error: childProfilesError } = await supabase
            .from("child_profiles")
            .select(`
              id,
              full_name,
              avatar,
              edad,
              estatura,
              peso,
              tiempoEntrenando,
              belt_level,
              admin_notes
            `)
            .in("id", childIds);

          if (childProfilesError) {
            console.error("❌ Error fetching child_profiles:", childProfilesError);
          }

          (childProfiles || []).forEach((cp: any) => {
            childProfilesMap.set(cp.id, cp);
          });
        }

        // STEP 7: Get parent info
        if (parentIds.length > 0) {
          const { data: parents, error: parentsError } = await supabase
            .from("profiles")
            .select("id, full_name, email")
            .in("id", parentIds);

          if (parentsError) {
            console.error("❌ Error fetching parents:", parentsError);
          }

          (parents || []).forEach((p: any) => {
            parentMap.set(p.id, p);
          });
        }

        // STEP 8: Create a map of child_id to parent info
        const childToParentMap = new Map();
        (childrenJunction || []).forEach((junction: any) => {
          childToParentMap.set(junction.child_id, {
            parent_id: junction.parent_id,
            parent: parentMap.get(junction.parent_id),
          });
        });

        // STEP 9: Format children profiles
        const formattedChildren = Array.from(childProfilesMap.values()).map((cp: any) => {
          const parentInfo = childToParentMap.get(cp.id);
          const parent = parentInfo?.parent;
          const parentId = parentInfo?.parent_id;
          
          // Children inherit their parent's membership
          const parentMembership = parentId ? membershipMap.get(parentId) : null;
          const adminMembership = parentMembership?.adminMembership;

          return {
            id: cp.id,
            full_name: cp.full_name,
            email: parent?.email || "—",
            phone: null,
            avatar: cp.avatar,
            role: "student",
            belt_level: cp.belt_level,
            edad: cp.edad,
            estatura: cp.estatura,
            peso: cp.peso,
            tiempoEntrenando: cp.tiempoEntrenando,
            is_parent: false,
            membership_end_date: parentMembership?.end_date ?? null,
            membership_type: adminMembership?.name || adminMembership?.type || null,
            membership_category: adminMembership?.category || null,
            parent_name: parent?.full_name || "—",
            parent_id: parentId,
            is_child: true,
            admin_notes: cp.admin_notes,
          };
        });

        // STEP 10: Combine and set state
        const allProfiles = [...formattedAdults, ...formattedChildren];
        console.log("✅ Loaded profiles:", {
          adults: formattedAdults.length,
          children: formattedChildren.length,
          total: allProfiles.length
        });
        setProfiles(allProfiles);
        setFiltered(allProfiles);
      } catch (err) {
        console.error("❌ Error fetching profiles:", err);
        setProfiles([]);
        setFiltered([]);
      } finally {
        setLoading(false);
      }
    }, [supabase]);

  // ============================================================================
  // USE EFFECT FOR INITIAL LOAD AND SUBSCRIPTIONS
  // ============================================================================

// ============================================================================
  // USE EFFECT FOR INITIAL LOAD
  // ============================================================================

  useEffect(() => {
    fetchAllProfiles();
  }, [fetchAllProfiles]);
  // ============================================================================
  // FILTERING LOGIC
  // ============================================================================

  useEffect(() => {
    let result = profiles;

    // Apply search filter
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.full_name?.toLowerCase().includes(term) ||
          p.email?.toLowerCase().includes(term) ||
          p.parent_name?.toLowerCase().includes(term)
      );
    }

    // Apply tab filter
    const today = new Date();
    switch (activeTab) {
      case "active":
        result = result.filter((p) => {
          if (!p.membership_end_date) return false;
          const endDate = new Date(p.membership_end_date);
          const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return daysLeft > 30;
        });
        break;
      case "expiring":
        result = result.filter((p) => {
          if (!p.membership_end_date) return false;
          const endDate = new Date(p.membership_end_date);
          const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return daysLeft > 0 && daysLeft <= 30;
        });
        break;
      case "pastdue":
        result = result.filter((p) => {
          if (!p.membership_end_date) return false;
          const endDate = new Date(p.membership_end_date);
          return endDate < today;
        });
        break;
      // "all" shows everything
    }

    setFiltered(result);
    setCurrentPage(1); // Reset to page 1 when filtering
  }, [search, activeTab, profiles]);

  // ============================================================================
  // DUAL SCROLLBAR SYNC & MOUSE WHEEL HORIZONTAL SCROLL
  // ============================================================================

  useEffect(() => {
    const topScroll = topScrollRef.current;
    const tableScroll = tableScrollRef.current;

    if (!topScroll || !tableScroll) return;

    // Sync top scrollbar with table scroll
    const handleTableScroll = () => {
      if (topScroll && tableScroll) {
        topScroll.scrollLeft = tableScroll.scrollLeft;
      }
    };

    // Sync table scroll with top scrollbar
    const handleTopScroll = () => {
      if (topScroll && tableScroll) {
        tableScroll.scrollLeft = topScroll.scrollLeft;
      }
    };

    // Enable horizontal scroll with mouse wheel
    const handleWheel = (e: WheelEvent) => {
      if (tableScroll && Math.abs(e.deltaY) > 0) {
        e.preventDefault();
        tableScroll.scrollLeft += e.deltaY;
        if (topScroll) {
          topScroll.scrollLeft = tableScroll.scrollLeft;
        }
      }
    };

    tableScroll.addEventListener('scroll', handleTableScroll);
    topScroll.addEventListener('scroll', handleTopScroll);
    tableScroll.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      tableScroll.removeEventListener('scroll', handleTableScroll);
      topScroll.removeEventListener('scroll', handleTopScroll);
      tableScroll.removeEventListener('wheel', handleWheel);
    };
  }, [filtered]);

  // ============================================================================
  // MEMBERSHIP STATUS HELPER
  // ============================================================================

  function getMembershipStatus(endDate?: string | null) {
    if (!endDate) return { 
      color: "text-gray-500", 
      bgColor: "bg-gray-500/10",
      borderColor: "border-gray-500/40",
      label: "Sin Fecha", 
      icon: <XCircle className="w-4 h-4" />,
      days: null 
    };

    const today = new Date();
    const end = new Date(endDate);
    const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        color: "text-red-400",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/40",
        label: "Vencido",
        icon: <AlertTriangle className="w-4 h-4" />,
        days: diffDays,
      };
    } else if (diffDays <= 7) {
      return {
        color: "text-red-400",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/40",
        label: "Urgente",
        icon: <AlertCircle className="w-4 h-4" />,
        days: diffDays,
      };
    } else if (diffDays <= 30) {
      return {
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/10",
        borderColor: "border-yellow-500/40",
        label: "Por Vencer",
        icon: <AlertCircle className="w-4 h-4" />,
        days: diffDays,
      };
    } else {
      return {
        color: "text-green-400",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/40",
        label: "Activo",
        icon: <CheckCircle className="w-4 h-4" />,
        days: diffDays,
      };
    }
  }

  // ============================================================================
  // ACTIONS: TRACK PROFILE EDITS
  // ============================================================================

  function handleProfileEdit(userId: string, field: keyof EditedProfile, value: string) {
    setEditedProfiles(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value,
      }
    }));
  }

  // ============================================================================
  // ACTIONS: SAVE PROFILE CHANGES
  // ============================================================================

 async function saveProfileChanges(userId: string, isChild: boolean) {
  const changes = editedProfiles[userId];
  if (!changes) return;

  setSavingProfileId(userId);

  try {
    // Separate membership_end_date from profile fields
    const { membership_end_date, ...profileChanges } = changes;

    // Handle date change if present
    if (membership_end_date) {
      await handleEndDateChange(userId, membership_end_date, isChild);
    }

    // Handle profile fields if present
    if (Object.keys(profileChanges).length > 0) {
      const table = isChild ? "child_profiles" : "profiles";
      const { error } = await supabase
        .from(table)
        .update(profileChanges)
        .eq("id", userId);

      if (error) throw error;
    }

    console.log("✅ Profile saved successfully");
    
    // Update local state
    setProfiles(prev => prev.map(p => 
      p.id === userId ? { ...p, ...changes } : p
    ));
    
    // Clear edited state for this user
    setEditedProfiles(prev => {
      const newState = { ...prev };
      delete newState[userId];
      return newState;
    });
    
    alert("✅ Cambios guardados correctamente");
  } catch (err) {
    console.error("❌ Error saving profile:", err);
    alert("❌ Error al guardar cambios.");
  } finally {
    setSavingProfileId(null);
  }
}

  // ============================================================================
  // ACTIONS: UPDATE END DATE
  // ============================================================================

  async function handleEndDateChange(userId: string, newDate: string, isChild: boolean) {
  const targetUserId = isChild 
    ? profiles.find(p => p.id === userId)?.parent_id 
    : userId;

  if (!targetUserId) {
    alert("❌ No se pudo encontrar el usuario para actualizar.");
    return;
  }

 setEditedProfiles(prev => ({
    ...prev,
    [userId]: {
      ...prev[userId],
      membership_end_date: newDate,
    }
  }));

  // Optimistic update
  setProfiles((prev) =>
    prev.map((p) => {
      if (p.id === userId) return { ...p, membership_end_date: newDate };
      if (!isChild && p.parent_id === userId) return { ...p, membership_end_date: newDate };
      if (isChild && p.parent_id === targetUserId) return { ...p, membership_end_date: newDate };
      if (isChild && p.id === targetUserId) return { ...p, membership_end_date: newDate };
      return p;
    })
  );

  setSkipNextRefetch(true);
  setTimeout(() => setSkipNextRefetch(false), 3000);

  try {
    // Check if membership exists
    const { data: existing } = await supabase
      .from("user_memberships")
      .select("*")
      .eq("user_id", targetUserId)
      .eq("active", true)
      .single();

    if (existing) {
      // UPDATE existing membership
      const { error } = await supabase
        .from("user_memberships")
        .update({ end_date: newDate })
        .eq("id", existing.id);

      if (error) throw error;
      console.log("✅ Membership updated");
    } else {
      // CREATE new membership (you need a membership_id!)
      alert("⚠️ Este usuario no tiene una membresía activa. Por favor, asigna una membresía primero desde la página de Membresías.");
      setSkipNextRefetch(false);
      hasFetched.current = false;
      fetchAllProfiles();
      return;
    }

    console.log("✅ Fecha de vencimiento actualizada correctamente.");
  } catch (err: any) {
    console.error("❌ Error:", err);
    alert("❌ Error: " + err.message);
    setSkipNextRefetch(false);
    hasFetched.current = false;
    fetchAllProfiles();
  }
}
  // ============================================================================
  // ACTIONS: SEND REMINDER EMAIL
  // ============================================================================

  async function sendReminderEmail(email: string, fullName: string, userId: string) {
    try {
      setSendingReminderId(userId);
      const res = await fetch("/api/sendReminderEmails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullName }),
      });

      if (res.ok) {
        alert(`📧 Recordatorio enviado a ${fullName}`);
      } else {
        console.error("❌ Error sending email:", await res.text());
        alert("❌ Error al enviar correo.");
      }
    } catch (e) {
      console.error("❌ Network error:", e);
      alert("❌ Error en la red al enviar correo.");
    } finally {
      setSendingReminderId(null);
    }
  }

  // ============================================================================
  // ACTIONS: DELETE USER
  // ============================================================================

  async function deleteUser(userId: string, fullName: string, isChild: boolean) {
    const confirmMessage = isChild
      ? `¿Está seguro de que desea eliminar a ${fullName}?\n\nEsta acción no se puede deshacer.`
      : `¿Está seguro de que desea eliminar a ${fullName}?\n\nSi este usuario es padre/madre, TODOS sus hijos también serán eliminados.\n\nEsta acción no se puede deshacer.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setDeletingUserId(userId);

    try {
      // Call the secure API route to delete the user
      const response = await fetch("/api/admin/delete-user", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          isChild,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      console.log("✅ User deleted successfully via API");

      // Update local state to remove deleted user(s)
      setProfiles((prev) => {
        if (isChild) {
          return prev.filter((p) => p.id !== userId);
        } else {
          // Remove parent and all their children
          return prev.filter((p) => p.id !== userId && p.parent_id !== userId);
        }
      });

      alert(`✅ ${fullName} ha sido eliminado correctamente.`);
    } catch (err: any) {
      console.error("❌ Error deleting user:", err);
      alert(`❌ Error al eliminar usuario: ${err.message}`);
    } finally {
      setDeletingUserId(null);
    }
  }

  // ============================================================================
  // STAT CALCULATIONS
  // ============================================================================

  const stats = {
    total: profiles.length,
    adults: profiles.filter(p => !p.is_child).length,
    children: profiles.filter(p => p.is_child).length,
    active: profiles.filter((p) => {
      if (!p.membership_end_date) return false;
      const days = Math.ceil((new Date(p.membership_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return days > 30;
    }).length,
    expiring: profiles.filter((p) => {
      if (!p.membership_end_date) return false;
      const days = Math.ceil((new Date(p.membership_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return days > 0 && days <= 30;
    }).length,
    pastDue: profiles.filter((p) => {
      if (!p.membership_end_date) return false;
      return new Date(p.membership_end_date) < new Date();
    }).length,
  };

  // ============================================================================
  // HELPER: Check if user has unsaved changes
  // ============================================================================

  const hasUnsavedChanges = (userId: string) => {
    return editedProfiles[userId] !== undefined;
  };

  // ============================================================================
  // RENDER: LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <section className="pt-28 pb-24 max-w-7xl mx-auto px-6">
        <div className="text-center text-white">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          Cargando panel de administración...
        </div>
      </section>
    );
  }

  // ============================================================================
  // RENDER: MAIN UI
  // ============================================================================

  return (
    <div className="admin-page min-h-screen text-white pt-20 pb-10">
      <motion.div
        className="admin-content max-w-7xl mx-auto px-4 md:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* HEADER SECTION */}
        <div className="bg-gradient-to-b from-black/40 via-black/20 to-transparent backdrop-blur-sm rounded-xl p-4 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-brand-blue flex items-center gap-2">
              <Users className="w-6 h-6 md:w-7 md:h-7 text-brand-red" /> 
              Panel de Administración
            </h1>

            {/* Search Bar */}
            <div className="flex items-center bg-black/50 border border-gray-700 rounded-lg px-3 py-2 w-full sm:w-auto max-w-md">
              <Search className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none text-sm w-full text-gray-200 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <div className="bg-black/40 rounded-lg p-3 border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">Total Usuarios</div>
              <div className="text-2xl font-bold text-brand-blue">{stats.total}</div>
            </div>
            <div className="bg-black/40 rounded-lg p-3 border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">Adultos</div>
              <div className="text-2xl font-bold text-purple-400">{stats.adults}</div>
            </div>
            <div className="bg-black/40 rounded-lg p-3 border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">Niños</div>
              <div className="text-2xl font-bold text-pink-400">{stats.children}</div>
            </div>
            <div className="bg-black/40 rounded-lg p-3 border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">Activos</div>
              <div className="text-2xl font-bold text-green-400">{stats.active}</div>
            </div>
            <div className="bg-black/40 rounded-lg p-3 border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">Por Vencer</div>
              <div className="text-2xl font-bold text-yellow-400">{stats.expiring}</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-brand-blue text-white"
                  : "bg-black/40 text-gray-300 hover:bg-black/60"
              }`}
            >
              <Users className="w-4 h-4" />
              Todos ({stats.total})
            </button>

            <button
              onClick={() => setActiveTab("active")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                activeTab === "active"
                  ? "bg-green-600 text-white"
                  : "bg-black/40 text-gray-300 hover:bg-black/60"
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Activos ({stats.active})
            </button>

            <button
              onClick={() => setActiveTab("expiring")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                activeTab === "expiring"
                  ? "bg-yellow-600 text-white"
                  : "bg-black/40 text-gray-300 hover:bg-black/60"
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              Por Vencer ({stats.expiring})
            </button>

            <button
              onClick={() => setActiveTab("pastdue")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                activeTab === "pastdue"
                  ? "bg-red-600 text-white"
                  : "bg-black/40 text-gray-300 hover:bg-black/60"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Vencidos ({stats.pastDue})
            </button>
          </div>
        </div>

        {/* TABLE SECTION */}
        {filtered.length === 0 ? (
          <div className="bg-black/60 backdrop-blur-md rounded-xl p-8 text-center">
            <p className="text-gray-400">No hay resultados para esta búsqueda o filtro.</p>
          </div>
        ) : (
          <>
            {/* Top Scrollbar */}
            <div
              ref={topScrollRef}
              className="w-full overflow-x-auto mb-2 bg-black/40 rounded-lg"
              style={{
                WebkitOverflowScrolling: 'touch',
                overflowX: 'auto',
                overflowY: 'hidden',
                height: '12px'
              }}
            >
              <div style={{ width: '1800px', height: '1px' }}></div>
            </div>

            {/* Table Container */}
            <div
              ref={tableScrollRef}
              className="w-full overflow-x-auto bg-black/60 backdrop-blur-md rounded-xl border border-gray-800 shadow-glow"
              style={{
                WebkitOverflowScrolling: 'touch',
                overflowX: 'auto',
                display: 'block'
              }}
            >
              <table 
                className="w-full text-sm md:text-base"
                style={{ 
                  minWidth: '1800px',
                  display: 'table',
                  tableLayout: 'auto'
                }}
              >
                <thead className="bg-gradient-to-r from-brand-red/30 to-brand-blue/30 text-white uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-3 md:px-4 py-3 text-left" style={{ minWidth: '60px' }}>Avatar</th>
                    <th className="px-3 md:px-4 py-3 text-left" style={{ minWidth: '180px' }}>Nombre</th>
                    <th className="px-3 md:px-4 py-3 text-left" style={{ minWidth: '200px' }}>Correo</th>
                    <th className="px-3 md:px-4 py-3 text-left" style={{ minWidth: '140px' }}>Teléfono</th>
                    <th className="px-3 md:px-4 py-3 text-left" style={{ minWidth: '120px' }}>Cinta</th>
                    <th className="px-3 md:px-4 py-3 text-left" style={{ minWidth: '100px' }}>Tipo</th>
                    <th className="px-3 md:px-4 py-3 text-left" style={{ minWidth: '180px' }}>Membresía</th>
                    <th className="px-3 md:px-4 py-3 text-left" style={{ minWidth: '250px' }}>Notas Admin</th>
                    <th className="px-3 md:px-4 py-3 text-left" style={{ minWidth: '200px' }}>Vence</th>
                    <th className="px-3 md:px-4 py-3 text-left" style={{ minWidth: '150px' }}>Estado</th>
                    <th className="px-3 md:px-4 py-3 text-left" style={{ minWidth: '100px' }}>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((user, idx) => {
                      const status = getMembershipStatus(user.membership_end_date);
                      const membershipDisplay = user.membership_type
                        ? `${user.membership_type} ${user.membership_category === "family" ? "(Familia)" : "(Individual)"}`
                        : "—";
                      
                      const currentBelt = editedProfiles[user.id]?.belt_level ?? user.belt_level ?? "";
                      const currentPhone = editedProfiles[user.id]?.phone ?? user.phone ?? "";
                      const currentNotes = editedProfiles[user.id]?.admin_notes ?? user.admin_notes ?? "";

                      return (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          className={`border-t border-gray-800 hover:bg-white/10 transition-colors ${
                            hasUnsavedChanges(user.id) ? "bg-yellow-900/10" : ""
                          }`}
                        >
                          {/* Avatar */}
                          <td className="px-3 md:px-4 py-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-700 flex-shrink-0">
                              <Image
                                src={user.avatar || "/images/default-avatar.png"}
                                alt={user.full_name}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            </div>
                          </td>

                          {/* Name */}
                          <td className="px-3 md:px-4 py-3 font-semibold whitespace-nowrap">
                            {user.full_name}
                          </td>

                          {/* Email */}
                          <td className="px-3 md:px-4 py-3 text-gray-300 whitespace-nowrap">
                            {user.email && user.email !== "—" ? (
                              <a
                                href={`mailto:${user.email}`}
                                className="text-blue-400 hover:text-blue-300 hover:underline inline-flex items-center gap-1"
                                title={`Enviar correo a ${user.email}`}
                              >
                                <Mail className="w-3.5 h-3.5" />
                                {user.email}
                              </a>
                            ) : (
                              <span className="text-gray-500">—</span>
                            )}
                          </td>

                          {/* Phone (EDITABLE) */}
                          <td className="px-3 md:px-4 py-3">
                            {!user.is_child ? (
                              <div className="flex flex-col gap-1">
                                <input
                                  type="tel"
                                  value={currentPhone}
                                  onChange={(e) => handleProfileEdit(user.id, "phone", e.target.value)}
                                  placeholder="Teléfono"
                                  className="border border-gray-700 bg-black/40 text-white rounded px-2 py-1 focus:ring-2 focus:ring-brand-blue outline-none text-xs w-full"
                                />
                                {currentPhone && (
                                  <a
                                    href={`tel:${currentPhone}`}
                                    className="text-green-400 hover:text-green-300 hover:underline text-xs inline-flex items-center gap-1"
                                    title={`Llamar a ${currentPhone}`}
                                  >
                                    <Phone className="w-3 h-3" />
                                    Llamar
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500">—</span>
                            )}
                          </td>

                          {/* Belt Level (EDITABLE) */}
                          <td className="px-3 md:px-4 py-3">
                            <input
                              type="text"
                              value={currentBelt}
                              onChange={(e) => handleProfileEdit(user.id, "belt_level", e.target.value)}
                              placeholder="Cinta"
                              className="border border-gray-700 bg-black/40 text-white rounded px-2 py-1 focus:ring-2 focus:ring-brand-blue outline-none text-xs w-full"
                            />
                          </td>

                          {/* User Type */}
                          <td className="px-3 md:px-4 py-3">
                            {user.is_child ? (
                              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-purple-500/15 border border-purple-600/40 text-purple-300 whitespace-nowrap">
                                <Baby className="w-3.5 h-3.5" />
                                Hijo
                              </span>
                            ) : user.is_parent ? (
                              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/15 border border-green-600/40 text-green-300 whitespace-nowrap">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Familiar
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500">Alumno</span>
                            )}
                          </td>

                          {/* Membership Type */}
                          <td className="px-3 md:px-4 py-3 text-gray-300 text-xs whitespace-nowrap">
                            {membershipDisplay}
                          </td>

                          {/* Admin Notes (EDITABLE) */}
                          <td className="px-3 md:px-4 py-3">
                            <textarea
                              value={currentNotes}
                              onChange={(e) => handleProfileEdit(user.id, "admin_notes", e.target.value)}
                              placeholder="Notas administrativas..."
                              rows={2}
                              className="border border-gray-700 bg-black/40 text-white rounded px-2 py-1 focus:ring-2 focus:ring-brand-blue outline-none text-xs w-full resize-none"
                            />
                          </td>

                          {/* Expiration Date */}
                          <td className="px-3 md:px-4 py-3">
                            {user.is_child ? (
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-500">Heredado</span>
                                {user.membership_end_date && (
                                  <span className="text-xs text-gray-400">
                                    {new Date(user.membership_end_date).toLocaleDateString('es-MX')}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="relative">
                                <input
                                  type="date"
                                  value={
                                    user.membership_end_date
                                      ? user.membership_end_date.split("T")[0]
                                      : ""
                                  }
                                  onChange={(e) =>
                                    handleEndDateChange(user.id, e.target.value, user.is_child || false)
                                  }
                                  className="border border-gray-700 bg-black/40 text-white rounded px-2 py-1 focus:ring-2 focus:ring-brand-blue outline-none text-xs w-full cursor-pointer hover:bg-black/60 transition-colors"
                                  style={{
                                    colorScheme: 'dark'
                                  }}
                                />
                                <Calendar className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                              </div>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="px-3 md:px-4 py-3">
                            <div className="flex flex-col gap-2">
                              <span 
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${status.bgColor} ${status.color} border ${status.borderColor} whitespace-nowrap`}
                              >
                                {status.icon}
                                {status.label}
                                {status.days !== null && ` (${Math.abs(status.days)}d)`}
                              </span>
                              
                              {/* Email reminder button */}
                              {!user.is_child && status.days !== null && status.days <= 7 && (
                                <button
                                  onClick={() => sendReminderEmail(user.email, user.full_name, user.id)}
                                  disabled={sendingReminderId === user.id}
                                  title="Enviar recordatorio"
                                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 whitespace-nowrap disabled:opacity-50"
                                >
                                  {sendingReminderId === user.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Mail className="w-3 h-3" />
                                  )}
                                  Recordar
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Actions (Save & Delete) */}
                          <td className="px-3 md:px-4 py-3">
                            <div className="flex flex-col gap-2">
                              {hasUnsavedChanges(user.id) && (
                                <button
                                  onClick={() => saveProfileChanges(user.id, user.is_child || false)}
                                  disabled={savingProfileId === user.id}
                                  className="flex items-center gap-1 px-3 py-1 rounded-md bg-green-600/80 hover:bg-green-600 text-white text-xs font-semibold transition disabled:opacity-50 whitespace-nowrap"
                                >
                                  {savingProfileId === user.id ? (
                                    <>
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      Guardando...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="w-3 h-3" />
                                      Guardar
                                    </>
                                  )}
                                </button>
                              )}

                              <button
                                onClick={() => deleteUser(user.id, user.full_name, user.is_child || false)}
                                disabled={deletingUserId === user.id}
                                className="flex items-center gap-1 px-3 py-1 rounded-md bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold transition disabled:opacity-50 whitespace-nowrap"
                                title="Eliminar usuario"
                              >
                                {deletingUserId === user.id ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Eliminando...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="w-3 h-3" />
                                    Eliminar
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 py-6 text-sm text-gray-300">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="px-3 py-1 rounded-md bg-black/40 border border-gray-700 disabled:opacity-40 hover:bg-white/10 transition"
                >
                  ← Anterior
                </button>

                <span>
                  Página {currentPage} de {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="px-3 py-1 rounded-md bg-black/40 border border-gray-700 disabled:opacity-40 hover:bg-white/10 transition"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}