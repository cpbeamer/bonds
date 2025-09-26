'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bell, BellOff, Plus, Trash2, TrendingUp, TrendingDown, AlertCircle, Check } from 'lucide-react'
import { toast } from 'sonner'
import { theme } from '@/lib/themes'

interface Alert {
  id: string
  type: string
  bondId?: string
  bond?: {
    cusip: string
    issuerName: string
    coupon: number
    maturity: string
  }
  condition: string
  threshold: number
  isActive: boolean
  lastTriggered?: string
  frequency: string
  createdAt: string
}

interface Notification {
  id: string
  alertId: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  data?: any
}

export default function AlertsPage() {
  const { user } = useUser()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('alerts')
  const [unreadCount, setUnreadCount] = useState(0)

  // Form state for new alert
  const [newAlert, setNewAlert] = useState({
    type: 'PRICE_BELOW',
    bondId: '',
    condition: 'LESS_THAN',
    threshold: 100,
    frequency: 'ONCE_PER_DAY'
  })

  useEffect(() => {
    fetchAlerts()
    fetchNotifications()
  }, [])

  useEffect(() => {
    const unread = notifications.filter(n => !n.isRead).length
    setUnreadCount(unread)
  }, [notifications])

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alerts')
      if (!response.ok) throw new Error('Failed to fetch alerts')
      const data = await response.json()
      setAlerts(data.alerts || [])
    } catch (error) {
      console.error('Error fetching alerts:', error)
      toast.error('Failed to load alerts')
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (!response.ok) throw new Error('Failed to fetch notifications')
      const data = await response.json()
      setNotifications(data.notifications || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const createAlert = async () => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlert)
      })

      if (!response.ok) throw new Error('Failed to create alert')

      const data = await response.json()
      setAlerts([data.alert, ...alerts])
      setShowCreateDialog(false)
      toast.success('Alert created successfully')
      
      // Reset form
      setNewAlert({
        type: 'PRICE_BELOW',
        bondId: '',
        condition: 'LESS_THAN',
        threshold: 100,
        frequency: 'ONCE_PER_DAY'
      })
    } catch (error) {
      console.error('Error creating alert:', error)
      toast.error('Failed to create alert')
    }
  }

  const toggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      })

      if (!response.ok) throw new Error('Failed to update alert')

      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, isActive } : alert
      ))
      toast.success(isActive ? 'Alert activated' : 'Alert deactivated')
    } catch (error) {
      console.error('Error updating alert:', error)
      toast.error('Failed to update alert')
    }
  }

  const deleteAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete alert')

      setAlerts(alerts.filter(alert => alert.id !== alertId))
      toast.success('Alert deleted successfully')
    } catch (error) {
      console.error('Error deleting alert:', error)
      toast.error('Failed to delete alert')
    }
  }

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to mark notification as read')

      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      ))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to mark all as read')

      setNotifications(notifications.map(notif => ({ ...notif, isRead: true })))
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast.error('Failed to mark all as read')
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'PRICE_ABOVE':
      case 'YIELD_ABOVE':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'PRICE_BELOW':
      case 'YIELD_BELOW':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-orange-500" />
    }
  }

  const formatAlertType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-transparent dark:to-transparent dark:bg-background">
      <main className={`${theme.layout.container.margin} ${theme.layout.container.padding} ${theme.layout.page.padding}`}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-50">
              Price Alerts & Notifications
            </h1>
            <p className="text-gray-600 dark:text-neutral-300 mt-1">
              Stay informed about bond price movements and market changes
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Alert</DialogTitle>
                <DialogDescription>
                  Set up a custom alert for bond price or yield changes
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="alert-type">Alert Type</Label>
                  <Select
                    value={newAlert.type}
                    onValueChange={(value) => setNewAlert({ ...newAlert, type: value })}
                  >
                    <SelectTrigger id="alert-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRICE_BELOW">Price Below</SelectItem>
                      <SelectItem value="PRICE_ABOVE">Price Above</SelectItem>
                      <SelectItem value="YIELD_BELOW">Yield Below</SelectItem>
                      <SelectItem value="YIELD_ABOVE">Yield Above</SelectItem>
                      <SelectItem value="RATING_CHANGE">Rating Change</SelectItem>
                      <SelectItem value="MATURITY_APPROACHING">Maturity Approaching</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="threshold">Threshold Value</Label>
                  <Input
                    id="threshold"
                    type="number"
                    step="0.01"
                    value={newAlert.threshold}
                    onChange={(e) => setNewAlert({ ...newAlert, threshold: parseFloat(e.target.value) })}
                    placeholder={newAlert.type.includes('PRICE') ? 'Price (e.g., 98.5)' : 'Yield % (e.g., 4.25)'}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="frequency">Alert Frequency</Label>
                  <Select
                    value={newAlert.frequency}
                    onValueChange={(value) => setNewAlert({ ...newAlert, frequency: value })}
                  >
                    <SelectTrigger id="frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REAL_TIME">Real-time</SelectItem>
                      <SelectItem value="ONCE_PER_HOUR">Once per hour</SelectItem>
                      <SelectItem value="ONCE_PER_DAY">Once per day</SelectItem>
                      <SelectItem value="ONCE_ONLY">Once only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createAlert}>
                  Create Alert
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
            <TabsTrigger value="notifications" className="relative">
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Price Alerts</CardTitle>
                <CardDescription>
                  Manage your custom alerts for bond price and yield movements
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading alerts...</div>
                ) : alerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No alerts set up yet</p>
                    <p className="text-sm mt-2">Create your first alert to start monitoring bond prices</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Bond</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Triggered</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alerts.map((alert) => (
                        <TableRow key={alert.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getAlertIcon(alert.type)}
                              <span className="font-medium">{formatAlertType(alert.type)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {alert.bond ? (
                              <div>
                                <div className="font-medium">{alert.bond.issuerName}</div>
                                <div className="text-sm text-muted-foreground">
                                  {alert.bond.coupon}% • {new Date(alert.bond.maturity).getFullYear()}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">All bonds</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {alert.condition === 'LESS_THAN' ? '<' : '>'} {alert.threshold}
                              {alert.type.includes('YIELD') ? '%' : ''}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {alert.frequency.split('_').join(' ').toLowerCase()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={alert.isActive ? 'default' : 'secondary'}>
                              {alert.isActive ? 'Active' : 'Paused'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {alert.lastTriggered 
                              ? new Date(alert.lastTriggered).toLocaleDateString()
                              : 'Never'
                            }
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleAlert(alert.id, !alert.isActive)}
                              >
                                {alert.isActive ? (
                                  <BellOff className="w-4 h-4" />
                                ) : (
                                  <Bell className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteAlert(alert.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Recent Notifications</CardTitle>
                    <CardDescription>
                      Alert notifications and system updates
                    </CardDescription>
                  </div>
                  {notifications.some(n => !n.isRead) && (
                    <Button variant="outline" size="sm" onClick={markAllAsRead}>
                      Mark all as read
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                          notification.isRead 
                            ? 'bg-gray-50 dark:bg-neutral-900 border-gray-200 dark:border-neutral-700' 
                            : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                        }`}
                        onClick={() => !notification.isRead && markNotificationAsRead(notification.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-neutral-100">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-neutral-400 mt-1">
                              {notification.message}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {!notification.isRead && (
                              <Badge variant="default" className="bg-orange-500">New</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(notification.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
