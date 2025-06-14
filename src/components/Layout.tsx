import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '../contexts/AuthContext'

export default function Layout() {
  const { user } = useAuth()

  if (!user) {
    return <Outlet />
  }

  return (
    <div className="flex min-h-screen bg-pastel-cream">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}