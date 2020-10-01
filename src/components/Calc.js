// TODO: Make it faster, currently not optimized at all & too redundant.

class TaxCalculator {
  constructor(grossIncome, deductions, singleFiling) {
    this.grossIncome = grossIncome;
    this.deductions = deductions;
    this.singleFiling = singleFiling;
    this.taxableIncome = 0;
    this.incomeTax = 0;
    this.localTax = 0;
    this.ficaTax = 0;
  }

  getTaxableIncome(forLocalTax) {
    return Math.round(
      this.grossIncome -
        Math.min(this.grossIncome, this.getTotalDeductions(forLocalTax))
    );
  }

  getTotalTax() {
    return Math.round(
      this.getIncomeTax() + this.getLocalTax() + this.getFICATax()
    );
  }

  getEffectiveTaxRate() {
    return this.toThousandths(this.getTotalTax() / this.grossIncome);
  }

  getNetIncome() {
    return Math.round(this.grossIncome - this.getTotalTax());
  }

  getTax(taxableIncome, brackets, round) {
    return Math.round(
      brackets.reduce(
        (acc, bracket) => {
          const amount = Math.max(0, acc[0] - bracket.income);
          return [acc[0] - amount, acc[1] + round(amount * bracket.rate)];
        },
        [taxableIncome, 0 /* tax */]
      )[1]
    );
  }

  toHundredths(val) {
    return Math.round(100 * val) / 100;
  }

  toThousandths(val) {
    return Math.round(1000 * val) / 1000;
  }
}

export class USFederalTaxCalculator extends TaxCalculator {
  constructor(
    grossIncome,
    deductions,
    deductionsFSA,
    deductionsHSA,
    incomeRatio, // 0.5 to 1.0
    singleFiling
  ) {
    super(grossIncome, deductions, singleFiling);
    this.deductionsFSA = deductionsFSA;
    this.deductionsHSA = deductionsHSA;
    this.incomeRatio = incomeRatio;
  }

  getTotalDeductions(forLocalTax) {
    return (
      this.deductions +
      this.deductionsFSA +
      // CA doesn't recognize HSA.
      (forLocalTax ? 0 : this.deductionsHSA) +
      this.getStandardDeduction(forLocalTax)
    );
  }

  getStandardDeduction(forLocalTax) {
    console.assert(!forLocalTax);
    // Use tax year 2020's values. Assume under the age of 65.
    // https://www.irs.gov/publications/p501
    // https://www.irs.gov/newsroom/irs-provides-tax-inflation-adjustments-for-tax-year-2020
    if (this.singleFiling) return 12400; // Single
    return 24800; // MFJ (married filing jointly)
  }

  getIncomeTax() {
    // https://www.irs.gov/newsroom/irs-provides-tax-inflation-adjustments-for-tax-year-2020
    let brackets = [
      // Single
      { rate: 0.37, income: 518400 },
      { rate: 0.35, income: 207350 },
      { rate: 0.32, income: 163300 },
      { rate: 0.24, income: 85525 },
      { rate: 0.22, income: 40125 },
      { rate: 0.12, income: 9875 },
      { rate: 0.1, income: 0 },
    ];
    if (!this.singleFiling) {
      brackets = [
        // MFJ
        { rate: 0.37, income: 622050 },
        { rate: 0.35, income: 414700 },
        { rate: 0.32, income: 326600 },
        { rate: 0.24, income: 171050 },
        { rate: 0.22, income: 80250 },
        { rate: 0.12, income: 19750 },
        { rate: 0.1, income: 0 },
      ];
    }
    return this.getTax(
      this.getTaxableIncome(false),
      brackets,
      this.toHundredths
    );
  }

  getFICATax() {
    return Math.round(this.getSocialSecurityTax() + this.getMedicareTax());
  }

  getIncomeForFICA() {
    // 401(k) etc. *are* subject to FICA taxes. FSA and HSA aren't.
    return this.grossIncome - (this.deductionsFSA + this.deductionsHSA);
  }

  getSocialSecurityTax() {
    // https://www.irs.gov/taxtopics/tc751
    const wageBaseLimits = 137700; // 2020 *per-person* limit
    const taxRate = 0.062; // the employee's half
    return this.toHundredths(
      // Assume FSA/HSA deductions are proportional to their income.
      Math.min(
        wageBaseLimits,
        this.getIncomeForFICA(false) * this.incomeRatio
      ) *
        taxRate +
        Math.min(
          wageBaseLimits,
          this.getIncomeForFICA(false) * (1 - this.incomeRatio)
        ) *
          taxRate
    );
  }

  getMedicareTax() {
    // https://www.irs.gov/taxtopics/tc751
    const brackets = [
      // Both single and MFJ
      { rate: 0.0145 + 0.009, income: 200000 },
      { rate: 0.0145, income: 0 },
    ];
    return this.getTax(
      this.getIncomeForFICA(false),
      brackets,
      this.toHundredths
    );
  }

  getLocalTax() {
    return 0;
  }
}

export class USCaliforniaTaxCalculator extends USFederalTaxCalculator {
  getLocalTax() {
    // For 2019.
    // https://www.ftb.ca.gov/forms/2019/2019-540-booklet.html#2019-California-Tax-Rate-Schedules
    // The 1% surcharge for $1M/2M+ is due to CA's Mental Health Services Tax.
    let brackets = [
      // Single
      { rate: 0.133, income: 1000000 },
      { rate: 0.123, income: 590742 },
      { rate: 0.113, income: 354445 },
      { rate: 0.103, income: 295373 },
      { rate: 0.093, income: 57824 },
      { rate: 0.08, income: 45753 },
      { rate: 0.06, income: 32960 },
      { rate: 0.04, income: 20883 },
      { rate: 0.02, income: 8809 },
      { rate: 0.01, income: 0 },
    ];
    if (!this.singleFiling) {
      brackets = [
        // MFJ
        { rate: 0.133, income: 2000000 },
        { rate: 0.123, income: 1181484 },
        { rate: 0.113, income: 708890 },
        { rate: 0.103, income: 590746 },
        { rate: 0.093, income: 115648 },
        { rate: 0.08, income: 91506 },
        { rate: 0.06, income: 65920 },
        { rate: 0.04, income: 41766 },
        { rate: 0.02, income: 17618 },
        { rate: 0.01, income: 0 },
      ];
    }
    return this.getTax(
      this.getTaxableIncome(true),
      brackets,
      this.toHundredths
    );
  }

  getStandardDeduction(forLocalTax) {
    if (!forLocalTax) return super.getStandardDeduction(false);
    // For 2019.
    // https://www.ftb.ca.gov/forms/2019/2019-540-booklet.html
    if (this.singleFiling) return 4537; // Single
    return 9074; // MFJ
  }
}

const JP_BONUS_PER_YEAR = 2;

export class JapanTaxCalculator extends TaxCalculator {
  constructor(
    grossIncome,
    deductions,
    singleFiling,
    useSpouseDeductions,
    spouseIncome
  ) {
    super(grossIncome, deductions, singleFiling);
    this.useSpouseDeductions = useSpouseDeductions;
    const income = spouseIncome;
    this.spouseIncome = Math.max(0, income - this.getIncomeDeductions(income));
  }

  getTotalDeductions(forLocalTax) {
    const incomeDeductions =
      this.getIncomeDeductions(this.grossIncome) + this.deductions;
    let deductions =
      incomeDeductions +
      this.getBasicDeductions(forLocalTax, incomeDeductions) +
      this.getFICATax();
    if (this.useSpouseDeductions) {
      deductions += this.getSpouseDeductions(forLocalTax, incomeDeductions);
      deductions += this.getSpouseSpecialDeductions(
        forLocalTax,
        incomeDeductions
      );
    }
    return Math.round(deductions);
  }

  getIncomeDeductions(grossIncome) {
    // For Reiwa 2.
    // https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1410.htm
    // TODO: For income <= 6600000, the calculation below is a little bit off.
    if (grossIncome <= 1800000)
      return Math.max(550000, Math.round(grossIncome * 0.4) - 100000);
    else if (grossIncome <= 3600000)
      return Math.round(grossIncome * 0.3) + 80000;
    else if (grossIncome <= 6600000)
      return Math.round(grossIncome * 0.2) + 440000;
    else if (grossIncome <= 8500000)
      return Math.round(grossIncome * 0.1) + 1100000;
    return 1950000;
  }

  getBasicDeductions(forLocalTax, incomeDeductions) {
    // For Reiwa 2.
    // https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1199.htm
    const income = this.grossIncome - incomeDeductions;
    if (income <= 24000000) return forLocalTax ? 430000 : 480000;
    else if (income <= 24500000) return forLocalTax ? 290000 : 320000;
    else if (income <= 25000000) return forLocalTax ? 150000 : 160000;
    return 0;
  }

  getSpouseDeductionIncomeType(income) {
    console.assert(income <= 10000000);
    if (income <= 9000000) return 0;
    if (income <= 9500000) return 1;
    return 2;
  }

  getSpouseDeductions(forLocalTax, incomeDeductions) {
    console.assert(this.useSpouseDeductions);
    const income = this.grossIncome - incomeDeductions;
    if (income > 10000000) return 0;
    const index = this.getSpouseDeductionIncomeType(income);
    if (forLocalTax) {
      // For Reiwa 2.
      // https://www.city.miyazaki.miyazaki.jp/life/tax/city_prefectural/2283.html
      if (this.spouseIncome > 380000) return 0;
      return [330000, 220000, 110000][index];
    }
    // For Reiwa 2.
    // https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1191.htm
    if (this.spouseIncome > 480000) return 0;
    // Assume the spouse is under the age of 70 and is not disabled.
    return [380000, 260000, 130000][index];
  }

  getSpouseSpecialDeductions(forLocalTax, incomeDeductions) {
    console.assert(this.useSpouseDeductions);
    const income = this.grossIncome - incomeDeductions;
    if (income > 10000000) return 0;
    const index = this.getSpouseDeductionIncomeType(income);
    if (forLocalTax) {
      // For Reiwa 2.
      // https://www.city.miyazaki.miyazaki.jp/life/tax/city_prefectural/2283.html
      if (this.spouseIncome <= 380000) return 0;
      if (this.spouseIncome <= 900000) return [330000, 220000, 110000][index];
      if (this.spouseIncome <= 950000) return [310000, 210000, 110000][index];
      if (this.spouseIncome <= 1000000) return [260000, 180000, 90000][index];
      if (this.spouseIncome <= 1050000) return [210000, 140000, 70000][index];
      if (this.spouseIncome <= 1100000) return [160000, 110000, 60000][index];
      if (this.spouseIncome <= 1150000) return [110000, 80000, 40000][index];
      if (this.spouseIncome <= 1200000) return [60000, 40000, 20000][index];
      if (this.spouseIncome <= 1230000) return [30000, 20000, 10000][index];
      return 0;
    }
    // For Reiwa 2.
    // https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1195.htm
    if (this.spouseIncome <= 480000) return 0;
    if (this.spouseIncome <= 950000) return [380000, 260000, 130000][index];
    if (this.spouseIncome <= 1000000) return [360000, 240000, 120000][index];
    if (this.spouseIncome <= 1050000) return [310000, 210000, 110000][index];
    if (this.spouseIncome <= 1100000) return [260000, 180000, 90000][index];
    if (this.spouseIncome <= 1150000) return [210000, 140000, 70000][index];
    if (this.spouseIncome <= 1200000) return [160000, 110000, 60000][index];
    if (this.spouseIncome <= 1250000) return [110000, 80000, 40000][index];
    if (this.spouseIncome <= 1300000) return [60000, 40000, 20000][index];
    if (this.spouseIncome <= 1330000) return [30000, 20000, 10000][index];
    return 0;
  }

  getIncomeTax() {
    return this.getIncomeTaxInternal(this.getTaxableIncome(false));
  }

  getIncomeTaxInternal(taxableIncome) {
    if (taxableIncome < 0) return 0;

    // https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2260.htm
    const brackets = [
      { rate: 0.45, income: 40000000 },
      { rate: 0.4, income: 18000000 },
      { rate: 0.33, income: 9000000 },
      { rate: 0.23, income: 6950000 },
      { rate: 0.2, income: 3300000 },
      { rate: 0.1, income: 1950000 },
      { rate: 0.05, income: 0 },
    ];
    const tax = this.getTax(taxableIncome, brackets, Math.round);
    // Add 2.1% of special reconstruction income tax.
    return Math.floor(tax * 1.021);
  }

  getLocalTax() {
    return this.getLocalTaxInternal(this.getTaxableIncome(true));
  }

  getLocalTaxInternal(taxableIncome) {
    if (taxableIncome <= 0) return 0;
    // https://www.tax.metro.tokyo.lg.jp/kazei/kojin_ju.html#gaiyo_02
    let kintouwari = 1500 + 3500 + 500;
    // TODO: This kintouwari calculation is not 100% correct, fix.
    if (taxableIncome < 280000) kintouwari = 0;
    return Math.round(taxableIncome * 0.1) + kintouwari;
  }

  canBeADependent() {
    return (
      !this.singleFiling &&
      !this.useSpouseDeductions &&
      this.grossIncome < 1060000
    );
  }

  getFICATax() {
    return (
      this.getEmploymentInsurancePremium() +
      this.getEmployeesPensionInsurancePremium() +
      this.getNursingCareInsurancePremium() +
      this.getHealthInsurancePremium()
    );
  }

  getEmploymentInsurancePremium() {
    if (this.canBeADependent()) return 0;
    // https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000108634.html
    return Math.round(this.grossIncome * 0.003);
  }

  getEmployeesPensionInsurancePremium() {
    if (this.canBeADependent()) return 0;
    const taxRate = 0.183;
    // https://kurassist.jp/nenkin_atoz/seido/hokenryou/hokenryou08.html
    const exemptionRate = 0.0;
    // https://www.nenkin.go.jp/service/kounen/hokenryo-gaku/gakuhyo/20170822.html
    return this.getPremium(
      this.getNormalizedIncomeForEmployeesPension,
      (taxRate - exemptionRate) / 2
    );
  }

  getNursingCareInsurancePremium() {
    if (this.canBeADependent()) return 0;
    // https://www.its-kenpo.or.jp/hoken/jimu/hokenryou/index.html
    // Assumption: Age 40.
    return this.getPremium(this.getNormalizedIncomeForHealthInsurance, 0.01);
  }

  getHealthInsurancePremium() {
    if (this.canBeADependent()) return 0;
    // https://www.its-kenpo.or.jp/hoken/jimu/hokenryou/index.html
    return this.getPremium(this.getNormalizedIncomeForHealthInsurance, 0.0425);
  }

  getPremium(normalizer, rate) {
    const normalizedMonthlyIncome = normalizer(this.grossIncome / 14, false);
    const normalizedBonus = normalizer(this.grossIncome / 14, true);
    return Math.round(
      Math.round(normalizedMonthlyIncome * rate) * 12 +
        Math.round(normalizedBonus * rate) * JP_BONUS_PER_YEAR
    );
  }

  getNormalizedIncomeForHealthInsurance(
    income /* monthly or bonus */,
    isBonus
  ) {
    if (isBonus) {
      const annualMax = 5730000;
      return Math.min(
        Math.floor(income / 1000) * 1000,
        annualMax / JP_BONUS_PER_YEAR
      );
    }
    const normalizationTable = [
      { normalized: 58000, max: 63000 },
      { normalized: 68000, max: 73000 },
      { normalized: 78000, max: 83000 },
      { normalized: 88000, max: 93000 },
      { normalized: 98000, max: 101000 },
      { normalized: 104000, max: 107000 },
      { normalized: 110000, max: 114000 },
      { normalized: 118000, max: 122000 },
      { normalized: 126000, max: 130000 },
      { normalized: 134000, max: 138000 },
      { normalized: 142000, max: 146000 },
      { normalized: 150000, max: 155000 },
      { normalized: 160000, max: 165000 },
      { normalized: 170000, max: 175000 },
      { normalized: 180000, max: 185000 },
      { normalized: 190000, max: 195000 },
      { normalized: 200000, max: 210000 },
      { normalized: 220000, max: 230000 },
      { normalized: 240000, max: 250000 },
      { normalized: 260000, max: 270000 },
      { normalized: 280000, max: 290000 },
      { normalized: 300000, max: 310000 },
      { normalized: 320000, max: 330000 },
      { normalized: 340000, max: 350000 },
      { normalized: 360000, max: 370000 },
      { normalized: 380000, max: 395000 },
      { normalized: 410000, max: 425000 },
      { normalized: 440000, max: 455000 },
      { normalized: 470000, max: 485000 },
      { normalized: 500000, max: 515000 },
      { normalized: 530000, max: 545000 },
      { normalized: 560000, max: 575000 },
      { normalized: 590000, max: 605000 },
      { normalized: 620000, max: 635000 },
      { normalized: 650000, max: 665000 },
      { normalized: 680000, max: 695000 },
      { normalized: 710000, max: 730000 },
      { normalized: 750000, max: 770000 },
      { normalized: 790000, max: 810000 },
      { normalized: 830000, max: 855000 },
      { normalized: 880000, max: 905000 },
      { normalized: 930000, max: 955000 },
      { normalized: 980000, max: 1005000 },
      { normalized: 1030000, max: 1055000 },
      { normalized: 1090000, max: 1115000 },
      { normalized: 1150000, max: 1175000 },
      { normalized: 1210000, max: 1235000 },
      { normalized: 1270000, max: 1295000 },
      { normalized: 1330000, max: 1355000 },
      { normalized: 1390000, max: Number.MAX_VALUE },
    ];
    return normalizationTable.find((elem) => elem.max > income).normalized;
  }

  getNormalizedIncomeForEmployeesPension(
    income /* monthly or bonus */,
    isBonus
  ) {
    if (isBonus) {
      const max = 1500000; // per month
      return Math.min(Math.floor(income / 1000) * 1000, max);
    }
    const normalizationTable = [
      { normalized: 88000, max: 93000 },
      { normalized: 98000, max: 101000 },
      { normalized: 104000, max: 107000 },
      { normalized: 110000, max: 114000 },
      { normalized: 118000, max: 122000 },
      { normalized: 126000, max: 130000 },
      { normalized: 134000, max: 138000 },
      { normalized: 142000, max: 146000 },
      { normalized: 150000, max: 155000 },
      { normalized: 160000, max: 165000 },
      { normalized: 170000, max: 175000 },
      { normalized: 180000, max: 185000 },
      { normalized: 190000, max: 195000 },
      { normalized: 200000, max: 210000 },
      { normalized: 220000, max: 230000 },
      { normalized: 240000, max: 250000 },
      { normalized: 260000, max: 270000 },
      { normalized: 280000, max: 290000 },
      { normalized: 300000, max: 310000 },
      { normalized: 320000, max: 330000 },
      { normalized: 340000, max: 350000 },
      { normalized: 360000, max: 370000 },
      { normalized: 380000, max: 395000 },
      { normalized: 410000, max: 425000 },
      { normalized: 440000, max: 455000 },
      { normalized: 470000, max: 485000 },
      { normalized: 500000, max: 515000 },
      { normalized: 530000, max: 545000 },
      { normalized: 560000, max: 575000 },
      { normalized: 590000, max: 605000 },
      { normalized: 620000, max: Number.MAX_VALUE },
    ];
    return normalizationTable.find((elem) => elem.max > income).normalized;
  }
}
