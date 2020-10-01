<template>
  <v-container>
    <v-row class="mb-0">
      <h1 class="display-1 font-weight-bold mb-5" style="width: 300px">
        Raw data
      </h1>
    </v-row>
    <v-row class="text-left mb-2">
      <span>Japan - Single</span>
    </v-row>
    <v-row class="text-left mb-5">
      <v-simple-table dense="dense" :fixed-header="fixedHeader" height="50vh">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">Gross income in JPY</th>
              <th class="text-left">Income deductions</th>
              <th class="text-left">Basic deductions</th>
              <th class="text-left">Basic deductions (for local tax)</th>
              <th class="text-left">Income tax</th>
              <th class="text-left">Local tax</th>
              <th class="text-left">Employee's pension insurance</th>
              <th class="text-left">Health insurance</th>
              <th class="text-left">Nursing care insurance</th>
              <th class="text-left">Employment insurance</th>
              <th class="text-left">Total FICA tax</th>
              <th class="text-left">Total tax</th>
              <th class="text-left">Effective tax rate</th>
              <th class="text-left">Net income in JPY</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in jpSingleItems" :key="item.jpGrossIncome">
              <td>{{ item.p1.jpGrossIncome }}</td>
              <td>{{ item.p1.jpIncomeDeductions }}</td>
              <td>{{ item.p1.jpBasicDeductions }}</td>
              <td>{{ item.p1.jpBasicDeductionsForLocalTax }}</td>
              <td>{{ item.p1.jpIncomeTax }}</td>
              <td>{{ item.p1.jpLocalTax }}</td>
              <td>{{ item.p1.jpPensionInsurance }}</td>
              <td>{{ item.p1.jpHealthInsurance }}</td>
              <td>{{ item.p1.jpNursingCareInsurance }}</td>
              <td>{{ item.p1.jpEmploymentInsurance }}</td>
              <td>{{ item.p1.jpTotalFICATax }}</td>
              <td>{{ item.p1.jpTotalTax }}</td>
              <td>{{ item.p1.jpEffectiveTaxRate }}</td>
              <td>{{ item.p1.jpNetIncome }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-row>
    <v-row class="text-left mb-2">
      <span>US - Single</span>
    </v-row>
    <v-row class="text-left mb-5">
      <v-simple-table dense="dense" :fixed-header="fixedHeader" height="50vh">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">Gross income in JPY</th>
              <th class="text-left">Gross income in USD</th>
              <th class="text-left">Federal income tax</th>
              <th class="text-left">Social security tax</th>
              <th class="text-left">Medicare tax</th>
              <th class="text-left">Total FICA tax</th>
              <th class="text-left">WA total tax</th>
              <th class="text-left">WA effective tax rate</th>
              <th class="text-left">WA net income in USD</th>
              <th class="text-left">WA net income in JPY</th>
              <th class="text-left">CA state tax</th>
              <th class="text-left">CA SDI tax</th>
              <th class="text-left">CA total tax</th>
              <th class="text-left">CA effective tax rate</th>
              <th class="text-left">CA net income in USD</th>
              <th class="text-left">CA net income in JPY</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in usSingleItems" :key="item.usGrossIncomeJPY">
              <td>{{ item.usGrossIncomeJPY }}</td>
              <td>{{ item.usGrossIncomeUSD }}</td>
              <td>{{ item.usIncomeTax }}</td>
              <td>{{ item.usSocialSecurityTax }}</td>
              <td>{{ item.usMedicareTax }}</td>
              <td>{{ item.usTotalFICATax }}</td>
              <td>{{ item.waTotalTax }}</td>
              <td>{{ item.waEffectiveTaxRate }}</td>
              <td>{{ item.waNetIncomeUSD }}</td>
              <td>{{ item.waNetIncomeJPY }}</td>
              <td>{{ item.caStateTax }}</td>
              <td>{{ item.caSDITax }}</td>
              <td>{{ item.caTotalTax }}</td>
              <td>{{ item.caEffectiveTaxRate }}</td>
              <td>{{ item.caNetIncomeUSD }}</td>
              <td>{{ item.caNetIncomeJPY }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-row>
    <v-row class="text-left mb-2">
      <span
        >Japan - Married, income ratio {{ incomeRatio }}:{{
          100 - incomeRatio
        }}</span
      >
    </v-row>
    <v-row class="text-left mb-5">
      <v-simple-table dense="dense" :fixed-header="fixedHeader" height="50vh">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">Gross income in JPY (household)</th>
              <th class="text-left">1: Gross income in JPY</th>
              <th class="text-left">1: Income deductions</th>
              <th class="text-left">1: Basic deductions</th>
              <th class="text-left">1: Basic deductions (for local tax)</th>
              <th class="text-left">1: Spouse deductions</th>
              <th class="text-left">1: Spouse deductions (for local tax)</th>
              <th class="text-left">1: Spouse special deductions</th>
              <th class="text-left">
                1: Spouse special deductions (for local tax)
              </th>
              <th class="text-left">1: Income tax</th>
              <th class="text-left">1: Local tax</th>
              <th class="text-left">1: Employee's pension insurance</th>
              <th class="text-left">1: Health insurance</th>
              <th class="text-left">1: Nursing care insurance</th>
              <th class="text-left">1: Employment insurance</th>
              <th class="text-left">1: Total FICA tax</th>
              <th class="text-left">1: Total tax</th>
              <th class="text-left">1: Effective tax rate</th>
              <th class="text-left">1: Net income in JPY</th>
              <th class="text-left">2: Gross income in JPY</th>
              <th class="text-left">2: Income deductions</th>
              <th class="text-left">2: Basic deductions</th>
              <th class="text-left">2: Basic deductions (for local tax)</th>
              <th class="text-left">2: Income tax</th>
              <th class="text-left">2: Local tax</th>
              <th class="text-left">2: Employee's pension insurance</th>
              <th class="text-left">2: Health insurance</th>
              <th class="text-left">2: Nursing care insurance</th>
              <th class="text-left">2: Employment insurance</th>
              <th class="text-left">2: Total FICA tax</th>
              <th class="text-left">2: Total tax</th>
              <th class="text-left">2: Effective tax rate</th>
              <th class="text-left">2: Net income in JPY</th>
              <th class="text-left">Total tax (household)</th>
              <th class="text-left">Effective tax rate (household)</th>
              <th class="text-left">Net income in JPY (household)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in jpMarriedItems" :key="item.jpGrossIncome">
              <td>{{ item.jpGrossIncome }}</td>
              <td>{{ item.p1.jpGrossIncome }}</td>
              <td>{{ item.p1.jpIncomeDeductions }}</td>
              <td>{{ item.p1.jpBasicDeductions }}</td>
              <td>{{ item.p1.jpBasicDeductionsForLocalTax }}</td>
              <td>{{ item.p1.jpSpouseDeductions }}</td>
              <td>{{ item.p1.jpSpouseDeductionsForLocalTax }}</td>
              <td>{{ item.p1.jpSpouseSpecialDeductions }}</td>
              <td>{{ item.p1.jpSpouseSpecialDeductionsForLocalTax }}</td>
              <td>{{ item.p1.jpIncomeTax }}</td>
              <td>{{ item.p1.jpLocalTax }}</td>
              <td>{{ item.p1.jpPensionInsurance }}</td>
              <td>{{ item.p1.jpHealthInsurance }}</td>
              <td>{{ item.p1.jpNursingCareInsurance }}</td>
              <td>{{ item.p1.jpEmploymentInsurance }}</td>
              <td>{{ item.p1.jpTotalFICATax }}</td>
              <td>{{ item.p1.jpTotalTax }}</td>
              <td>{{ item.p1.jpEffectiveTaxRate }}</td>
              <td>{{ item.p1.jpNetIncome }}</td>
              <td>{{ item.p2.jpGrossIncome }}</td>
              <td>{{ item.p2.jpIncomeDeductions }}</td>
              <td>{{ item.p2.jpBasicDeductions }}</td>
              <td>{{ item.p2.jpBasicDeductionsForLocalTax }}</td>
              <td>{{ item.p2.jpIncomeTax }}</td>
              <td>{{ item.p2.jpLocalTax }}</td>
              <td>{{ item.p2.jpPensionInsurance }}</td>
              <td>{{ item.p2.jpHealthInsurance }}</td>
              <td>{{ item.p2.jpNursingCareInsurance }}</td>
              <td>{{ item.p2.jpEmploymentInsurance }}</td>
              <td>{{ item.p2.jpTotalFICATax }}</td>
              <td>{{ item.p2.jpTotalTax }}</td>
              <td>{{ item.p2.jpEffectiveTaxRate }}</td>
              <td>{{ item.p2.jpNetIncome }}</td>
              <td>{{ item.jpTotalTax }}</td>
              <td>{{ item.jpEffectiveTaxRate }}</td>
              <td>{{ item.jpNetIncome }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-row>
    <v-row class="text-left mb-2">
      <span
        >US - Married filing jointly, income ratio {{ incomeRatio }}:{{
          100 - incomeRatio
        }}</span
      >
    </v-row>
    <v-row class="text-left mb-5">
      <v-simple-table dense="dense" :fixed-header="fixedHeader" height="50vh">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">Gross income in JPY</th>
              <th class="text-left">Gross income in USD</th>
              <th class="text-left">Federal income tax</th>
              <th class="text-left">Social security tax</th>
              <th class="text-left">Medicare tax</th>
              <th class="text-left">Total FICA tax</th>
              <th class="text-left">WA total tax</th>
              <th class="text-left">WA effective tax rate</th>
              <th class="text-left">WA net income in USD</th>
              <th class="text-left">WA net income in JPY</th>
              <th class="text-left">CA state tax</th>
              <th class="text-left">CA SDI tax</th>
              <th class="text-left">CA total tax</th>
              <th class="text-left">CA effective tax rate</th>
              <th class="text-left">CA net income in USD</th>
              <th class="text-left">CA net income in JPY</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in usJointItems" :key="item.usGrossIncomeJPY">
              <td>{{ item.usGrossIncomeJPY }}</td>
              <td>{{ item.usGrossIncomeUSD }}</td>
              <td>{{ item.usIncomeTax }}</td>
              <td>{{ item.usSocialSecurityTax }}</td>
              <td>{{ item.usMedicareTax }}</td>
              <td>{{ item.usTotalFICATax }}</td>
              <td>{{ item.waTotalTax }}</td>
              <td>{{ item.waEffectiveTaxRate }}</td>
              <td>{{ item.waNetIncomeUSD }}</td>
              <td>{{ item.waNetIncomeJPY }}</td>
              <td>{{ item.caStateTax }}</td>
              <td>{{ item.caSDITax }}</td>
              <td>{{ item.caTotalTax }}</td>
              <td>{{ item.caEffectiveTaxRate }}</td>
              <td>{{ item.caNetIncomeUSD }}</td>
              <td>{{ item.caNetIncomeJPY }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-row>
  </v-container>
</template>

<script>
import { EventBus } from "../main.js";

export default {
  name: "TaxTable",
  created() {
    EventBus.$on("calculated", (items) => {
      this.jpSingleItems = items.jpSingleItems;
      this.usSingleItems = items.usSingleItems;
      this.jpMarriedItems = items.jpMarriedItems;
      this.incomeRatio = items.incomeRatio;
      this.usJointItems = items.usJointItems;
    });
  },
  data: () => ({
    jpSingleItems: [],
    usSingleItems: [],
    jpMarriedItems: [],
    usJointItems: [],
    incomeRatio: 0,
    fixedHeader: true,
  }),
};
</script>
