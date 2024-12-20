"use client"

import React, { useState } from "react"
import NumberFlow from "@number-flow/react"
import { useServerAction } from "zsa-react"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { betTransaction } from "~/hooks/bet/actions"
import { useToast } from "~/hooks/use-toast"

import { MinigameProps } from "../actions"

type Card = {
  suit: string
  value: string
  score: number
}

type Player = {
  hand: Card[]
  score: number
}

const suits = ["♠", "♣", "♥", "♦"]
const values = [
  { value: "A", score: 11 },
  { value: "2", score: 2 },
  { value: "3", score: 3 },
  { value: "4", score: 4 },
  { value: "5", score: 5 },
  { value: "6", score: 6 },
  { value: "7", score: 7 },
  { value: "8", score: 8 },
  { value: "9", score: 9 },
  { value: "10", score: 10 },
  { value: "J", score: 10 },
  { value: "Q", score: 10 },
  { value: "K", score: 10 },
]

const multiplier = 1.8

const BlackjackGame: React.FC<MinigameProps> = ({ balance, minigameId }) => {
  const [player, setPlayer] = useState<Player>({ hand: [], score: 0 })
  const [dealer, setDealer] = useState<Player>({ hand: [], score: 0 })
  const [deck, setDeck] = useState<Card[]>([])
  const [gameOver, setGameOver] = useState(false)
  const [dealerRevealed, setDealerRevealed] = useState(false)
  const [bet, setBet] = useState<number>(100)
  const [playerMoney, setPlayerMoney] = useState<number>(balance)
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false)
  const [isInstructionsVisible, setIsInstructionsVisible] =
    useState<boolean>(false) // State for instructions visibility
  const { toast } = useToast()

  const { execute: updateBet } = useServerAction(betTransaction)

  const initializeDeck = (): Card[] => {
    const deck: Card[] = []
    suits.forEach((suit) => {
      values.forEach(({ value, score }) => {
        deck.push({ suit, value, score })
      })
    })
    return shuffleDeck(deck)
  }

  const shuffleDeck = (deck: Card[]): Card[] => {
    return deck.sort(() => Math.random() - 0.5)
  }

  const startGame = () => {
    setIsGameRunning(true)
    const betAmount = Number(bet)

    // Allow the bet to be less than 100 only if the balance is less than 100
    if (betAmount < 100 && playerMoney >= 100) {
      toast({
        title: "Invalid Bet",
        description: "The minimum bet is 100.",
        variant: "destructive",
      })
      setIsGameRunning(false)
      return
    }

    // If the player's balance is less than 100, allow any bet less than their remaining balance
    if (betAmount > playerMoney) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance to place this bet.",
        variant: "destructive",
      })
      setIsGameRunning(false)
      return
    }

    // Deduct the bet amount from the player's balance
    setPlayerMoney((prev) => prev - betAmount)

    const newDeck = initializeDeck()
    const playerHand = [newDeck.pop()!, newDeck.pop()!]
    const dealerHand = [newDeck.pop()!, newDeck.pop()!]
    setPlayer({ hand: playerHand, score: calculateScore(playerHand) })
    setDealer({ hand: dealerHand, score: calculateScore(dealerHand) })
    setDeck(newDeck)
    setGameOver(false)
    setDealerRevealed(false)
  }

  const calculateScore = (hand: Card[]): number => {
    let score = hand.reduce((acc, card) => acc + card.score, 0)
    let aces = hand.filter((card) => card.value === "A").length
    while (score > 21 && aces) {
      score -= 10
      aces -= 1
    }
    return score
  }

  const drawCard = (
    player: Player,
    setPlayer: React.Dispatch<React.SetStateAction<Player>>
  ) => {
    if (deck.length > 0) {
      const card = deck.pop()!
      const newHand = [...player.hand, card]
      const newScore = calculateScore(newHand)
      setPlayer({ hand: newHand, score: newScore })
    }
  }

  const handleStand = () => {
    let dealerScore = dealer.score
    while (dealerScore < 17 && deck.length > 0) {
      drawCard(dealer, setDealer)
      dealerScore = calculateScore(dealer.hand)
    }
    setDealerRevealed(true)
    setGameOver(true)
    calculateWinner()
  }

  const calculateWinner = () => {
    if (
      dealer.score > 21 ||
      (player.score > dealer.score && player.score <= 21)
    ) {
      updateBet({
        betAmount: Number(bet),
        minigameId: minigameId,
        multiplier: multiplier,
        betResult: "win",
      })
      // เพิ่มเงินกลับเมื่อชนะ
      setPlayerMoney((prev) => prev + Number(bet) * (1 + multiplier))
    } else if (player.score === dealer.score) {
      // กรณีเสมอ คืนเงินเดิมพันกลับ
      updateBet({
        betAmount: Number(bet),
        minigameId: minigameId,
        multiplier: 0, // ไม่มีผลกำไรหรือขาดทุน
        betResult: "loss", // ใช้ "loss" แทน "tie"
      })
      setPlayerMoney((prev) => prev + Number(bet)) // คืนเงินเดิมพัน
    } else if (player.score < dealer.score || player.score > 21) {
      updateBet({
        betAmount: Number(bet),
        minigameId: minigameId,
        multiplier: -1,
        betResult: "loss",
      })
      // ไม่ทำอะไรเพราะเงินเดิมพันถูกหักไปแล้วใน startGame
    }

    setIsGameRunning(false)
  }

  const renderResult = () => {
    if (player.score > 21) return "You Bust! Dealer Wins!"
    if (dealer.score > 21) return "Dealer Busts! You Win!"
    if (player.score === dealer.score) return "It's a Tie!"
    return player.score > dealer.score ? "You Win!" : "Dealer Wins!"
  }

  const calculateDealerVisibleScore = (hand: Card[]): number => {
    const visibleHand = dealerRevealed ? hand : hand.slice(1)
    return calculateScore(visibleHand)
  }

  const handleToggleInstructions = () => {
    setIsInstructionsVisible(!isInstructionsVisible)
  }

  return (
    <div className="w-full flex flex-col">
      <h1 className="text-4xl font-alagard font-normal">Blackjack</h1>
      <h1>win : {multiplier}</h1>
      <div className="my-4">
        <h3 className="text-xl">
          Your Money: <NumberFlow value={playerMoney} />
        </h3>
        {!isGameRunning && (
          <div className="flex">
            <Input
              type="number"
              value={bet}
              onChange={(e) => setBet(Number(e.target.value))}
              placeholder="Enter Bet"
              disabled={isGameRunning}
              className="text-lg px-4 py-2 border border-gray-300 rounded mr-2"
            />
            <div className="flex flex-row gap-2">
              <Button onClick={startGame} disabled={isGameRunning}>
                Start Game
              </Button>
              <Button
                onClick={() => {
                  setBet(playerMoney)
                }}
                disabled={isGameRunning}
              >
                All In
              </Button>
              {/* How to Play Button */}
              <Button onClick={handleToggleInstructions}>How to Play</Button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions Modal or Text */}
      {isInstructionsVisible && (
        <div className="my-4 p-4 border border-gray-300 rounded">
          <h3 className="text-2xl font-bold">How to Play</h3>
          <p className="text-lg">
            1. Place a bet to start the game. <br />
            2. You and the dealer will be dealt two cards each. <br />
            3. Try to get as close to 21 points as possible without going over.
            Aces can be worth 1 or 11 points. <br />
            4. You can &quot;Hit&quot; to draw more cards or &quot;Stand&quot;
            to stop drawing. <br />
            5. If you go over 21 points, you lose. If the dealer goes over 21,
            you win! <br />
            6. The dealer will reveal their second card and keep drawing cards
            until they reach at least 17 points. <br />
            7. If your hand beats the dealer&apos;s hand, you win the bet.
          </p>
          <Button onClick={handleToggleInstructions}>Close</Button>
        </div>
      )}

      <div className="my-4">
        <h2 className="text-2xl font-alagard">Player&#39;s Hand</h2>
        <div>
          {player.hand.map((card, i) => (
            <span key={i} className="text-lg">
              {card.value + card.suit.replace("'", "&#39;")}{" "}
            </span>
          ))}
        </div>
        <p className="text-xl">Score: {player.score}</p>
        {isGameRunning && (
          <>
            <Button
              onClick={() => drawCard(player, setPlayer)}
              disabled={gameOver || player.score > 21}
            >
              Hit
            </Button>
            <Button
              variant="destructive"
              onClick={handleStand}
              disabled={gameOver}
            >
              Stand
            </Button>
          </>
        )}
      </div>
      <div className="my-4">
        <h2 className="text-2xl font-alagard">Dealer&#39;s Hand</h2>
        <div>
          {dealer.hand.map((card, i) => {
            if (i === 0 && !dealerRevealed) {
              return (
                <span key={i} className="text-lg">
                  🂠{" "}
                </span>
              )
            }
            return (
              <span key={i} className="text-lg">
                {card.value + card.suit.replace("'", "&#39;")}{" "}
              </span>
            )
          })}
        </div>
        <p className="text-xl">
          Score:{" "}
          {dealerRevealed
            ? dealer.score
            : calculateDealerVisibleScore(dealer.hand)}
        </p>
      </div>
      {gameOver && <h2 className="text-4xl font-alagard">{renderResult()}</h2>}
    </div>
  )
}

export default BlackjackGame
