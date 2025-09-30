'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RefreshCw } from 'lucide-react'

interface CaptchaProps {
  onVerify: (isValid: boolean) => void
  reset?: boolean
}

export function Captcha({ onVerify, reset = false }: CaptchaProps) {
  const [captchaText, setCaptchaText] = useState('')
  const [userInput, setUserInput] = useState('')
  const [isVerified, setIsVerified] = useState(false)

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCaptchaText(result)
    setUserInput('')
    setIsVerified(false)
    onVerify(false)
  }

  useEffect(() => {
    generateCaptcha()
  }, [])

  useEffect(() => {
    if (reset) {
      generateCaptcha()
    }
  }, [reset])

  const verifyCaptcha = () => {
    const isValid = userInput === captchaText
    setIsVerified(isValid)
    onVerify(isValid)
    
    if (!isValid) {
      setUserInput('')
      generateCaptcha()
    }
  }

  const handleInputChange = (value: string) => {
    setUserInput(value)
    if (isVerified) {
      setIsVerified(false)
      onVerify(false)
    }
  }

  return (
    <div className="space-y-3">
      <Label htmlFor="captcha">التحقق من الإنسان (CAPTCHA)</Label>
      <div className="flex items-center gap-3">
        <div className="relative">
          <div 
            className="bg-gray-100 border-2 border-gray-300 rounded-lg px-4 py-2 font-mono text-lg font-bold text-gray-700 select-none"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 2px,
                rgba(0,0,0,.03) 2px,
                rgba(0,0,0,.03) 4px
              )`,
              letterSpacing: '2px'
            }}
          >
            {captchaText}
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-px bg-gray-400 opacity-30"
                style={{
                  top: `${25 + (i * 25)}%`,
                  transform: `rotate(${Math.random() * 30 - 15}deg)`
                }}
              />
            ))}
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={generateCaptcha}
          className="shrink-0"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex gap-2">
        <Input
          id="captcha"
          value={userInput}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="أدخل النص الموضح أعلاه"
          className={isVerified ? 'border-green-500' : ''}
          maxLength={6}
        />
        <Button
          type="button"
          onClick={verifyCaptcha}
          disabled={!userInput || userInput.length !== 6}
          variant={isVerified ? "default" : "outline"}
          className={isVerified ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          {isVerified ? '✓' : 'تحقق'}
        </Button>
      </div>
      {!isVerified && userInput && userInput.length === 6 && (
        <p className="text-sm text-red-600">النص المدخل غير متطابق</p>
      )}
      {isVerified && (
        <p className="text-sm text-green-600">تم التحقق بنجاح</p>
      )}
    </div>
  )
}