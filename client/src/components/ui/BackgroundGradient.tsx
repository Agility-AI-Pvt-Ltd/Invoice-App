"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import React from "react"

interface BackgroundGradientProps {
  children?: React.ReactNode
  className?: string
  containerClassName?: string
  animate?: boolean
}

const BackgroundGradient: React.FC<BackgroundGradientProps> = ({
  children,
  className,
  containerClassName,
  animate = true,
}) => {
  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    },
  }

  // 🎨 New palette-friendly gradients
  const gradientClass = cn(
    "bg-[radial-gradient(circle_farthest-side_at_0_100%,#5e5ce6,transparent),radial-gradient(circle_farthest-side_at_100%_0,#7b61ff,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#e87dff,transparent),radial-gradient(circle_farthest-side_at_0_0,#2e1065,#141316)]"
  )

  return (
    <div className={cn("relative p-[4px] group", containerClassName)}>
      {/* Animated Blur Background */}
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? {
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
              }
            : undefined
        }
        style={{
          backgroundSize: animate ? "400% 400%" : undefined,
        }}
        className={cn(
          "absolute inset-0 rounded-3xl z-[1] opacity-60 group-hover:opacity-100 blur-xl transition duration-500 will-change-transform",
          gradientClass
        )}
      />

      {/* Static Backup Layer */}
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? {
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
              }
            : undefined
        }
        style={{
          backgroundSize: animate ? "400% 400%" : undefined,
        }}
        className={cn(
          "absolute inset-0 rounded-3xl z-[1] will-change-transform",
          gradientClass
        )}
      />

      {/* Content */}
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  )
}

export default BackgroundGradient