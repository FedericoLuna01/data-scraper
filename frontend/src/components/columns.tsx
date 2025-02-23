"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Result } from "@server/types/types"

export const columns: ColumnDef<Result>[] = [
  {
    accessorKey: "title",
    header: "Nombre",
  },
  {
    accessorKey: "url",
    header: "URL",
    cell: ({ row }) => {
      const { url } = row.original
      if (!url) return null
      return (
        <p className="truncate w-40">
          <a href={url} className="hover:underline text-blue-400">{url}</a>
        </p>
      )
    },
  },
  {
    accessorKey: "phone",
    header: "Teléfono",
    filterFn: (row, id, value: string[]) => {
      const hasPhone = Boolean(row.getValue(id))
      return value.includes(hasPhone.toString())
    },
    cell: ({ row }) => {
      const { phone } = row.original
      if (!phone) return <div className="text-muted-foreground">Sin celular</div>
      return (
        <p>
          {phone}
        </p>
      )
    }
  },
  {
    accessorKey: "stars",
    header: "Estrellas",
  },
  {
    accessorKey: "website",
    header: "Sitio web",
    filterFn: (row, id, value: string[]) => {
      const hasWebsite = Boolean(row.getValue(id))
      return value.includes(hasWebsite.toString())
    },
    cell: ({ row }) => {
      const { website } = row.original
      if (!website) return <div className="text-muted-foreground">Sin sitio web</div>
      return (
        <p className="truncate w-[20rem]">
          <a href={website} className="hover:underline text-blue-400">
            {website}
          </a>
        </p>
      )
    }
  }
]
