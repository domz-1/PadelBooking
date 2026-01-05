import { create } from "zustand";
import { Venue, Booking } from "@/lib/schemas";

interface SlotInfo {
    venueId: number;
    time: string;
}

interface AdminCreateSlot {
    venueId: number;
    venueName: string;
    time: string;
}

interface BookingStoreState {
    // Selections
    selectedVenue: Venue | null;
    selectedBranchId: number | "all";
    selectedBooking: Booking | null;
    slotInfo: SlotInfo | null;
    adminCreateSlot: AdminCreateSlot | null;

    // Modals Visibility
    modals: {
        venueInfo: boolean;
        waitlist: boolean;
        management: boolean; // EditBookingDialog
        deleteConfirm: boolean;
        details: boolean; // BookingDetailsModal
        openMatch: boolean;
        convertToOpenMatch: boolean;
        adminCreate: boolean; // AdminCreateBookingDialog
    };

    // UI/Operation State
    editDuration: number;
    isEditing: boolean;
    openMatchMaxPlayers: number;
    isLoading: boolean;

    // Actions
    setSelectedVenue: (venue: Venue | null) => void;
    setSelectedBranchId: (id: number | "all") => void;
    setSelectedBooking: (booking: Booking | null) => void;
    setSlotInfo: (info: SlotInfo | null) => void;
    setAdminCreateSlot: (slot: AdminCreateSlot | null) => void;

    setModalOpen: (modal: keyof BookingStoreState["modals"], isOpen: boolean) => void;

    setEditDuration: (duration: number) => void;
    setIsEditing: (isEditing: boolean) => void;
    setOpenMatchMaxPlayers: (count: number) => void;
    setIsLoading: (isLoading: boolean) => void;

    reset: () => void;
}

const initialState = {
    selectedVenue: null,
    selectedBranchId: "all" as const,
    selectedBooking: null,
    slotInfo: null,
    adminCreateSlot: null,
    modals: {
        venueInfo: false,
        waitlist: false,
        management: false,
        deleteConfirm: false,
        details: false,
        openMatch: false,
        convertToOpenMatch: false,
        adminCreate: false,
    },
    editDuration: 1,
    isEditing: false,
    openMatchMaxPlayers: 4,
    isLoading: false,
};

export const useBookingStore = create<BookingStoreState>((set) => ({
    ...initialState,

    setSelectedVenue: (venue) => set({ selectedVenue: venue }),
    setSelectedBranchId: (id) => set({ selectedBranchId: id }),
    setSelectedBooking: (booking) => set({ selectedBooking: booking }),
    setSlotInfo: (info) => set({ slotInfo: info }),
    setAdminCreateSlot: (slot) => set({ adminCreateSlot: slot }),

    setModalOpen: (modal, isOpen) =>
        set((state) => ({ modals: { ...state.modals, [modal]: isOpen } })),

    setEditDuration: (duration) => set({ editDuration: duration }),
    setIsEditing: (isEditing) => set({ isEditing }),
    setOpenMatchMaxPlayers: (count) => set({ openMatchMaxPlayers: count }),
    setIsLoading: (isLoading) => set({ isLoading }),

    reset: () => set(initialState),
}));
