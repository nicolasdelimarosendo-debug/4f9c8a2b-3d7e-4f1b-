"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface RobuxSelectionProps {
  onConfirm: (amount: number) => void
}

const ROBUX_OPTIONS = [1400, 2800, 4500, 7200, 9800]

export function RobuxSelection({ onConfirm }: RobuxSelectionProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)

  const handleConfirm = () => {
    if (selected !== null) {
      setIsConfirming(true)
      setTimeout(() => {
        onConfirm(selected)
      }, 800)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-2 border-border shadow-2xl">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-xl" />
              <Coins className="relative w-12 h-12 text-yellow-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-balance">Selecione a Quantidade de Robux</CardTitle>
          <CardDescription className="text-base">Escolha quanto Robux você deseja receber</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Robux options */}
          <div className="space-y-3">
            {ROBUX_OPTIONS.map((amount) => (
              <button
                key={amount}
                onClick={() => setSelected(amount)}
                className={cn(
                  "w-full p-4 rounded-lg border-2 transition-all duration-300",
                  "flex items-center justify-between group",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  selected === amount
                    ? "border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20"
                    : "border-border bg-secondary/50 hover:border-primary hover:bg-secondary",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                      selected === amount ? "bg-green-500 scale-110" : "bg-primary/20 group-hover:bg-primary/30",
                    )}
                  >
                    <Coins
                      className={cn("w-5 h-5 transition-colors", selected === amount ? "text-white" : "text-primary")}
                    />
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-bold text-foreground">{amount.toLocaleString("pt-BR")} Robux</p>
                    <p className="text-xs text-muted-foreground">Valor premium</p>
                  </div>
                </div>
                {selected === amount && <CheckCircle2 className="w-6 h-6 text-green-500 animate-in zoom-in" />}
              </button>
            ))}
          </div>

          {/* Confirm button */}
          <Button
            onClick={handleConfirm}
            disabled={selected === null || isConfirming}
            className={cn(
              "w-full h-12 text-base font-semibold transition-all",
              "bg-green-600 hover:bg-green-700 text-white",
              "hover:scale-[1.02] active:scale-[0.98]",
              "shadow-lg hover:shadow-xl",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
            )}
          >
            {isConfirming ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Confirmando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Confirmar Seleção
              </>
            )}
          </Button>

          {selected === null && (
            <p className="text-center text-sm text-muted-foreground">Selecione uma opção para continuar</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
