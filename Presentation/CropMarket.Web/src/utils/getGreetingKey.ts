export function getGreetingKey() {
  const hour = new Date().getHours()

  if (hour < 12) {
    return 'farmerOrders.goodMorning'
  }

  if (hour < 18) {
    return 'farmerOrders.goodAfternoon'
  }

  return 'farmerOrders.goodEvening'
}
