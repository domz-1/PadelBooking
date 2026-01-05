"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Offer, adminOfferService } from "@/lib/services/admin/offers.service";

import Image from "next/image";

export const columns: ColumnDef<Offer>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <span className="text-muted-foreground">#{row.getValue("id")}</span>
    ),
  },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const img = row.getValue("image") as string;
      return img ? (
        <div className="w-16 h-10 rounded overflow-hidden">
          <Image
            src={img}
            alt="Offer"
            width={64}
            height={40}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">No Img</span>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("title")}</span>
    ),
  },
  {
    accessorKey: "discountPercentage",
    header: "Discount",
    cell: ({ row }) => (
      <span className="text-green-600 font-bold">
        {row.getValue("discountPercentage")}%
      </span>
    ),
  },
  {
    accessorKey: "validUntil",
    header: "Valid Until",
    cell: ({ row }) => (
      <span>{new Date(row.getValue("validUntil")).toLocaleDateString()}</span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <OfferActions offer={row.original} />,
  },
];

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

function OfferActions({ offer }: { offer: Offer }) {
  const handleDelete = async () => {
    try {
      await adminOfferService.delete(offer.id);
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ConfirmDialog
      title="Delete Offer"
      description="Are you sure you want to delete this offer?"
      onConfirm={handleDelete}
    >
      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
        <Trash className="h-4 w-4" />
      </Button>
    </ConfirmDialog>
  );
}
