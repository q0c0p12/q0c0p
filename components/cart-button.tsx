"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"

export function CartButton() {
  const [cartCount, setCartCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getCartCount = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        const { count } = await supabase
          .from("cart_items")
          .select("*", { count: "exact", head: true })
          .eq("user_id", session.user.id)

        setCartCount(count || 0)
      }

      setLoading(false)
    }

    getCartCount()

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      getCartCount()
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <Button variant="ghost" size="icon" asChild className="relative">
      <Link href="/cart">
        <ShoppingCart className="h-5 w-5" />
        {cartCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-xs text-white">
            {cartCount}
          </span>
        )}
        <span className="sr-only">장바구니</span>
      </Link>
    </Button>
  )
}
