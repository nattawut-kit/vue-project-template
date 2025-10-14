import dayjs from 'dayjs'
import 'dayjs/locale/th'

export const formatDate = (date: any, format: string, locale?: string): string => {
  return dayjs(date)
    .add(locale == 'en' ? 0 : 543, 'year')
    .locale(locale == 'en' ? 'en' : 'th')
    .format(format ? format : 'DD/MM/YY HH:mm')
}

export const formatDateCalendar = (date: any, format: string): any => {
  return dayjs(date)
    .locale('th')
    .format(format ? format : 'DD MMMM YYYY HH:mm')
}
