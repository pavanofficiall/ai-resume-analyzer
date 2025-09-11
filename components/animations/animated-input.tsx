"use client"

import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AnimatedInputProps {
  id: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  name: string
  type?: string
  placeholder?: string
  required?: boolean
}

export default function AnimatedInput({
  id,
  label,
  value,
  onChange,
  name,
  type = "text",
  placeholder,
  required = false,
}: AnimatedInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <motion.div
        whileFocus={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <Input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full"
        />
      </motion.div>
    </div>
  )
}
