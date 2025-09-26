import prisma from '@/lib/prisma'
import { AlertType, AlertCondition, AlertFrequency, NotificationType } from '@prisma/client'

interface AlertCheckResult {
  triggered: boolean
  message?: string
  data?: any
}

export class AlertChecker {
  /**
   * Check all active alerts and trigger notifications as needed
   */
  static async checkAllAlerts(): Promise<void> {
    try {
      // Get all active alerts with their associated bonds and users
      const alerts = await prisma.alert.findMany({
        where: { isActive: true },
        include: {
          bond: {
            include: {
              marketData: {
                orderBy: { asOf: 'desc' },
                take: 1,
              }
            }
          },
          user: true,
        }
      })

      // Process each alert
      for (const alert of alerts) {
        await this.checkAlert(alert)
      }
    } catch (error) {
      console.error('Error checking alerts:', error)
    }
  }

  /**
   * Check a single alert and create notification if triggered
   */
  private static async checkAlert(alert: any): Promise<void> {
    try {
      // Check if we should skip based on frequency
      if (!this.shouldCheckAlert(alert)) {
        return
      }

      // Get the check result based on alert type
      const result = await this.evaluateAlert(alert)

      if (result.triggered) {
        // Create notification
        await this.createNotification(alert, result)

        // Update alert last triggered time
        await prisma.alert.update({
          where: { id: alert.id },
          data: { lastTriggered: new Date() }
        })
      }
    } catch (error) {
      console.error(`Error checking alert ${alert.id}:`, error)
    }
  }

  /**
   * Determine if alert should be checked based on frequency
   */
  private static shouldCheckAlert(alert: any): boolean {
    if (!alert.lastTriggered) return true

    const now = new Date()
    const lastTriggered = new Date(alert.lastTriggered)
    const hoursSinceTriggered = (now.getTime() - lastTriggered.getTime()) / (1000 * 60 * 60)

    switch (alert.frequency) {
      case AlertFrequency.REAL_TIME:
        return true
      case AlertFrequency.ONCE_PER_HOUR:
        return hoursSinceTriggered >= 1
      case AlertFrequency.ONCE_PER_DAY:
        return hoursSinceTriggered >= 24
      case AlertFrequency.ONCE_ONLY:
        return false // Already triggered once
      default:
        return true
    }
  }

  /**
   * Evaluate if alert conditions are met
   */
  private static async evaluateAlert(alert: any): Promise<AlertCheckResult> {
    switch (alert.type) {
      case AlertType.PRICE_ABOVE:
      case AlertType.PRICE_BELOW:
        return this.checkPriceAlert(alert)
      
      case AlertType.YIELD_ABOVE:
      case AlertType.YIELD_BELOW:
        return this.checkYieldAlert(alert)
      
      case AlertType.RATING_CHANGE:
        return this.checkRatingChange(alert)
      
      case AlertType.MATURITY_APPROACHING:
        return this.checkMaturityApproaching(alert)
      
      case AlertType.CALL_APPROACHING:
        return this.checkCallApproaching(alert)
      
      default:
        return { triggered: false }
    }
  }

  /**
   * Check price-based alerts
   */
  private static checkPriceAlert(alert: any): AlertCheckResult {
    if (!alert.bond || !alert.bond.marketData[0]) {
      return { triggered: false }
    }

    const currentPrice = alert.bond.marketData[0].price
    const threshold = alert.threshold

    let triggered = false
    let comparison = ''

    switch (alert.condition) {
      case AlertCondition.GREATER_THAN:
        triggered = currentPrice > threshold
        comparison = 'above'
        break
      case AlertCondition.LESS_THAN:
        triggered = currentPrice < threshold
        comparison = 'below'
        break
      case AlertCondition.EQUALS:
        triggered = Math.abs(currentPrice - threshold) < 0.01
        comparison = 'at'
        break
    }

    if (triggered) {
      return {
        triggered: true,
        message: `${alert.bond.issuerName} is trading ${comparison} your target price`,
        data: {
          currentPrice,
          threshold,
          bond: {
            cusip: alert.bond.cusip,
            issuerName: alert.bond.issuerName,
            coupon: alert.bond.coupon,
            maturity: alert.bond.maturity,
          }
        }
      }
    }

    return { triggered: false }
  }

  /**
   * Check yield-based alerts
   */
  private static checkYieldAlert(alert: any): AlertCheckResult {
    if (!alert.bond || !alert.bond.marketData[0]) {
      return { triggered: false }
    }

    const currentYield = alert.bond.marketData[0].yieldToWorst
    const threshold = alert.threshold

    let triggered = false
    let comparison = ''

    switch (alert.condition) {
      case AlertCondition.GREATER_THAN:
        triggered = currentYield > threshold
        comparison = 'above'
        break
      case AlertCondition.LESS_THAN:
        triggered = currentYield < threshold
        comparison = 'below'
        break
      case AlertCondition.EQUALS:
        triggered = Math.abs(currentYield - threshold) < 0.01
        comparison = 'at'
        break
    }

    if (triggered) {
      return {
        triggered: true,
        message: `${alert.bond.issuerName} yield is ${comparison} your target`,
        data: {
          currentYield,
          threshold,
          bond: {
            cusip: alert.bond.cusip,
            issuerName: alert.bond.issuerName,
            coupon: alert.bond.coupon,
            maturity: alert.bond.maturity,
          }
        }
      }
    }

    return { triggered: false }
  }

  /**
   * Check for rating changes
   */
  private static async checkRatingChange(alert: any): Promise<AlertCheckResult> {
    // This would need to track rating history
    // For now, return not triggered
    return { triggered: false }
  }

  /**
   * Check if maturity is approaching
   */
  private static checkMaturityApproaching(alert: any): AlertCheckResult {
    if (!alert.bond) {
      return { triggered: false }
    }

    const maturityDate = new Date(alert.bond.maturity)
    const now = new Date()
    const daysToMaturity = Math.floor((maturityDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    // Alert if within threshold days (default 90 days)
    const thresholdDays = alert.threshold || 90

    if (daysToMaturity <= thresholdDays && daysToMaturity > 0) {
      return {
        triggered: true,
        message: `${alert.bond.issuerName} matures in ${daysToMaturity} days`,
        data: {
          daysToMaturity,
          maturityDate,
          bond: {
            cusip: alert.bond.cusip,
            issuerName: alert.bond.issuerName,
            coupon: alert.bond.coupon,
            maturity: alert.bond.maturity,
          }
        }
      }
    }

    return { triggered: false }
  }

  /**
   * Check if call date is approaching
   */
  private static checkCallApproaching(alert: any): AlertCheckResult {
    if (!alert.bond || !alert.bond.callable || !alert.bond.callSchedule) {
      return { triggered: false }
    }

    // Parse call schedule (assuming it's stored as JSON)
    const callSchedule = alert.bond.callSchedule as any[]
    const now = new Date()

    // Find next call date
    const nextCall = callSchedule
      .map(call => ({ ...call, date: new Date(call.date) }))
      .filter(call => call.date > now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())[0]

    if (!nextCall) {
      return { triggered: false }
    }

    const daysToCall = Math.floor((nextCall.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const thresholdDays = alert.threshold || 30

    if (daysToCall <= thresholdDays) {
      return {
        triggered: true,
        message: `${alert.bond.issuerName} is callable in ${daysToCall} days`,
        data: {
          daysToCall,
          callDate: nextCall.date,
          callPrice: nextCall.price,
          bond: {
            cusip: alert.bond.cusip,
            issuerName: alert.bond.issuerName,
            coupon: alert.bond.coupon,
            maturity: alert.bond.maturity,
          }
        }
      }
    }

    return { triggered: false }
  }

  /**
   * Create notification for triggered alert
   */
  private static async createNotification(alert: any, result: AlertCheckResult): Promise<void> {
    const title = this.getNotificationTitle(alert.type, result)

    await prisma.notification.create({
      data: {
        alertId: alert.id,
        userId: alert.userId,
        type: NotificationType.IN_APP,
        title,
        message: result.message || 'Alert condition met',
        data: result.data,
        isRead: false,
        emailSent: false, // TODO: Implement email sending
      }
    })

    // TODO: Send email notification if user has email notifications enabled
    // TODO: Send push notification if user has push notifications enabled
  }

  /**
   * Get notification title based on alert type
   */
  private static getNotificationTitle(type: AlertType, result: AlertCheckResult): string {
    switch (type) {
      case AlertType.PRICE_ABOVE:
        return '📈 Price Target Reached'
      case AlertType.PRICE_BELOW:
        return '📉 Price Alert'
      case AlertType.YIELD_ABOVE:
        return '📊 Yield Target Reached'
      case AlertType.YIELD_BELOW:
        return '📊 Yield Alert'
      case AlertType.RATING_CHANGE:
        return '⚠️ Rating Change'
      case AlertType.MATURITY_APPROACHING:
        return '📅 Maturity Approaching'
      case AlertType.CALL_APPROACHING:
        return '📞 Call Date Approaching'
      default:
        return '🔔 Bond Alert'
    }
  }
}
