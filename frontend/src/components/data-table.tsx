"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "./ui/skeleton"
import { DataTablePagination } from "./ui/data-table-pagination"
import { Input } from "./ui/input"
import { useState } from "react"
import { Button } from "./ui/button"
import { DownloadIcon } from "lucide-react"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { phoneOptions, websiteOptions } from "@/constants/constants"
import { saveAs } from 'file-saver'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
}

function convertToCSV<TData>(data: TData[]) {
  const header = Object.keys(data[0] as Record<string, unknown>);
  const csvRows = [
    header.join(','), // header row first
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...data.map(row => header.map(fieldName => JSON.stringify((row as any)[fieldName] ?? '')).join(','))
  ];
  return csvRows.join('\r\n');
}

function downloadCSV<TData>(data: TData[]) {
  const csvData = convertToCSV(data);
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, 'data.csv');
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  )
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters
    }
  })

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Buscar nombre..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("title")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <DataTableFacetedFilter
            column={table.getColumn("website")}
            title="Sitio web"
            options={websiteOptions}
          />
          <DataTableFacetedFilter
            column={table.getColumn("phone")}
            title="Teléfono"
            options={phoneOptions}
          />
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            downloadCSV(data);
          }}
        >
          Descargar <DownloadIcon />
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Render skeleton loaders
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
