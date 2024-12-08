import { redirect } from "next/navigation"

import Blackjack from "~/app/minigames/blackjack/blackjack"
import { getCurrentBalanceAction } from "~/hooks/bet/actions"

import MinigameTable from "../table"

async function BlackjackPage() {
  const [balance] = await getCurrentBalanceAction()

  if (balance === null || balance === undefined) {
    return redirect("/")
  }

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-3 h-screen">
      <div className="flex flex-col col-span-2 items-center justify-start p-4">
        <Blackjack balance={balance} minigameId={1} />
      </div>
      <div className="w-full h-full flex items-center px-10 xl:px-0 flex-col justify-center gap-2">
        <h1 className="w-full font-alagard text-xl">Top profit.</h1>
        <MinigameTable minigameId={1} />
      </div>
    </div>
  )
}

export default BlackjackPage
