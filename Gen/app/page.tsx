"use client"

import { useState } from "react"
import { KeyAuth } from "@/components/key-auth"
import { UsernameInput } from "@/components/username-input"
import { LoadingScreen } from "@/components/loading-screen"
import { ProfileConfirmation } from "@/components/profile-confirmation"
import { RobuxSelection } from "@/components/robux-selection"
import { GroupWarning } from "@/components/group-warning"

type Step =
  | "key"
  | "username"
  | "loading"
  | "confirmation"
  | "loadingRobux"
  | "robuxSelection"
  | "loadingGroup"
  | "groupWarning"

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>("key")
  const [username, setUsername] = useState("")
  const [selectedRobux, setSelectedRobux] = useState<number | null>(null)

  const handleKeySuccess = () => {
    setCurrentStep("username")
  }

  const handleUsernameSubmit = (user: string) => {
    setUsername(user)
    setCurrentStep("loading")
    setTimeout(() => {
      setCurrentStep("confirmation")
    }, 3000)
  }

  const handleConfirm = () => {
    setCurrentStep("loadingRobux")
    setTimeout(() => {
      setCurrentStep("robuxSelection")
    }, 2000)
  }

  const handleCancel = () => {
    setCurrentStep("username")
    setUsername("")
  }

  const handleRobuxConfirm = (amount: number) => {
    setSelectedRobux(amount)
    setCurrentStep("loadingGroup")
    setTimeout(() => {
      setCurrentStep("groupWarning")
    }, 2500)
  }

  if (currentStep === "key") {
    return <KeyAuth onSuccess={handleKeySuccess} />
  }

  if (currentStep === "username") {
    return <UsernameInput onSubmit={handleUsernameSubmit} />
  }

  if (currentStep === "loading") {
    return <LoadingScreen username={username} />
  }

  if (currentStep === "confirmation") {
    return <ProfileConfirmation username={username} onConfirm={handleConfirm} onCancel={handleCancel} />
  }

  if (currentStep === "loadingRobux") {
    return <LoadingScreen username={username} message="Preparando opções de Robux..." />
  }

  if (currentStep === "robuxSelection") {
    return <RobuxSelection onConfirm={handleRobuxConfirm} />
  }

  if (currentStep === "loadingGroup") {
    return <LoadingScreen username={username} message="Verificando grupo..." />
  }

  if (currentStep === "groupWarning") {
    return <GroupWarning username={username} robuxAmount={selectedRobux || 0} />
  }

  return null
}
