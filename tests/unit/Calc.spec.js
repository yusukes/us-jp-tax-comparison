import { JapanTaxCalculator } from "@/components/Calc.js";
import { USFederalTaxCalculator } from "@/components/Calc.js";
import { USCaliforniaTaxCalculator } from "@/components/Calc.js";

test("JP FICA tax is zero if you are a dependent and your gross income is < JPY 1.06M", () => {
  {
    const jp = new JapanTaxCalculator(1059999, 10000, false, false, 0);
    expect(jp.getFICATax()).toBe(0);
  }
  {
    const jp = new JapanTaxCalculator(1060000, 10000, false, false, 0);
    expect(jp.getFICATax()).toBeGreaterThan(0);
  }
  // However, if single filing, you need to pay some FICA taxes.
  {
    const jp = new JapanTaxCalculator(1059999, 10000, true, false, 0);
    expect(jp.getFICATax()).toBeGreaterThan(0);
  }
});

test("JP employment insurance premium is 0.3% of the net income", () => {
  {
    const jp = new JapanTaxCalculator(1000000, 10000, true, false, 0);
    // The JPY 10000 deductions (iDeCo) should be ignored when calculating the premium.
    expect(jp.getEmploymentInsurancePremium()).toBe(3000);
  }
  {
    const jp = new JapanTaxCalculator(1000000000, 10000, true, false, 0);
    // Also make sure there's no income limit.
    expect(jp.getEmploymentInsurancePremium()).toBe(3000000);
  }
});

test("JP employment pension premium matches the table", () => {
  const rate = 0.0915;
  const expectations = [
    // monthly income (must be multiples of 1000), monthly premium from the table.
    [10000, 8052],
    [50000, 8052],
    [88000, 8052],
    [90000, 8052],
    [98000, 8967],
    [100000, 8967],
    [104000, 9516],
    [600000, 53985],
    [620000, 56730],
    [7140000, 56730], // annual income JPY ~100,000,000.
  ];
  for (const expectation of expectations) {
    const jp = new JapanTaxCalculator(
      expectation[0] * 14,
      10000,
      true,
      false,
      0
    );
    // The JPY 10000 deductions (iDeCo) should be ignored when calculating the premium.
    const premium =
      expectation[1] * 12 +
      // For bonuses, monthly max is JPY 1.5M.
      Math.round(Math.min(1500000, expectation[0]) * rate) * 2;
    expect(jp.getEmployeesPensionInsurancePremium()).toBeCloseTo(premium);
  }
});

test("JP nursing care insurance premium matches the table", () => {
  const rate = 0.01;
  const expectations = [
    // monthly income (must be multiples of 1000), monthly premium from the table.
    [10000, 580],
    [60000, 580],
    [62000, 580],
    [63000, 680],
    [70000, 680],
    [73000, 780],
    [1300000, 13300],
    [1355000, 13900],
    [7140000, 13900],
  ];
  for (const expectation of expectations) {
    const jp = new JapanTaxCalculator(
      expectation[0] * 14,
      10000,
      true,
      false,
      0
    );
    // The JPY 10000 deductions (iDeCo) should be ignored when calculating the premium.
    const premium =
      expectation[1] * 12 +
      // For bonuses, the total is capped at JPY ~5.7M.
      Math.round(Math.min(5730000 / 2, expectation[0]) * rate) * 2;
    expect(jp.getNursingCareInsurancePremium()).toBeCloseTo(premium);
  }
});

test("JP health insurance premium matches the table", () => {
  const rate = 0.0425;
  const expectations = [
    // monthly income (must be multiples of 1000), monthly premium from the table.
    [10000, 2465],
    [60000, 2465],
    [62000, 2465],
    [63000, 2890],
    [70000, 2890],
    [73000, 3315],
    [1300000, 56525],
    [1355000, 59075],
    [7140000, 59075],
  ];
  for (const expectation of expectations) {
    const jp = new JapanTaxCalculator(
      expectation[0] * 14,
      10000,
      true,
      false,
      0
    );
    // The JPY 10000 deductions (iDeCo) should be ignored when calculating the premium.
    const premium =
      expectation[1] * 12 +
      // For bonuses, the total is capped at JPY ~5.7M.
      Math.round(Math.min(5730000 / 2, expectation[0]) * rate) * 2;
    expect(jp.getHealthInsurancePremium()).toBeCloseTo(premium);
  }
});

test("JP spouseIncome takes income deductions into account", () => {
  const jp = new JapanTaxCalculator(10000000, 0, true, true, 1000000);
  expect(jp.spouseIncome).toBe(450000);
});

test("JP income deductions match table", () => {
  const expectations = [
    // gross income, deduction
    [600000, 550000],
    [1700000, 580000],
    [3000000, 980000],
    [5000000, 1440000],
    [8000000, 1900000],
    [8500000, 1950000],
    [10000000, 1950000],
  ];
  for (const expectation of expectations) {
    const jp = new JapanTaxCalculator(expectation[0], 0, true, false, 0);
    expect(jp.getIncomeDeductions(jp.grossIncome)).toBeCloseTo(expectation[1]);
  }
});

test("JP basic deductions match table", () => {
  const incomeDeductions = 10000;
  const expectations = [
    // gross income minus |incomeDeductions|, deduction
    [10000000, 480000],
    [24000000, 480000],
    [24000001, 320000],
    [24500000, 320000],
    [24500001, 160000],
    [25000000, 160000],
    [25000001, 0],
  ];
  for (const expectation of expectations) {
    const jp = new JapanTaxCalculator(
      expectation[0] + incomeDeductions,
      0,
      true,
      false,
      0
    );
    expect(jp.getBasicDeductions(false, incomeDeductions)).toBeCloseTo(
      expectation[1]
    );
  }
});

test("JP basic deductions for local tax match table", () => {
  const incomeDeductions = 10000;
  const expectations = [
    // gross income minus |incomeDeductions|, deduction
    [10000000, 430000],
    [24000000, 430000],
    [24000001, 290000],
    [24500000, 290000],
    [24500001, 150000],
    [25000000, 150000],
    [25000001, 0],
  ];
  for (const expectation of expectations) {
    const jp = new JapanTaxCalculator(
      expectation[0] + incomeDeductions,
      0,
      true,
      false,
      0
    );
    expect(jp.getBasicDeductions(true, incomeDeductions)).toBeCloseTo(
      expectation[1]
    );
  }
});

test("JP spouse deductions match table", () => {
  const incomeDeductions = 10000;
  const expectations = [
    // gross income minus |incomeDeductions|, deduction
    [9000000, 380000],
    [9000001, 260000],
    [9500000, 260000],
    [9500001, 130000],
    [10000000, 130000],
    [10000001, 0],
  ];
  for (const expectation of expectations) {
    const jp = new JapanTaxCalculator(
      expectation[0] + incomeDeductions,
      0,
      false,
      true,
      1000000
    );
    jp.spouseIncome = 480000; // overwrite the income to ignore getIncomeDeductions() results.
    expect(jp.getSpouseDeductions(false, incomeDeductions)).toBeCloseTo(
      expectation[1]
    );
    jp.spouseIncome = 480001; // above the threshold
    expect(jp.getSpouseDeductions(false, incomeDeductions)).toBeCloseTo(0);
  }
});

test("JP spouse deductions for local tax match table", () => {
  const incomeDeductions = 10000;
  const expectations = [
    // gross income minus |incomeDeductions|, deduction
    [9000000, 330000],
    [9000001, 220000],
    [9500000, 220000],
    [9500001, 110000],
    [10000000, 110000],
    [10000001, 0],
  ];
  for (const expectation of expectations) {
    const jp = new JapanTaxCalculator(
      expectation[0] + incomeDeductions,
      0,
      false,
      true,
      1000000
    );
    jp.spouseIncome = 380000; // overwrite the income to ignore getIncomeDeductions() results.
    expect(jp.getSpouseDeductions(true, incomeDeductions)).toBeCloseTo(
      expectation[1]
    );
    jp.spouseIncome = 380001; // above the threshold
    expect(jp.getSpouseDeductions(true, incomeDeductions)).toBeCloseTo(0);
  }
});

test("JP spouse special deductions match table", () => {
  const incomeDeductions = 10000;
  const expectations = [
    // gross income minus |incomeDeductions|, spouse income, deduction
    [9000000, 480001, 380000],
    [9000000, 950000, 380000],
    [9000000, 950001, 360000],
    [9000000, 1000000, 360000],
    [9000000, 1330000, 30000],
    [9000000, 1330001, 0],
    [9500001, 480001, 130000],
    [9500001, 950000, 130000],
    [9500001, 950001, 120000],
    [9500001, 1000000, 120000],
    [9500001, 1330000, 10000],
    [9500001, 1330001, 0],
    [10000001, 480001, 0],
  ];
  for (const expectation of expectations) {
    const jp = new JapanTaxCalculator(
      expectation[0] + incomeDeductions,
      0,
      false,
      true,
      1000000
    );
    jp.spouseIncome = 480000; // overwrite the income to ignore getIncomeDeductions() results.
    expect(jp.getSpouseSpecialDeductions(false, incomeDeductions)).toBeCloseTo(
      0
    );
    jp.spouseIncome = expectation[1];
    expect(jp.getSpouseSpecialDeductions(false, incomeDeductions)).toBeCloseTo(
      expectation[2]
    );
  }
});

test("JP spouse special deductions for local tax match table", () => {
  const incomeDeductions = 10000;
  const expectations = [
    // gross income minus |incomeDeductions|, spouse income, deduction
    [9000000, 380001, 330000],
    [9000000, 900000, 330000],
    [9000000, 900001, 310000],
    [9000000, 950000, 310000],
    [9000000, 1230000, 30000],
    [9000000, 1230001, 0],
    [9500001, 380001, 110000],
    [9500001, 900000, 110000],
    [9500001, 900001, 110000],
    [9500001, 950000, 110000],
    [9500001, 1230000, 10000],
    [9500001, 1230001, 0],
    [10000001, 380001, 0],
  ];
  for (const expectation of expectations) {
    const jp = new JapanTaxCalculator(
      expectation[0] + incomeDeductions,
      0,
      false,
      true,
      1000000
    );
    jp.spouseIncome = 380000; // overwrite the income to ignore getIncomeDeductions() results.
    expect(jp.getSpouseSpecialDeductions(true, incomeDeductions)).toBeCloseTo(
      0
    );
    jp.spouseIncome = expectation[1];
    expect(jp.getSpouseSpecialDeductions(true, incomeDeductions)).toBeCloseTo(
      expectation[2]
    );
  }
});

test("JP local tax is zero when the income is zero", () => {
  const jp = new JapanTaxCalculator(0, 0, false, false, 0);
  expect(jp.getLocalTax()).toBeCloseTo(0);
});

test("US deductions are calculated correctly", () => {
  const grossIncome = 100000;
  const deductions = 10000;
  const FSA = 1000;
  const HSA = 100;
  const SDI = grossIncome * 0.01;

  const us = new USCaliforniaTaxCalculator(
    grossIncome,
    deductions,
    FSA,
    HSA,
    0.5,
    false
  );
  // Federal recognises HSA and SDI.
  expect(us.getTotalDeductions(false)).toBeCloseTo(
    deductions + FSA + HSA + SDI + us.getStandardDeduction(false)
  );
  // ..but CA doesn't.
  expect(us.getTotalDeductions(true)).toBeCloseTo(
    deductions + FSA + us.getStandardDeduction(true)
  );
});

test("US standard deductions are calculated correctly", () => {
  const us = new USCaliforniaTaxCalculator(
    100000,
    10000,
    1000,
    100,
    0.5,
    false
  );
  const usSingle = new USCaliforniaTaxCalculator(
    100000,
    10000,
    1000,
    100,
    0.5,
    true
  );

  // Check that the standard deduction is higher for the federal return.
  expect(us.getStandardDeduction(false)).toBeGreaterThan(
    us.getStandardDeduction(true)
  );
  expect(usSingle.getStandardDeduction(false)).toBeGreaterThan(
    usSingle.getStandardDeduction(true)
  );

  // Also check that the standard deduction is higher for MFJ returns.
  expect(us.getStandardDeduction(false)).toBeGreaterThan(
    usSingle.getStandardDeduction(false)
  );
  expect(us.getStandardDeduction(true)).toBeGreaterThan(
    usSingle.getStandardDeduction(true)
  );
});

test("US taxable income calculations are correct", () => {
  // Deductions are larger than the gross income.
  const us = new USCaliforniaTaxCalculator(10000, 10000, 1000, 100, 0.5, false);
  // Verify it's not negative.
  expect(us.getTaxableIncome(false)).toBe(0);
  expect(us.getTaxableIncome(true)).toBe(0);
});

test("US federal income tax calculation is correct", () => {
  // https://us.thetaxcalculator.net/
  const expectations = [
    [20000, 0, 760],
    [40000, 1520, 3115],
    [80000, 6229, 10662],
    [160000, 21324, 29504],
    [320000, 59007, 82455],
    [640000, 164910, 196639],
    [1280000, 401573, 433439],
  ];
  for (const expectation of expectations) {
    const us = new USFederalTaxCalculator(expectation[0], 0, 0, 0, 1.0, false);
    const usSingle = new USFederalTaxCalculator(
      expectation[0],
      0,
      0,
      0,
      1.0,
      true
    );
    expect(us.getIncomeTax()).toBeCloseTo(expectation[1]);
    expect(usSingle.getIncomeTax()).toBeCloseTo(expectation[2]);
  }
});

test("US FICA tax calculation is correct", () => {
  // https://us.thetaxcalculator.net/, used single filing mode.
  // TODO: use MFJ too
  const expectations = [
    [20000, 1530],
    [40000, 3060],
    [80000, 6120],
    [160000, 10857],
    [320000, 14257],
    [640000, 21777],
    [1280000, 36817],
  ];
  for (const expectation of expectations) {
    const us = new USFederalTaxCalculator(expectation[0], 0, 0, 0, 1.0, false);
    const usSingle = new USFederalTaxCalculator(
      expectation[0],
      0,
      0,
      0,
      1.0,
      true
    );
    expect(us.getFICATax()).toBeCloseTo(expectation[1]);
    expect(usSingle.getFICATax()).toBeCloseTo(expectation[1]);
  }
});

test("WA local tax is zero", () => {
  // Deductions are larger than the gross income.
  const us = new USFederalTaxCalculator(100000, 0, 0, 0, 0.5, false);
  const usSingle = new USFederalTaxCalculator(100000, 0, 0, 0, 0.5, false);
  expect(us.getLocalTax()).toBe(0);
  expect(usSingle.getLocalTax()).toBe(0);
});
