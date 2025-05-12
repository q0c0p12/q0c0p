"use client"

import { Button } from "@/components/ui/button"

import * as React from "react"
import { cn } from "@/lib/utils"

const SidebarContext = React.createContext<{
  isOpen: boolean
  setOpen: (open: boolean) => void
}>({
  isOpen: false,
  setOpen: () => {},
})

const useSidebarContext = () => React.useContext(SidebarContext)

const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setOpen] = React.useState(false)

  const toggleSidebar = () => {
    setOpen(!isOpen)
  }

  return <SidebarContext.Provider value={{ isOpen, setOpen: toggleSidebar }}>{children}</SidebarContext.Provider>
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(({ className, ...props }, ref) => {
  return (
    <div
      className={cn(
        "hidden border-r bg-secondary h-screen fixed top-0 left-0 z-20 w-64 flex-col p-6 md:flex",
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
Sidebar.displayName = "Sidebar"

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const SidebarContent = React.forwardRef<HTMLDivElement, SidebarContentProps>(({ className, ...props }, ref) => {
  return <div className={cn("flex flex-col flex-1 space-y-2 p-6", className)} ref={ref} {...props} />
})
SidebarContent.displayName = "SidebarContent"

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const SidebarHeader = React.forwardRef<HTMLDivElement, SidebarHeaderProps>(({ className, ...props }, ref) => {
  return <div className={cn("flex items-center justify-between space-y-0 pb-2 pt-6", className)} ref={ref} {...props} />
})
SidebarHeader.displayName = "SidebarHeader"

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const SidebarFooter = React.forwardRef<HTMLDivElement, SidebarFooterProps>(({ className, ...props }, ref) => {
  return <div className={cn("flex items-center justify-between space-y-0 pb-2 pt-6", className)} ref={ref} {...props} />
})
SidebarFooter.displayName = "SidebarFooter"

interface SidebarMenuProps extends React.HTMLAttributes<HTMLUListElement> {}

const SidebarMenu = React.forwardRef<HTMLUListElement, SidebarMenuProps>(({ className, ...props }, ref) => {
  return <ul className={cn("list-none m-0 p-0", className)} ref={ref} {...props} />
})
SidebarMenu.displayName = "SidebarMenu"

interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLLIElement> {}

const SidebarMenuItem = React.forwardRef<HTMLLIElement, SidebarMenuItemProps>(({ className, ...props }, ref) => {
  return <li className={cn("", className)} ref={ref} {...props} />
})
SidebarMenuItem.displayName = "SidebarMenuItem"

interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean
  tooltip?: string
}

const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, isActive, tooltip, ...props }, ref) => {
    return (
      <button
        className={cn(
          "group relative flex w-full items-center rounded-md border border-transparent p-2 text-sm font-medium hover:bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 data-[active=true]:bg-secondary data-[active=true]:text-foreground",
          isActive && "bg-secondary text-foreground",
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
SidebarMenuButton.displayName = "SidebarMenuButton"

interface SidebarTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const SidebarTrigger = React.forwardRef<HTMLButtonElement, SidebarTriggerProps>(({ className, ...props }, ref) => {
  return (
    <Button variant="ghost" size="sm" className={cn("h-8 w-8 rounded-md", className)} ref={ref} {...props}>
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

export {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebarContext,
  SidebarContext,
  SidebarProvider,
}
