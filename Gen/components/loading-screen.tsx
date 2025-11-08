"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Shield } from "lucide-react"

interface LoadingScreenProps {
  username: string
  message?: string
}

export function LoadingScreen({ username, message }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse delay-500" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-2 border-border shadow-2xl">
        <CardContent className="pt-12 pb-12">
          <div className="flex flex-col items-center gap-8">
            {/* Animated icon */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-pulse" />
              <div className="relative">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
              </div>
            </div>

            {/* Loading text */}
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold text-foreground">{message || "Carregando Perfil"}</h2>
              {!message && (
                <p className="text-muted-foreground">
                  Buscando informações de <span className="text-primary font-semibold">{username}</span>
                </p>
              )}
            </div>

            {/* Progress dots */}
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-100" />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-200" />
            </div>

            {/* Shield icon */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Conexão segura</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
