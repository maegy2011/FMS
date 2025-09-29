'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, TrendingUp, Users, FileText, Shield, Loader2 } from 'lucide-react'

interface LoadingPageProps {
  onComplete?: () => void
  duration?: number
}

export default function LoadingPage({ onComplete, duration = 3000 }: LoadingPageProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const loadingSteps = [
    { icon: Building2, title: 'تهيئة النظام', description: 'جاري تحميل مكونات النظام الأساسية' },
    { icon: Shield, title: 'التحقق من الأمان', description: 'جاري التحقق من إعدادات الأمان والصلاحيات' },
    { icon: Users, title: 'تحميل المستخدمين', description: 'جاري تحميل بيانات المستخدمين والجهات' },
    { icon: TrendingUp, title: 'تحليل البيانات', description: 'جاري تحليل البيانات المالية والإيرادات' },
    { icon: FileText, title: 'إعداد التقارير', description: 'جاري تجهيز نظام التقارير والتحليلات' },
  ]

  useEffect(() => {
    const stepDuration = duration / loadingSteps.length
    let stepTimer: NodeJS.Timeout
    let progressTimer: NodeJS.Timeout

    const updateProgress = () => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer)
          return 100
        }
        return prev + (100 / (duration / 50))
      })
    }

    progressTimer = setInterval(updateProgress, 50)

    const advanceStep = () => {
      if (currentStep < loadingSteps.length - 1) {
        setCurrentStep(prev => prev + 1)
        stepTimer = setTimeout(advanceStep, stepDuration)
      } else {
        setTimeout(() => {
          setIsLoading(false)
          onComplete?.()
        }, 500)
      }
    }

    stepTimer = setTimeout(advanceStep, stepDuration)

    return () => {
      clearTimeout(stepTimer)
      clearInterval(progressTimer)
    }
  }, [currentStep, duration, onComplete, loadingSteps.length])

  if (!isLoading) return null

  const CurrentIcon = loadingSteps[currentStep].icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center egyptian-pattern">
      <div className="w-full max-w-md mx-auto p-8">
        {/* Logo and Title */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-24 h-24 mx-auto mb-6 egyptian-glow rounded-2xl flex items-center justify-center egyptian-border egyptian-motif"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-egyptian-gold to-egyptian-sand rounded-xl flex items-center justify-center">
              <Building2 className="w-10 h-10 text-egyptian-stone" />
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl font-bold egyptian-gold mb-2"
          >
            نظام الإدارة المالية
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-lg text-muted-foreground font-medium"
          >
            FMS | الطراز المصري الإسلامي
          </motion.p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span className="font-medium">جاري التحميل...</span>
            <span className="egyptian-gold font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden egyptian-border">
            <motion.div
              className="h-full bg-gradient-to-r from-egyptian-gold via-egyptian-blue to-egyptian-green rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Loading Steps */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="egyptian-card egyptian-border egyptian-corner p-6 shadow-lg"
            >
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-14 h-14 bg-gradient-to-br from-egyptian-gold/20 to-egyptian-blue/20 rounded-xl flex items-center justify-center egyptian-border"
                >
                  <CurrentIcon className="w-8 h-8 text-egyptian-gold" />
                </motion.div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-1 egyptian-gold">
                    {loadingSteps[currentStep].title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    {loadingSteps[currentStep].description}
                  </p>
                </div>
                
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="text-egyptian-gold"
                >
                  <Loader2 className="w-6 h-6" />
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-3 mt-8">
          {loadingSteps.map((_, index) => (
            <motion.div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index <= currentStep 
                  ? 'bg-gradient-to-r from-egyptian-gold to-egyptian-blue shadow-lg' 
                  : 'bg-muted'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
            />
          ))}
        </div>

        {/* Decorative Elements */}
        <div className="flex justify-center mt-6 space-x-4 space-x-reverse">
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-2xl text-egyptian-gold/60"
          >
            ◊
          </motion.div>
          <motion.div
            animate={{ y: [5, -5, 5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="text-2xl text-egyptian-blue/60"
          >
            ◈
          </motion.div>
          <motion.div
            animate={{ y: [-3, 3, -3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="text-2xl text-egyptian-green/60"
          >
            ◊
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-8 text-sm text-muted-foreground"
        >
          <p className="egyptian-gold font-medium">مصمم بالطراز المصري الإسلامي الحديث</p>
          <p className="mt-1 text-xs">© 2024 نظام الإدارة المالية | جميع الحقوق محفوظة</p>
        </motion.div>
      </div>
    </div>
  )
}