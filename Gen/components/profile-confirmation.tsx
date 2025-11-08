"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Calendar, User, Loader2, RefreshCcw } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ProfileConfirmationProps {
  username: string
  onConfirm: () => void
  onCancel: () => void
}

interface RobloxUser {
  id: number
  name: string
  displayName: string
  created: string | null
  avatarUrl: string | null
}

export function ProfileConfirmation({ username, onConfirm, onCancel }: ProfileConfirmationProps) {
  const [userData, setUserData] = useState<RobloxUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryAfter, setRetryAfter] = useState<number | null>(null)

  const fetchUserData = async () => {
    setLoading(true)
    setError(null)
    setRetryAfter(null)

    try {
      console.log("[Profile] fetching from /api/roblox-user:", username)
      const res = await fetch(`/api/roblox-user?username=${encodeURIComponent(username)}`, {
        cache: "no-store",
      })

      if (res.status === 404) {
        setError("Usuário não encontrado. Verifique o nome e tente novamente.")
        return
      }

      if (res.status === 429) {
        const data = await res.json().catch(() => ({}))
        setRetryAfter(data.retry_after_seconds ?? 10)
        setError("A API do Roblox está temporariamente limitando requisições. Tente novamente em alguns segundos.")
        return
      }

      if (!res.ok) {
        console.error("[Profile] erro HTTP:", res.status)
        setError("Erro temporário ao buscar informações. Tente novamente mais tarde.")
        return
      }

      const data = await res.json()
      const payload = {
        id: data.id,
        name: data.name,
        displayName: data.displayName,
        created: data.created,
        avatarUrl: data.avatarUrl,
      } as RobloxUser

      setUserData(payload)
      console.log("[Profile] dados recebidos:", payload)
    } catch (err) {
      console.error("[Profile] erro:", err)
      setError("Erro inesperado ao buscar o perfil. Verifique sua conexão.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [username])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Data não disponível"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    } catch {
      return "Data inválida"
    }
  }

  // ======================== Render ========================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-border shadow-2xl">
          <CardContent className="pt-12 pb-12 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-muted-foreground">Buscando dados do Roblox...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-destructive shadow-2xl">
          <CardContent className="pt-10 pb-10 flex flex-col items-center gap-5 text-center">
            <XCircle className="w-12 h-12 text-destructive" />
            <p className="text-destructive font-semibold">{error}</p>
            {retryAfter && (
              <p className="text-muted-foreground text-sm">
                Você poderá tentar novamente em aproximadamente <b>{retryAfter}</b> segundos.
              </p>
            )}
            <div className="flex gap-3 mt-4">
              <Button onClick={onCancel} variant="outline" className="bg-transparent">
                Voltar
              </Button>
              <Button
                onClick={fetchUserData}
                variant="default"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-2 border-border shadow-2xl">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-2xl font-bold">Confirmação de Perfil</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Este é o perfil correto?
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Avatar + Info */}
          <div className="flex flex-col items-center gap-4 pb-6 border-b border-border">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
              <Avatar className="relative w-24 h-24 border-4 border-primary shadow-lg">
                <AvatarImage src={userData.avatarUrl || "/placeholder.svg"} alt={userData.name} />
                <AvatarFallback className="text-2xl">
                  {userData.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-foreground">{userData.displayName}</h3>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                @{userData.name}
              </div>
              <Badge variant="secondary" className="mt-2">
                ID: {userData.id}
              </Badge>
            </div>
          </div>

          {/* Info da conta */}
          <div className="space-y-3 bg-secondary/50 p-4 rounded-lg">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-muted-foreground">Conta criada em</p>
                <p className="font-semibold text-foreground">{formatDate(userData.created)}</p>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 h-11 transition-all hover:scale-[1.02] active:scale-[0.98] border-2 bg-transparent"
            >
              <XCircle className="w-5 h-5 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 h-11 bg-green-600 hover:bg-green-700 text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Confirmar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
