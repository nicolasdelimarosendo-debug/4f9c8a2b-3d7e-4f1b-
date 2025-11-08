"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, KeyRound, Shield } from "lucide-react"

interface KeyAuthProps {
  onSuccess: () => void
}

export function KeyAuth({ onSuccess }: KeyAuthProps) {
  const [key, setKey] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log("[v0] Submitting key:", key)

      const response = await fetch("/api/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      })

      console.log("[v0] Response status:", response.status)
      const data = await response.json()
      console.log("[v0] Response data:", data)

      if (data.valid) {
        setTimeout(() => {
          onSuccess()
        }, 500)
      } else {
        setError("Chave inválida. Tente novamente.")
      }
    } catch (err) {
      console.error("[v0] Error during key validation:", err)
      setError("Erro ao validar a chave.")
    } finally {
      setTimeout(() => {
        setIsLoading(false)
      }, 500)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-2 border-border shadow-2xl">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-card p-4 rounded-full border-2 border-primary">
                <Shield className="w-12 h-12 text-primary" />
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-balance">Acesso Exclusivo Robux</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Insira sua chave de acesso premium para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Digite sua chave de acesso"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="pl-10 h-12 text-base bg-input border-2 border-border focus:border-primary transition-colors"
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive animate-shake">{error}</p>}
            </div>
            <Button
              type="submit"
              disabled={isLoading || !key}
              className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Verificando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  <span>Confirmar Acesso</span>
                </div>
              )}
            </Button>
          </form>
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              Apenas usuários com chaves válidas podem acessar
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
