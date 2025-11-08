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
  mock?: boolean
}

export function ProfileConfirmation({ username, onConfirm, onCancel }: ProfileConfirmationProps) {
  const [userData, setUserData] = useState<RobloxUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  const fetchUserData = async () => {
    setLoading(true)
    setError(null)
    try {
      // chamada para rota local (mock segura)
      const res = await fetch(`/api/roblox-user?username=${encodeURIComponent(username)}`, { cache: "no-store" })
      if (!res.ok) {
        // caso improvável: convertemos em fallback suave
        setError("Não foi possível obter o perfil. Mostrando informações padrão.")
        // construir fallback local
        const fallback: RobloxUser = {
          id: Date.now(),
          name: username.toLowerCase().replace(/\s+/g, ""),
          displayName: username,
          created: new Date().toISOString(),
          avatarUrl: "/placeholder.svg",
          mock: true,
        }
        setUserData(fallback)
        return
      }
      const json = await res.json()
      // json vem do route.ts (mock)
      const payload: RobloxUser = {
        id: json.id,
        name: json.name,
        displayName: json.displayName,
        created: json.created,
        avatarUrl: json.avatarUrl,
        mock: json.mock ?? false,
      }
      setUserData(payload)
    } catch (err) {
      console.error("Erro fetching profile (client):", err)
      // fallback robusto
      setError("Erro na conexão. Usando dados locais temporários.")
      setUserData({
        id: Date.now(),
        name: username.toLowerCase().replace(/\s+/g, ""),
        displayName: username,
        created: new Date().toISOString(),
        avatarUrl: "/placeholder.svg",
        mock: true,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, attempt])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Data não disponível"
    try {
      const d = new Date(dateString)
      return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    } catch {
      return "Data inválida"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-border shadow-2xl">
          <CardContent className="pt-12 pb-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-muted-foreground">Carregando dados...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !userData) {
    // caso improvável, mostramos mensagem e botões
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-destructive shadow-2xl">
          <CardContent className="pt-12 pb-12">
            <div className="flex flex-col items-center gap-4">
              <XCircle className="w-12 h-12 text-destructive" />
              <p className="text-destructive font-semibold">{error}</p>
              <div className="flex gap-3 mt-4">
                <Button onClick={onCancel} variant="outline" className="bg-transparent">Voltar</Button>
                <Button onClick={() => setAttempt((s) => s + 1)} className="bg-green-600 text-white">
                  <RefreshCcw className="w-4 h-4 mr-2" /> Tentar novamente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // userData está definido (mock ou real)
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-2 border-border shadow-2xl">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-2xl font-bold text-balance">Confirmação de Perfil</CardTitle>
          <CardDescription className="text-base">Este é o perfil correto?</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4 pb-6 border-b border-border">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
              <Avatar className="relative w-24 h-24 border-4 border-primary shadow-lg">
                <AvatarImage src={userData?.avatarUrl || "/placeholder.svg"} alt={userData?.name ?? "avatar"} />
                <AvatarFallback className="text-2xl">{(userData?.name ?? "U").charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-foreground">{userData?.displayName}</h3>
              <div className="flex items-center justify-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">@{userData?.name}</p>
              </div>
              <Badge variant="secondary" className="mt-2">ID: {userData?.id}</Badge>
            </div>
          </div>

          <div className="space-y-3 bg-secondary/50 p-4 rounded-lg">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-muted-foreground">Conta criada em</p>
                <p className="font-semibold text-foreground">{formatDate(userData?.created ?? null)}</p>
              </div>
            </div>
            {userData?.mock && (
              <p className="text-xs text-muted-foreground mt-2">(Dados demonstrativos — ambiente seguro)</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={onCancel} variant="outline" className="flex-1 h-11 transition-all hover:scale-[1.02] active:scale-[0.98] border-2 bg-transparent">
              <XCircle className="w-5 h-5 mr-2" /> Cancelar
            </Button>
            <Button onClick={onConfirm} className="flex-1 h-11 bg-green-600 hover:bg-green-700 text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl">
              <CheckCircle2 className="w-5 h-5 mr-2" /> Confirmar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
