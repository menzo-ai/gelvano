'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import Avatar from '@/components/ui/avatar'
import { Bell, Search, LogOut, User, Settings, Moon, Sun } from 'lucide-react'

interface TopBarProps {
  title?: string
}

export default function TopBar({ title }: TopBarProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)
  const [isDark, setIsDark] = useState(true)

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-20 bg-background-dark/80 backdrop-blur-xl border-b border-slate-700/50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Title */}
        <h1 className="text-xl font-bold">{title || 'لوحة التحكم'}</h1>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="بحث..."
              className="w-64 pl-4 pr-10 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-sm placeholder:text-slate-500 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-slate-700/50 transition-colors">
            <Bell className="w-5 h-5 text-slate-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-slate-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              <Avatar
                src={session?.user?.image}
                name={session?.user?.name || 'User'}
                size="sm"
              />
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium">{session?.user?.name}</p>
                <p className="text-xs text-slate-500">
                  {session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN'
                    ? 'مدير'
                    : 'طالب'}
                </p>
              </div>
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute left-0 mt-2 w-48 bg-surface-dark rounded-lg border border-slate-700 shadow-xl z-20 animate-fade-in">
                  <div className="p-2">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-700/50 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <User className="w-4 h-4" />
                      الملف الشخصي
                    </Link>
                    <Link
                      href="/admin/settings"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-700/50 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Settings className="w-4 h-4" />
                      الإعدادات
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
