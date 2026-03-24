export const getYearData = (year: number) => {
    const baseMultiplier = year === 2025 ? 1 : year === 2024 ? 0.8 : year === 2023 ? 0.6 : year === 2022 ? 0.4 : 0.3;
    
    return {
      totalInvoices: Math.round(23345 * baseMultiplier),
      paidInvoices: Math.round(18676 * baseMultiplier),
      pendingInvoices: Math.round(4669 * baseMultiplier),
      totalReceivables: Math.round(23345 * baseMultiplier),
      unpaidInvoices: Math.round(4669 * baseMultiplier),
      overdueAmount: Math.round(2334 * baseMultiplier),
      cashAmount: Math.round(23345 * baseMultiplier),
      incoming: Math.round(23345 * baseMultiplier),
      outgoing: Math.round(15000 * baseMultiplier),
      changePercentage: year === 2025 ? 3.46 : year === 2024 ? 2.1 : year === 2023 ? -1.2 : 5.8
    };
  };
  
  export const getRevenueChartData = (year: number) => {
    const baseMultiplier = year === 2025 ? 1 : year === 2024 ? 0.9 : year === 2023 ? 0.7 : year === 2022 ? 0.5 : 0.4;
    
    return [
      { month: "Jan", revenue: Math.round(300 * baseMultiplier), accrued: Math.round(700 * baseMultiplier) },
      { month: "Feb", revenue: Math.round(400 * baseMultiplier), accrued: Math.round(550 * baseMultiplier) },
      { month: "Mar", revenue: Math.round(450 * baseMultiplier), accrued: Math.round(500 * baseMultiplier) },
      { month: "Apr", revenue: Math.round(700 * baseMultiplier), accrued: Math.round(600 * baseMultiplier) },
      { month: "May", revenue: Math.round(350 * baseMultiplier), accrued: Math.round(400 * baseMultiplier) },
      { month: "Jun", revenue: Math.round(650 * baseMultiplier), accrued: Math.round(500 * baseMultiplier) },
      { month: "Jul", revenue: Math.round(400 * baseMultiplier), accrued: Math.round(650 * baseMultiplier) },
      { month: "Aug", revenue: Math.round(520 * baseMultiplier), accrued: Math.round(480 * baseMultiplier) },
      { month: "Sep", revenue: Math.round(580 * baseMultiplier), accrued: Math.round(420 * baseMultiplier) },
      { month: "Oct", revenue: Math.round(600 * baseMultiplier), accrued: Math.round(450 * baseMultiplier) },
      { month: "Nov", revenue: Math.round(800 * baseMultiplier), accrued: Math.round(300 * baseMultiplier) },
      { month: "Dec", revenue: Math.round(550 * baseMultiplier), accrued: Math.round(250 * baseMultiplier) },
    ];
  };