<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>US/JP effective tax rate comparisons</v-toolbar-title>
    </v-app-bar>
    <v-main>
      <TaxComparison />
      <TaxChart />
      <TaxTable v-show="calculated" />
    </v-main>
  </v-app>
</template>

<script>
import TaxComparison from "./components/TaxComparison";
import TaxChart from "./components/TaxChart";
import TaxTable from "./components/TaxTable";
import { EventBus } from "./main.js";

export default {
  name: "App",
  components: {
    TaxComparison,
    TaxChart,
    TaxTable,
  },
  created() {
    EventBus.$on("calculated", () => {
      this.calculated = true;
    });
  },
  data: () => ({
    calculated: false,
  }),
};
</script>
