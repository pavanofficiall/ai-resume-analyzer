"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface Node {
  x: number
  y: number
  radius: number
  connections: number[]
  speed: number
  direction: number
}

export default function NeuralNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef<Node[]>([])
  const requestRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const updateCanvasSize = () => {
      if (canvas) {
        canvas.width = canvas.offsetWidth
        canvas.height = canvas.offsetHeight
      }
    }

    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)

    // Create nodes
    const createNodes = () => {
      const nodes: Node[] = []
      const nodeCount = 20

      for (let i = 0; i < nodeCount; i++) {
        const node: Node = {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 1,
          connections: [],
          speed: Math.random() * 0.5 + 0.1,
          direction: Math.random() * Math.PI * 2,
        }

        // Create connections to other nodes
        for (let j = 0; j < nodeCount; j++) {
          if (i !== j && Math.random() > 0.85) {
            node.connections.push(j)
          }
        }

        nodes.push(node)
      }

      return nodes
    }

    nodesRef.current = createNodes()

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections
      ctx.strokeStyle = "rgba(80, 200, 190, 0.2)"
      ctx.lineWidth = 0.5

      nodesRef.current.forEach((node, i) => {
        node.connections.forEach((j) => {
          const targetNode = nodesRef.current[j]
          ctx.beginPath()
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(targetNode.x, targetNode.y)
          ctx.stroke()
        })
      })

      // Draw and update nodes
      nodesRef.current.forEach((node) => {
        // Draw node
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 2)
        gradient.addColorStop(0, "rgba(80, 200, 190, 0.8)")
        gradient.addColorStop(1, "rgba(80, 200, 190, 0)")

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius * 2, 0, Math.PI * 2)
        ctx.fill()

        // Update position
        node.x += Math.cos(node.direction) * node.speed
        node.y += Math.sin(node.direction) * node.speed

        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) {
          node.direction = Math.PI - node.direction
        }
        if (node.y < 0 || node.y > canvas.height) {
          node.direction = -node.direction
        }
      })

      requestRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", updateCanvasSize)
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [])

  return (
    <motion.div
      className="absolute inset-0 z-0 opacity-70"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.7 }}
      transition={{ duration: 1 }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </motion.div>
  )
}
