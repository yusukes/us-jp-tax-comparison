<template>
  <v-container>
    <v-row class="text-left">
      <v-col class="mb-5">
        <div class="mb-5">
          This app calculates effective tax rates in Japan, California (where
          the state tax rate is the highest), and Washington (where there is no
          state tax) for each income level.
          <b
            >Disclaimer: Use this for illustrative purposes only. IANACPA, and
            I'm not even a real JavaScript programmer :p</b
          >
        </div>
        <v-expansion-panels>
          <v-expansion-panel
            class="mb-5"
            v-for="(assumption, i) in assumptions"
            :key="i"
          >
            <v-expansion-panel-header>{{
              assumption.title
            }}</v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-list>
                <v-list-item-group color="primary">
                  <v-list-item v-for="(item, j) in assumption.items" :key="j">
                    <v-list-item-content>
                      <v-list-item-title v-text="item"></v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
    <v-row class="text-left">
      <v-col class="mb-4">
        <h1 class="display-1 font-weight-bold mb-5" style="width: 300px">
          Global settings
        </h1>

        <v-form ref="globalSettings">
          <v-text-field
            v-model.number="forexRate"
            class="mb-5"
            label="Exchahge rate"
            :rules="forexRateRules"
            prefix="JPY/USD"
            type="number"
            hide-details="auto"
          >
          </v-text-field>

          <v-text-field
            v-model.number="minIncome"
            class="mb-5"
            label="Min household income to calculate"
            :rules="minIncomeRules"
            type="number"
            prefix="JPY"
            hide-details="auto"
          >
            <template v-slot:append>
              <v-subheader style="width: 150px"
                >USD {{ toUsd(minIncome).toLocaleString("en") }}</v-subheader
              >
            </template>
          </v-text-field>

          <v-text-field
            v-model.number="maxIncome"
            class="mb-6"
            label="Max household income to calculate"
            :rules="maxIncomeRules"
            type="number"
            prefix="JPY"
            hide-details="auto"
          >
            <template v-slot:append>
              <v-subheader style="width: 150px"
                >USD {{ toUsd(maxIncome).toLocaleString("en") }}</v-subheader
              >
            </template>
          </v-text-field>
        </v-form>

        <span>Calculation steps (in JPY 10,000)</span>
        <v-slider
          v-model="steps"
          class="align-center mb-5"
          :tick-labels="stepLabels"
          min="0"
          max="6"
          ticks="always"
          tick-size="4"
        />
        <span>The couple's income ratio for joint/dual filing</span>
        <v-slider
          v-model.number="incomeRatio"
          class="align-center mb-0"
          max="100"
          min="50"
          type="number"
          thumb-label
          hide-details
        />
        <v-subheader class="mb-0"
          >The first person's income: {{ incomeRatio }} % of the
          household</v-subheader
        >
        <v-subheader
          >The second person's income: {{ 100 - incomeRatio }} % of the
          household</v-subheader
        >
      </v-col>
      <v-col class="mb-4">
        <h1 class="display-1 font-weight-bold mb-5" style="width: 300px">
          US settings
        </h1>

        <v-form ref="usDeductions">
          <v-text-field
            v-model.number="usSingleDeductions"
            class="mb-5"
            label="Deductions for single filing (e.g. 401k)"
            :rules="usDeductionsRules"
            type="number"
            prefix="USD"
            hide-details="auto"
          >
          </v-text-field>
          <v-text-field
            v-model.number="usSingleDeductionsFSA"
            class="mb-5"
            label="FSA deductions for single filing"
            :rules="usDeductionsRules"
            type="number"
            prefix="USD"
            hide-details="auto"
          >
          </v-text-field>
          <v-text-field
            v-model.number="usSingleDeductionsHSA"
            class="mb-5"
            label="HSA deductions for single filing"
            :rules="usDeductionsRules"
            type="number"
            prefix="USD"
            hide-details="auto"
          >
          </v-text-field>

          <v-text-field
            v-model.number="usJointDeductions"
            class="mb-5"
            label="Total household deductions for joint filing"
            :rules="usDeductionsRules"
            prefix="USD"
            type="number"
            hide-details="auto"
          >
          </v-text-field>
          <v-text-field
            v-model.number="usJointDeductionsFSA"
            class="mb-5"
            label="Total household FSA deductions for joint filing"
            :rules="usDeductionsRules"
            type="number"
            prefix="USD"
            hide-details="auto"
          >
          </v-text-field>
          <v-text-field
            v-model.number="usJointDeductionsHSA"
            class="mb-5"
            label="Total household HSA deductions for joint filing"
            :rules="usDeductionsRules"
            type="number"
            prefix="USD"
            hide-details="auto"
          >
          </v-text-field>
        </v-form>
      </v-col>
      <v-col class="mb-4">
        <h1 class="display-1 font-weight-bold mb-5" style="width: 300px">
          Japan settings
        </h1>

        <v-form ref="jpDeductions">
          <v-text-field
            v-model.number="jpSingleDeductions"
            class="mb-5"
            label="Deductions for single filing (e.g. iDeCo)"
            :rules="jpSingleDeductionsRules"
            type="number"
            prefix="JPY"
            hide-details="auto"
          >
          </v-text-field>
          <v-text-field
            v-model.number="jpDualDeductions1"
            class="mb-5"
            label="Deductions for dual filing (person 1)"
            :rules="jpDualDeductions1Rules"
            type="number"
            prefix="JPY"
            hide-details="auto"
          >
          </v-text-field>
          <v-text-field
            v-model.number="jpDualDeductions2"
            class="mb-5"
            label="Deductions for dual filing (person 2)"
            :rules="jpDualDeductions2Rules"
            type="number"
            prefix="JPY"
            hide-details="auto"
          >
          </v-text-field>
        </v-form>
      </v-col>
    </v-row>
    <v-row class="text-left">
      <v-col class="mb-4">
        <v-btn small class="mr-5" @click="resetToDefault"
          >Reset to default</v-btn
        >
        <v-btn small color="primary" @click="calculate">Calculate</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {
  JapanTaxCalculator,
  USFederalTaxCalculator,
  USCaliforniaTaxCalculator,
} from "./Calc.js";
import { EventBus } from "../main.js";

// Defaults
const FOREX_RATE = 100;
const MIN_INCOME = 2500000; // USD ~25k annual
const MAX_INCOME = 120000000; // USD ~1.2M annual
const US_SINGLE_DEDUCTIONS = 19500;
const US_SINGLE_DEDUCTIONS_FSA = 2750;
const US_SINGLE_DEDUCTIONS_HSA = 3550;
const US_JOINT_DEDUCTIONS = US_SINGLE_DEDUCTIONS;
const US_JOINT_DEDUCTIONS_FSA = US_SINGLE_DEDUCTIONS_FSA;
const US_JOINT_DEDUCTIONS_HSA = 7100;
const JP_SINGLE_DEDUCTIONS = 276000;
const JP_DUAL_DEDUCTIONS_1 = JP_SINGLE_DEDUCTIONS;
const JP_DUAL_DEDUCTIONS_2 = 0;
const INCOME_RATIO = 50;
const STEPS = 4;

export default {
  name: "TaxComparison",
  computed: {
    forexRateRules() {
      return [
        (value) =>
          (parseInt(value) >= 10 && parseInt(value) <= 1000) ||
          "Must be 10-1000",
      ];
    },
    minIncomeRules() {
      return [
        (value) =>
          parseInt(value) >= 1000000 || "Must be larger than JPY 1,000,000.",
        (value) =>
          parseInt(value) < this.maxIncome ||
          "Must be smaller than the max income.",
      ];
    },
    maxIncomeRules() {
      return [
        (value) =>
          parseInt(value) > this.minIncome ||
          "Must be larger than the min income.",
      ];
    },
    usDeductionsRules() {
      return [
        (value) =>
          this.toJpy(parseInt(value)) <= this.maxIncome ||
          "Must be smaller than the max income.",
      ];
    },
    jpSingleDeductionsRules() {
      return [
        (value) =>
          parseInt(value) <= this.maxIncome ||
          "Must be smaller than the max income.",
      ];
    },
    jpDualDeductions1Rules() {
      return [
        (value) =>
          parseInt(value) <= (this.maxIncome * this.incomeRatio) / 100 ||
          "Must be smaller than the person's man income.",
      ];
    },
    jpDualDeductions2Rules() {
      return [
        (value) =>
          parseInt(value) <=
            (this.maxIncome * (100 - this.incomeRatio)) / 100 ||
          "Must be smaller than the person's max income.",
      ];
    },
  },
  watch: {
    forexRate: ["validateUsFields", "updateUrl"],
    minIncome: ["validateAllFields", "updateUrl"],
    maxIncome: ["validateGlobalFields", "updateUrl"],
    usSingleDeductions: "updateUrl",
    usSingleDeductionsFSA: "updateUrl",
    usSingleDeductionsHSA: "updateUrl",
    usJointDeductions: "updateUrl",
    usJointDeductionsFSA: "updateUrl",
    usJointDeductionsHSA: "updateUrl",
    jpSingleDeductions: "updateUrl",
    jpDualDeductions1: "updateUrl",
    jpDualDeductions2: "updateUrl",
    incomeRatio: ["validateJpFields", "updateUrl"],
    steps: "updateUrl",
    calc: "updateUrl",
  },
  methods: {
    updateUrl() {
      let queryString = [];
      if (this.forexRate != FOREX_RATE)
        queryString.push("forexRate=" + this.forexRate);
      if (this.minIncome != MIN_INCOME)
        queryString.push("minIncome=" + this.minIncome);
      if (this.maxIncome != MAX_INCOME)
        queryString.push("maxIncome=" + this.maxIncome);
      if (this.usSingleDeductions != US_SINGLE_DEDUCTIONS)
        queryString.push("usSingleDeductions=" + this.usSingleDeductions);
      if (this.usSingleDeductionsFSA != US_SINGLE_DEDUCTIONS_FSA)
        queryString.push("usSingleDeductionsFSA=" + this.usSingleDeductionsFSA);
      if (this.usSingleDeductionsHSA != US_SINGLE_DEDUCTIONS_HSA)
        queryString.push("usSingleDeductionsHSA=" + this.usSingleDeductionsHSA);
      if (this.usJointDeductions != US_JOINT_DEDUCTIONS)
        queryString.push("usJointDeductions=" + this.usJointDeductions);
      if (this.usJointDeductionsFSA != US_JOINT_DEDUCTIONS_FSA)
        queryString.push("usJointDeductionsFSA=" + this.usJointDeductionsFSA);
      if (this.usJointDeductionsHSA != US_JOINT_DEDUCTIONS_HSA)
        queryString.push("usJointDeductionsHSA=" + this.usJointDeductionsHSA);
      if (this.jpSingleDeductions != JP_SINGLE_DEDUCTIONS)
        queryString.push("jpSingleDeductions=" + this.jpSingleDeductions);
      if (this.jpDualDeductions1 != JP_DUAL_DEDUCTIONS_1)
        queryString.push("jpDualDeductions1=" + this.jpDualDeductions1);
      if (this.jpDualDeductions2 != JP_DUAL_DEDUCTIONS_2)
        queryString.push("jpDualDeductions2=" + this.jpDualDeductions2);
      if (this.incomeRatio != INCOME_RATIO)
        queryString.push("incomeRatio=" + this.incomeRatio);
      if (this.steps != STEPS) queryString.push("steps=" + this.steps);
      if (this.calc) queryString.push("calc=true");

      let newUrl = window.location.href.split("?")[0];
      if (queryString.length > 0) newUrl += "?" + queryString.join("&");
      window.history.pushState({ path: newUrl }, "", newUrl);
    },
    validateAllFields() {
      const v1 = this.$refs.globalSettings.validate();
      const v2 = this.$refs.usDeductions.validate();
      const v3 = this.$refs.jpDeductions.validate();
      return v1 && v2 && v3;
    },
    validateGlobalFields() {
      this.$refs.globalSettings.validate();
    },
    validateUsFields() {
      this.$refs.usDeductions.validate();
    },
    validateJpFields() {
      this.$refs.jpDeductions.validate();
    },
    toUsd(jpy) {
      return Math.ceil(jpy / this.forexRate);
    },
    toJpy(usd) {
      return Math.ceil(usd * this.forexRate);
    },
    resetToDefault() {
      this.forexRate = FOREX_RATE;
      this.minIncome = MIN_INCOME;
      this.maxIncome = MAX_INCOME;
      this.usSingleDeductions = US_SINGLE_DEDUCTIONS;
      this.usSingleDeductionsFSA = US_SINGLE_DEDUCTIONS_FSA;
      this.usSingleDeductionsHSA = US_SINGLE_DEDUCTIONS_HSA;
      this.usJointDeductions = US_JOINT_DEDUCTIONS;
      this.usJointDeductionsFSA = US_JOINT_DEDUCTIONS_FSA;
      this.usJointDeductionsHSA = US_JOINT_DEDUCTIONS_HSA;
      this.jpSingleDeductions = JP_SINGLE_DEDUCTIONS;
      this.jpDualDeductions1 = JP_DUAL_DEDUCTIONS_1;
      this.jpDualDeductions2 = JP_DUAL_DEDUCTIONS_2;
      this.incomeRatio = INCOME_RATIO;
      this.steps = STEPS;
      this.calc = false;
    },

    calculate() {
      if (!this.validateAllFields()) return;
      this.minIncome = Math.round(this.minIncome / 1000) * 1000;
      this.maxIncome = Math.round(this.maxIncome / 1000) * 1000;

      let jpSingle = [];
      let jpMarried = [];
      this.calculateJp(true, jpSingle);
      this.calculateJp(false, jpMarried);

      let usSingle = [];
      let usJoint = [];
      this.calculateUs(true, usSingle);
      this.calculateUs(false, usJoint);

      EventBus.$emit("calculated", {
        jpSingleItems: jpSingle,
        usSingleItems: usSingle,
        jpMarriedItems: jpMarried,
        incomeRatio: this.incomeRatio,
        usJointItems: usJoint,
      });
      this.calc = true;
    },

    calculateJp(singleFiling, result) {
      const step = this.stepLabels[this.steps] * 10000;
      const useSpouseDeductions = !singleFiling;
      for (let i = this.minIncome; i <= this.maxIncome; i += step) {
        const income = (i * this.incomeRatio) / 100;
        const spouseIncome = i - income;
        const jp1 = new JapanTaxCalculator(
          singleFiling ? i : income,
          singleFiling ? this.jpSingleDeductions : this.jpDualDeductions1,
          singleFiling,
          useSpouseDeductions,
          spouseIncome
        );
        const item = {};
        item["p1"] = {};
        this.calculateJpInternal(jp1, useSpouseDeductions, item["p1"]);
        let householdNetIncome = item["p1"]["jpNetIncome"];
        if (!singleFiling) {
          item["jpGrossIncome"] = i;
          const jp2 = new JapanTaxCalculator(
            spouseIncome,
            this.jpDualDeductions2,
            false, // singleFiling
            false, // useSpouseDeductions
            0
          ); // spouseIncome
          item["p2"] = {};
          this.calculateJpInternal(
            jp2,
            false /* useSpouseDeductions */,
            item["p2"]
          );
          householdNetIncome += item["p2"]["jpNetIncome"];
          const totalTax = i - householdNetIncome;
          item["jpTotalTax"] = totalTax;
          item["jpEffectiveTaxRate"] = jp2.toThousandths(totalTax / i);
          item["jpNetIncome"] = Math.round(householdNetIncome);
        }
        result.push(item);
      }
    },

    calculateJpInternal(jp, useSpouseDeductions, item) {
      const incomeDeductions = jp.getIncomeDeductions(jp.grossIncome);
      item["jpGrossIncome"] = jp.grossIncome;
      item["jpIncomeDeductions"] = incomeDeductions;
      item["jpBasicDeductions"] = jp.getBasicDeductions(
        false,
        incomeDeductions
      );
      item["jpBasicDeductionsForLocalTax"] = jp.getBasicDeductions(
        true,
        incomeDeductions
      );
      if (useSpouseDeductions) {
        item["jpSpouseDeductions"] = jp.getSpouseDeductions(
          false,
          incomeDeductions
        );
        item["jpSpouseDeductionsForLocalTax"] = jp.getSpouseDeductions(
          true,
          incomeDeductions
        );
        item["jpSpouseSpecialDeductions"] = jp.getSpouseSpecialDeductions(
          false,
          incomeDeductions
        );
        item[
          "jpSpouseSpecialDeductionsForLocalTax"
        ] = jp.getSpouseSpecialDeductions(true, incomeDeductions);
      }
      item["jpIncomeTax"] = jp.getIncomeTax();
      item["jpLocalTax"] = jp.getLocalTax();
      item["jpPensionInsurance"] = jp.getEmployeesPensionInsurancePremium();
      item["jpHealthInsurance"] = jp.getHealthInsurancePremium();
      item["jpNursingCareInsurance"] = jp.getNursingCareInsurancePremium();
      item["jpEmploymentInsurance"] = jp.getEmploymentInsurancePremium();
      item["jpTotalFICATax"] = jp.getFICATax();
      item["jpTotalTax"] = jp.getTotalTax();
      item["jpEffectiveTaxRate"] = jp.getEffectiveTaxRate();
      item["jpNetIncome"] = jp.getNetIncome();
    },

    calculateUs(singleFiling, result) {
      const step = this.stepLabels[this.steps] * 10000;
      for (let i = this.minIncome; i <= this.maxIncome; i += step) {
        const us = new USFederalTaxCalculator(
          this.toUsd(i),
          singleFiling ? this.usSingleDeductions : this.usJointDeductions,
          singleFiling ? this.usSingleDeductionsFSA : this.usJointDeductionsFSA,
          singleFiling ? this.usSingleDeductionsHSA : this.usJointDeductionsHSA,
          singleFiling ? 1.0 : this.incomeRatio / 100,
          singleFiling
        );
        const item = {};
        item["usGrossIncomeJPY"] = i;
        item["usGrossIncomeUSD"] = this.toUsd(i);
        item["usIncomeTax"] = us.getIncomeTax();
        item["usSocialSecurityTax"] = us.getSocialSecurityTax();
        item["usMedicareTax"] = us.getMedicareTax();
        item["usTotalFICATax"] = us.getFICATax();
        item["waTotalTax"] = us.getTotalTax();
        item["waEffectiveTaxRate"] = us.getEffectiveTaxRate();
        item["waNetIncomeUSD"] = us.getNetIncome();
        item["waNetIncomeJPY"] = this.toJpy(us.getNetIncome());
        const ca = new USCaliforniaTaxCalculator(
          this.toUsd(i),
          singleFiling ? this.usSingleDeductions : this.usJointDeductions,
          singleFiling ? this.usSingleDeductionsFSA : this.usJointDeductionsFSA,
          singleFiling ? this.usSingleDeductionsHSA : this.usJointDeductionsHSA,
          singleFiling ? 1.0 : this.incomeRatio / 100,
          singleFiling
        );
        item["caStateTax"] = ca.getLocalTax();
        item["caSDITax"] = ca.getSDITax();
        item["caTotalTax"] = ca.getTotalTax();
        item["caEffectiveTaxRate"] = ca.getEffectiveTaxRate();
        item["caNetIncomeUSD"] = ca.getNetIncome();
        item["caNetIncomeJPY"] = this.toJpy(ca.getNetIncome());
        result.push(item);
      }
    },
  },
  created() {
    if (this.$route.query.forexRate !== undefined)
      this.forexRate = parseInt(this.$route.query.forexRate);
    if (this.$route.query.minIncome !== undefined)
      this.minIncome = parseInt(this.$route.query.minIncome);
    if (this.$route.query.maxIncome !== undefined)
      this.maxIncome = parseInt(this.$route.query.maxIncome);
    if (this.$route.query.usSingleDeductions !== undefined)
      this.usSingleDeductions = parseInt(this.$route.query.usSingleDeductions);
    if (this.$route.query.usSingleDeductionsFSA !== undefined)
      this.usSingleDeductionsFSA = parseInt(
        this.$route.query.usSingleDeductionsFSA
      );
    if (this.$route.query.usSingleDeductionsHSA !== undefined)
      this.usSingleDeductionsHSA = parseInt(
        this.$route.query.usSingleDeductionsHSA
      );
    if (this.$route.query.usJointDeductions !== undefined)
      this.usJointDeductions = parseInt(this.$route.query.usJointDeductions);
    if (this.$route.query.usJointDeductionsFSA !== undefined)
      this.usJointDeductionsFSA = parseInt(
        this.$route.query.usJointDeductionsFSA
      );
    if (this.$route.query.usJointDeductionsHSA !== undefined)
      this.usJointDeductionsHSA = parseInt(
        this.$route.query.usJointDeductionsHSA
      );
    if (this.$route.query.jpSingleDeductions !== undefined)
      this.jpSingleDeductions = parseInt(this.$route.query.jpSingleDeductions);
    if (this.$route.query.jpDualDeductions1 !== undefined)
      this.jpDualDeductions1 = parseInt(this.$route.query.jpDualDeductions1);
    if (this.$route.query.jpDualDeductions2 !== undefined)
      this.jpDualDeductions2 = parseInt(this.$route.query.jpDualDeductions2);
    if (this.$route.query.incomeRatio !== undefined)
      this.incomeRatio = parseInt(this.$route.query.incomeRatio);
    if (this.$route.query.steps !== undefined)
      this.steps = parseInt(this.$route.query.steps);
    if (this.$route.query.calc !== undefined)
      this.calc = this.$route.query.calc == "true";
  },
  mounted() {
    // To check if the initial values via the query string are valid.
    if (this.calc) this.calculate();
    else this.validateAllFields();
  },
  data: () => ({
    assumptions: [
      {
        title: "Assumptions",
        items: ["Tax year 2020", "Age 40", "No kids, no other dependents"],
      },
      {
        title: "Assumptions for US tax calculations",
        items: [
          "Standard deduction only. No itemized deductions",
          "No deductions/credits other than 401(k), HSA, and FSA",
          "Single and Married Filing Jointly (MFJ) only",
        ],
      },
      {
        title: "Assumptions for JP tax calculations",
        items: [
          "No deductions/credits other than iDeCo",
          "No foreign RSU income (that could lower your JP FICA taxes)",
          "No transportation expenses (that could increase your JP FICA taxes)",
          "Bonus: twice a year. Each bonus is equal to a full month's pay",
        ],
      },
      /*
      {
        title: "Key findings",
        items: [
          "Japan's effective tax rates are generally higher than the ones in CA/WA",
          "In Japan, singles and single-income families get (almost equally) higher taxes",
          "Dual-income families in Japan get lower taxes especially when the couple's income ratio is close to 50:50",
          "In the US, single filers get higher taxes",
          "MFJ filers in the US get lower taxes regardless of whether they both work.",
          "Dual-income families in the US get slightly higher taxes than the single-income ones because of increased SS taxes",
        ],
      },
      */
    ],
    forexRate: FOREX_RATE,
    minIncome: MIN_INCOME,
    maxIncome: MAX_INCOME,
    usSingleDeductions: US_SINGLE_DEDUCTIONS,
    usSingleDeductionsFSA: US_SINGLE_DEDUCTIONS_FSA,
    usSingleDeductionsHSA: US_SINGLE_DEDUCTIONS_HSA,
    usJointDeductions: US_JOINT_DEDUCTIONS,
    usJointDeductionsFSA: US_JOINT_DEDUCTIONS_FSA,
    usJointDeductionsHSA: US_JOINT_DEDUCTIONS_HSA,
    jpSingleDeductions: JP_SINGLE_DEDUCTIONS,
    jpDualDeductions1: JP_DUAL_DEDUCTIONS_1,
    jpDualDeductions2: JP_DUAL_DEDUCTIONS_2,
    incomeRatio: INCOME_RATIO,
    stepLabels: [10, 25, 50, 100, 250, 500, 1000],
    steps: STEPS,
    calc: false,
  }),
};
</script>
