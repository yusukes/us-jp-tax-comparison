<script>
import { Line } from "vue-chartjs";
import { EventBus } from "../main.js";

export default {
  name: "TaxChart",
  extends: Line,
  created() {
    EventBus.$on("calculated", (items) => {
      this.chartdata.labels = [];
      this.chartdata.datasets = [];

      const jpData = {
        label: "Japan - Single",
        backgroundColor: "#b61827",
        borderColor: "#b6182788",
        fill: false,
        data: [],
      };
      const waData = {
        label: "Washington - Single",
        backgroundColor: "#5f4339",
        borderColor: "#5f433988",
        fill: false,
        data: [],
      };
      const caData = {
        label: "California - Single",
        backgroundColor: "#0077c2",
        borderColor: "#0077c288",
        fill: false,
        data: [],
      };
      const jpMarriedData = {
        label:
          "Japan - Married, income ratio " +
          items.incomeRatio +
          ":" +
          (100 - items.incomeRatio),
        backgroundColor: "#ff867c",
        borderColor: "#ff867c88",
        fill: false,
        data: [],
      };
      const waJointData = {
        label: "Washington - Married filing jointly",
        backgroundColor: "#be9c91",
        borderColor: "#be9c9188",
        fill: false,
        data: [],
      };
      const caJointData = {
        label: "California - Married filing jointly",
        backgroundColor: "#80d6ff",
        borderColor: "#80d6ff88",
        fill: false,
        data: [],
      };

      items.jpSingleItems.forEach((item) => {
        this.chartdata.labels.push(item.p1.jpGrossIncome);
        jpData.data.push(item.p1.jpEffectiveTaxRate);
      }, this);
      items.usSingleItems.forEach((item) => {
        waData.data.push(item.waEffectiveTaxRate);
        caData.data.push(item.caEffectiveTaxRate);
      });
      items.jpMarriedItems.forEach((item) => {
        jpMarriedData.data.push(item.jpEffectiveTaxRate);
      });
      items.usJointItems.forEach((item) => {
        waJointData.data.push(item.waEffectiveTaxRate);
        caJointData.data.push(item.caEffectiveTaxRate);
      });

      this.chartdata.datasets.push(jpData);
      this.chartdata.datasets.push(waData);
      this.chartdata.datasets.push(caData);
      this.chartdata.datasets.push(jpMarriedData);
      this.chartdata.datasets.push(waJointData);
      this.chartdata.datasets.push(caJointData);

      this.renderChart(this.chartdata, this.options);
    });
  },
  data: () => ({
    chartdata: {
      labels: [],
      datasets: [],
    },
    options: {
      elements: {
        line: {
          tension: 0,
        },
      },
      maintainAspectRatio: false,
      scales: {
        xAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
              labelString: "Gross (Household) Income in JPY",
            },
          },
        ],
        yAxes: [
          {
            display: true,
            ticks: {
              beginAtZero: true,
              stepSize: 0.05,
            },
            scaleLabel: {
              display: true,
              labelString: "Effective Tax Rate",
            },
          },
        ],
      },
    },
  }),
};
</script>
