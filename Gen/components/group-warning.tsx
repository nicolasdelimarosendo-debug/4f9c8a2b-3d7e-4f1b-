"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Users, ExternalLink, Search, ShieldAlert } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface GroupWarningProps {
  username: string
  robuxAmount: number
}

const GROUP_LINK = "https://www.roblox.com.ml/communities/5771900249/Generator-Robux"

export function GroupWarning({ username, robuxAmount }: GroupWarningProps) {
  const handleJoinGroup = () => {
    window.open(GROUP_LINK, "_blank")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-2 border-orange-500 shadow-2xl">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl animate-pulse" />
              <AlertTriangle className="relative w-16 h-16 text-orange-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-balance text-orange-500">Aviso Importante!</CardTitle>
          <CardDescription className="text-base">Você precisa estar no grupo para receber os Robux</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User info summary */}
          <div className="bg-secondary/50 p-4 rounded-lg space-y-2 border border-border">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Usuário:</span>
              <span className="font-semibold text-foreground">{username}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Robux selecionado:</span>
              <span className="font-bold text-green-500">{robuxAmount.toLocaleString("pt-BR")} R$</span>
            </div>
          </div>

          {/* Warning alerts */}
          <div className="space-y-3">
            <Alert className="border-orange-500/50 bg-orange-500/5">
              <Users className="h-4 w-4 text-orange-500" />
              <AlertDescription className="text-sm">
                <strong className="text-orange-500">Grupo Obrigatório:</strong> Você precisa estar no nosso grupo do
                Roblox para receber os Robux.
              </AlertDescription>
            </Alert>

            <Alert className="border-red-500/50 bg-red-500/5">
              <ShieldAlert className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-sm">
                <strong className="text-red-500">Grupo Não Verificado:</strong> Nosso grupo não possui verificação do
                Roblox.
              </AlertDescription>
            </Alert>

            <Alert className="border-blue-500/50 bg-blue-500/5">
              <Search className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-sm">
                <strong className="text-blue-500">Não Aparece na Busca:</strong> O grupo não aparece na aba de busca das
                comunidades do Roblox. Use o link direto abaixo!
              </AlertDescription>
            </Alert>
          </div>

          {/* Instructions */}
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Como entrar no grupo:
            </h3>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Clique no botão abaixo para acessar o grupo</li>
              <li>Você será redirecionado para a página do grupo</li>
              <li>Clique em "Participar" no grupo do Roblox</li>
              <li>Após entrar, você poderá receber seus Robux!</li>
            </ol>
          </div>

          <Button
            onClick={handleJoinGroup}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            Grupo Aqui
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Clique no botão acima para acessar o grupo via link direto
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
