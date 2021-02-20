import { first } from "underscore"
import { dateToDate, currencyToString, displayTimeSeconds, getTimeFromNow, momentToDate, dateUTCToDate } from "../../common/Utils"
import moment from "moment";
import I18n from '../../common/language/i18n'

//Chua tat ca cac ham tinh toan cua 1 product
class ProductManager {

    //priceConfig
    getPriceConfig = (product) => {
        return product.PriceConfig? product.PriceConfig!=null ? JSON.parse(product.PriceConfig):null:null
    }

    getPrice1 = (product) => { //gia gio dac biet 1
        let priceConfig = this.getPriceConfig(product)
        if(priceConfig.Type && priceConfig.Type == "percent")
            return priceConfig.TimeValue ? (product.BasePrice / 100) * priceConfig.TimeValue : 0
        else
            return priceConfig.TimeValue ? priceConfig.TimeValue : 0
    }

    getPrice2 = (product) => { //gia gio dac biet 2
        let priceConfig = this.getPriceConfig(product)
        if(priceConfig.Type2 && priceConfig.Type2 == "percent")
            return priceConfig.TimeValue2 ? (product.BasePrice / 100) * priceConfig.TimeValue2 : 0
        else
            return priceConfig.TimeValue2 ? priceConfig.TimeValue2 : 0
    }    

    getSymbol = (price) => {
        return (price < 0) ? "↓" : "↑"
    }

    //ProductTIme
    initProductTime = (product) => {

    }

    getProductTimeQuantity = (product, minutes) => {
        if (!product.BlockOfTimeToUseService || product.BlockOfTimeToUseService <= 0.0) 
            product.BlockOfTimeToUseService = 6.0 // so phut cho 1 block
        let qty = 0.0
        if (product.IsPriceForBlock) {
            qty = Math.ceil(minutes / product.BlockOfTimeToUseService)
        } else {
            let block = product.BlockOfTimeToUseService / 60.0
            qty = Math.floor((minutes / product.BlockOfTimeToUseService)) * block
            let pQty = minutes % product.BlockOfTimeToUseService

            if (pQty > 0) {
                qty += block
            }
        }
        return qty
    }

    getProductTimePrice = (product) => {
        if( product.IsTimer && !product.StopTimer) {

            if (!product.Checkin || !product.Checkout) {
                let momentNow = moment().utc()
                product.Checkin = momentToDate(momentNow)

                momentNow.subtract(-1, 'second'); // cong them 1 giay cho checkout

                product.Checkout = momentToDate(momentNow)
            }

            let sumAllMoney = 0.0
            this.sumSecondsNormal = 0
            this.descriptionOff = ""
            let checkinDate = moment.utc(product.Checkin)
            let checkoutDate = moment.utc(product.Checkout)
            let isShowOtherDescription = false // Set gia tri ban dau check hien thi description other.

            this.descriptionOff = dateUTCToDate(product.Checkin, "YYYY-MM-DD[T]HH:mm:ss.SS[Z]", "DD/MM HH:mm") + "=>" + 
            dateUTCToDate(product.Checkout, "YYYY-MM-DD[T]HH:mm:ss.SS[Z]", "DD/MM HH:mm") + 
            " (" + `${getTimeFromNow(product.Checkin)}` + ") "

            let allTimeSeconds = checkoutDate.diff(checkinDate) / 1000
            let allTimeMinutes = allTimeSeconds / 60

            if (!product.BlockOfTimeToUseService || product.BlockOfTimeToUseService <= 0.0) 
            product.BlockOfTimeToUseService = 6.0
            let firstMinutes = this.getPriceConfig(product).Block * product.BlockOfTimeToUseService
            let firstSeconds = firstMinutes * 60.0
            if(firstMinutes) {
                // Tinh lai thoi gian checkin (tru bo di so phut dau tien)
                checkinDate.subtract(- firstMinutes, 'minute')
                allTimeMinutes -= firstMinutes
                let firstValues = this.getPriceConfig(product).Value ? this.getPriceConfig(product).Value : 0
                sumAllMoney += firstValues

                isShowOtherDescription = true
                this.descriptionOff += `;\n${displayTimeSeconds(firstSeconds)} ${I18n.t('dau_tien')} = ${currencyToString(firstValues)}`
            }

            if(allTimeSeconds >  firstSeconds) { // Tinh tien va hien thi tang giam gia gio dac biet.
                let sumPriceHoursFromTo = 0

                let countDate = checkinDate.diff(checkoutDate, 'days')
                if (countDate <= 0) {
                    sumPriceHoursFromTo += this.getPriceHoursFromToInOneDay(product, this.getPriceConfig(product), checkinDate, checkoutDate)
                } else {
                    let start = checkinDate
                    let end = checkinDate.endOf('day')
                    for (i = 0; i < countDate; i++) {
                        if (i == countDate) end = checkoutDate 
                        else end = start.endOf('day')
                        sumPriceHoursFromTo += this.getPriceHoursFromToInOneDay(product, this.getPriceConfig(product), start, end)
                        start = end
                    }
                }

                sumAllMoney += sumPriceHoursFromTo

                // Tinh tien va hien thi gio binh thuong.
                if (this.sumSecondsNormal > 0) {

                    let sumMinutesNormal = Math.ceil(this.sumSecondsNormal / 60)

                    let qtyNormal = this.getProductTimeQuantity(product, sumMinutesNormal)
                    let totalPriceNormal = qtyNormal * product.BasePrice
                    let totalPriceNormalDisplay = currencyToString(totalPriceNormal)

                    if (isShowOtherDescription) {
                        this.descriptionOff += `;\n${displayTimeSeconds(this.sumSecondsNormal)} ${I18n.t('khac')} = ${totalPriceNormalDisplay}.`
                    }
                    sumAllMoney += totalPriceNormal
                }
            }

            product.Description = this.descriptionOff

            if (sumAllMoney == 0.0 || !isShowOtherDescription) {
                return product.Price * product.Quantity
            } else {
                product.Price = sumAllMoney
                product.countChoose = 1.0
                product.Quantity = 1.0
                return product.Price * 1.0
            }
        }

        return product.Price * product.Quantity
    }

    getPriceHoursFromToInOneDay = (product, priceConfig, startDate, endDate) => {

        let allTimeSeconds = endDate.diff(startDate) / 1000

        let time01Seconds = 0
        let totalPriceInTime01 = 0.0

        let time02Seconds = 0
        let totalPriceInTime02 = 0.0

        let totalPriceInTime0102 = 0.0

        // Time 01

        if (priceConfig.TimeTo && priceConfig.TimeFrom) {
            let timeTo1   = moment.utc(priceConfig.TimeTo)
            let timeFrom1 = moment.utc(priceConfig.TimeFrom)
            this.setSameDate(timeTo1, startDate)
            this.setSameDate(timeFrom1, startDate)

            console.log("getPriceHoursFromToInOneDay:", startDate, " -> ", endDate, "\n",  timeFrom1, " -> ", timeTo1);

            if (timeTo1.isAfter(timeFrom1)) {
                time01Seconds = this.calculatorDiffTime(startDate, endDate, timeFrom1, timeTo1)
                if (time01Seconds > 0) {
                    allTimeSeconds -= time01Seconds
                    let time01Price = product.BasePrice + this.getPrice1(product)
                    let time01PriceDisplay = currencyToString(time01Price)

                    let time01Minutes = Math.floor(time01Seconds / 60)

                    let qty01 = this.getProductTimeQuantity(product, time01Minutes)
                    totalPriceInTime01 = qty01 * time01Price
                    let totalPriceInTime01Display = currencyToString(totalPriceInTime01)

                    isShowOtherDescription = true
                    this.descriptionOff += `[${displayTimeSeconds(time01Seconds)} ${(this.getPrice1(product) < 0) ? "↓" : "↑"}${Math.round(qty01 *100) / 100}x${time01PriceDisplay}] = ${totalPriceInTime01Display}`
                }

            }
        }

        // Time 02

        if (priceConfig.TimeTo2 && priceConfig.TimeFrom2) {
            let timeTo2   = moment.utc(priceConfig.TimeTo2)
            let timeFrom2 = moment.utc(priceConfig.TimeFrom2)
            this.setSameDate(timeTo2, startDate)
            this.setSameDate(timeFrom2, startDate)

            if (timeTo2.isAfter(timeFrom2)) {
                time02Seconds = this.calculatorDiffTime(startDate, endDate, timeFrom2, timeTo2)
                if (time02Seconds > 0) {
                    allTimeSeconds -= time02Seconds
                    let time02Price = product.BasePrice + this.getPrice2(product)
                    let time02PriceDisplay = `${time02Price}`

                    let time02Minutes = Math.floor(time02Seconds / 60)

                    let qty02 = this.getProductTimeQuantity(product, time02Minutes)
                    totalPriceInTime02 = qty02 * time02Price
                    let totalPriceInTime02Display = currencyToString(totalPriceInTime02)

                    isShowOtherDescription = true
                    this.descriptionOff += `[${displayTimeSeconds(time02Seconds)} ${(this.getPrice2(product) < 0) ? "↓" : "↑"}${Math.round(qty02 *100) / 100}x${time02PriceDisplay}] = ${totalPriceInTime02Display}`
                }

            }
        }

        this.sumSecondsNormal = allTimeSeconds
        return (totalPriceInTime01 + totalPriceInTime02 - totalPriceInTime0102)
    }

    setSameDate = (dateConvert, date) => { // sao chep ngay-thang-nam date vào dateConvert, dung cho gio dac biet
        dateConvert.date(date.date())
        dateConvert.month(date.month())
        dateConvert.year(date.year())
    }

    calculatorDiffTime = (start, end, from, to, isAddMessage = true) => {
        let diffFromStart = from.diff(start) / 1000
        let diffEndTo     = end.diff(to) /1000
        let diffToFrom    = to.diff(from) /1000

        let timeFromToUse = (diffFromStart < 0 ? diffFromStart : 0) + (diffEndTo < 0 ? diffEndTo : 0) + diffToFrom

        if(timeFromToUse < 0) timeFromToUse = 0

        if (timeFromToUse > 0 && isAddMessage) {
            if (diffFromStart >= 0 && diffEndTo >= 0) {
                // from to
                this.descriptionOff += 
                ";\n" + dateUTCToDate(from, "YYYY-MM-DD[T]HH:mm:ss.SS[Z]", "DD/MM HH:mm")
                + "=>" + dateUTCToDate(to, "YYYY-MM-DD[T]HH:mm:ss.SS[Z]", "HH:mm")
            } else if (diffFromStart >= 0 && diffEndTo <= 0) {
                // from end
                this.descriptionOff +=
                ";\n" + dateUTCToDate(from, "YYYY-MM-DD[T]HH:mm:ss.SS[Z]", "DD/MM HH:mm")
                + "=>" + dateUTCToDate(end, "YYYY-MM-DD[T]HH:mm:ss.SS[Z]", "HH:mm")
            } else if (diffFromStart <= 0 && diffEndTo >= 0) {
                // start to
                this.descriptionOff +=
                ";\n" + dateUTCToDate(start, "YYYY-MM-DD[T]HH:mm:ss.SS[Z]", "DD/MM HH:mm")
                + "=>" + dateUTCToDate(to, "YYYY-MM-DD[T]HH:mm:ss.SS[Z]", "HH:mm")
            } else if (diffFromStart <=0 && diffEndTo <= 0) {
                // start end
                this.descriptionOff += 
                ";\n" + dateUTCToDate(start, "YYYY-MM-DD[T]HH:mm:ss.SS[Z]", "DD/MM HH:mm")
                + "=>" + dateUTCToDate(end, "YYYY-MM-DD[T]HH:mm:ss.SS[Z]", "HH:mm")
            }
        }

        return timeFromToUse

    }
}

const productManager = new ProductManager();
export default productManager;