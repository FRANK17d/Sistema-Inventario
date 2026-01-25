"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { cn } from "@/lib/utils"

interface ShellProps {
    children: React.ReactNode
}

export function Shell({ children }: ShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden cursor-pointer"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Fixed */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-50 lg:static lg:z-0 transform transition-transform duration-300",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen">
                {/* Header - Sticky */}
                <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                {/* Scrollable Content */}
                <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
