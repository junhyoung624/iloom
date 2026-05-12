import {
    addDays,
    differenceInDays,
    differenceInMinutes,
    format,
    isBefore,
    isValid,
    parse,
    parseISO,
} from 'date-fns'
import { ko } from 'date-fns/locale'

export const toDate = (value) => {
    if (!value) return null
    if (value?.toDate) {
        const date = value.toDate() // Firebase Timestamp
        return isValid(date) ? date : null
    }
    if (value instanceof Date) return isValid(value) ? value : null

    const text = String(value).trim()
    const isoDate = parseISO(text)
    if (isValid(isoDate)) return isoDate

    const patterns = ['yyyy.MM.dd', 'yyyy. M. d.', 'yyyy/M/d', 'yyyy-M-d']
    for (const pattern of patterns) {
        const date = parse(text, pattern, new Date())
        if (isValid(date)) return date
    }

    return null
}

export const formatOrderDate = (value) => {
    const date = toDate(value)
    return date ? format(date, 'yyyy.MM.dd', { locale: ko }) : ''
}

export const formatOrderTime = (value) => {
    const date = toDate(value)
    return date ? format(date, 'HH:mm:ss') : ''
}

export const createEstimatedDeliveryDate = (baseDate = new Date(), days = 3) => {
    return addDays(baseDate, days).toISOString()
}

export const getDeliveryDday = (deliveryDate, now = new Date()) => {
    const date = toDate(deliveryDate)
    if (!date) return null
    return differenceInDays(date, now)
}

export const getAutoDeliveryStatus = (order, now = new Date()) => {
    const savedStatus = order?.orderStatus || order?.state || 'payment'
    const createdAt = toDate(order?.createdAt)
    const deliveryDate = toDate(order?.deliveryDate)

    if (!createdAt) return savedStatus

    const minutesFromOrder = differenceInMinutes(now, createdAt)

    if (isBefore(now, createdAt)) return 'payment'
    if (minutesFromOrder < 1) return 'payment'
    if (minutesFromOrder < 2) return 'ready'
    if (minutesFromOrder < 3) return 'scheduled'
    if (minutesFromOrder >= 4) return 'done'
    if (!deliveryDate) return savedStatus
    if (isBefore(now, deliveryDate)) return 'shipping'
    return 'done'
}

