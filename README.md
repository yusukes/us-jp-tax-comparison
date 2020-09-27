# us-jp-tax-comparison
An app that calculates effective tax rates in Japan, California (where the state tax rate is the highest), and Washington (where there is no state tax) for each income level. The app is for tax year 2020.

**Disclaimer: Use this for illustrative purposes only. IANACPA, and I'm not even a real JavaScript programmer :p**

## Examples

1. The couple's income ratio = 50:50 (which lowers JP income tax), some contributions to 401(k), iDeCo, etc. [Link](https://yusukes.github.io/us-jp-tax-comparison/#/?calc=true)
1. The couple's income ratio = 100:0 (which raises JP income tax), some contributions to 401(k), iDeCo, etc. [Link](https://yusukes.github.io/us-jp-tax-comparison/#/?incomeRatio=100&calc=true)
1. The couple's income ratio = 90:10, no deductions at all. This demonstrates "the wall of JPY 1,060,000" (106万円の壁). [Link](https://yusukes.github.io/us-jp-tax-comparison/#/?minIncome=10000000&maxIncome=20000000&usSingleDeductions=0&usSingleDeductionsFSA=0&usSingleDeductionsHSA=0&usJointDeductions=0&usJointDeductionsFSA=0&usJointDeductionsHSA=0&jpSingleDeductions=0&jpDualDeductions1=0&incomeRatio=90&steps=0&calc=true)
