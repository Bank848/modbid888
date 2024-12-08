"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"

import { DataTable } from "~/components/table/data-table"
import { Button } from "~/components/ui/button"
import { Profiles } from "~/db/schema"
import { useServerActionQuery } from "~/hooks/server-action-hooks"

import { getLeaderboardAction } from "./action"

const columns: ColumnDef<Profiles>[] = [
  {
    accessorKey: "displayName",
    header: "Display Name",
    cell: ({ row }) => (
      <p className="font-alagard text-2xl">
        {row.original.displayName}#{row.original.id}
      </p>
    ),
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => (
      <p className="font-alagard text-2xl">{row.original.balance}</p>
    ),
  },
]

function LeaderboardPage() {
  const { data } = useServerActionQuery(getLeaderboardAction, {
    input: undefined,
    queryKey: ["leaderboard"],
  })

  if (!data) {
    return (
      <p className="w-full h-screen flex items-center justify-center font-alagard text-6xl">
        loading...
      </p>
    )
  }

  return (
    <div className="w-full h-screen flex flex-col gap-11 justify-center items-center">
      <div className="flex flex-col gap-11 justify-center w-[50vw]">
        <h1 className="font-alagard text-5xl">Leaderboard</h1>
        <DataTable columns={columns} data={data} />
        <div className="w-full flex flex-row justify-end gap-4">
          <Link href="/sign-in">
            <Button variant="outline" className="font-alagard">
              go to minigames
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button variant="outline" className="font-alagard">
              no account? sign-up!
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
export default LeaderboardPage
