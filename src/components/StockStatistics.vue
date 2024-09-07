<script setup lang="ts">
const stockList = JSON.parse(localStorage.getItem('SB5_stockList') || '[]')
const sumCubic = (acc: number, item: Plywood) => (acc += item.quantityCubicTotal)

const face = {
  f_faceAll: { func: () => true, label: 'Razem' },
  f_faceLam: { func: (item: Plywood) => item.attr.faceGroup === 'laminat', label: 'Laminaty' },
  f_faceWood: { func: (item: Plywood) => item.attr.faceGroup === 'surowa', label: 'Surowe' }
}

const glue = {
  f_glueAll: { func: () => true, label: 'Razem' },
  f_glueExt: { func: (item: Plywood) => item.attr.glueType === 'WD', label: 'WD' },
  f_glueInt: { func: (item: Plywood) => item.attr.glueType === 'MR', label: 'MR' }
}

const size = {
  f_sizeAll: { func: () => true, label: 'Wszystkie' },
  f_sizeS: { func: (item: Plywood) => item.attr.footSize === "4x8'", label: "4x8'" },
  f_sizeM: { func: (item: Plywood) => item.attr.footSize === "5x8'", label: "5x8'" },
  f_sizeL: { func: (item: Plywood) => item.attr.footSize === "5x10'", label: "5x10'" },
  f_sizeV: { func: (item: Plywood) => item.attr.footSize === "7x~'", label: 'Verems' },
  f_sizeK: { func: (item: Plywood) => item.attr.footSize === "5x5'", label: 'kwadraty' },
  f_sizeOther: {
    func: (item: Plywood) => !item.attr.footSize.match(/4x8|5x5|5x8|5x10|7x~/),
    label: 'inne'
  }
}

function allStocks(firstFilter: Function, secondFilter: Function) {
  return `${stockList.filter(firstFilter).filter(secondFilter).reduce(sumCubic, 0).toFixed(0)}<small>m<sup>3</sup></small>`
}
function lamStocks(firstFilter: Function, secondFilter: Function) {
  const lam = face.f_faceLam.func
  return `${stockList.filter(lam).filter(firstFilter).filter(secondFilter).reduce(sumCubic, 0).toFixed(0)}<small>m<sup>3</sup></small>`
}
</script>

<template>
  <section>
    <h2>Staystyki produktów</h2>
    <table>
      <tr>
        <th>Formaty</th>
        <th v-for="col in face" :key="`th-${col.label}`" v-html="col.label"></th>
      </tr>
      <tr v-for="row in size" :key="`tr-${row.label}`">
        <th v-html="row.label"></th>
        <td
          v-for="col in face"
          :key="`td-${col.label}`"
          v-html="allStocks(row.func, col.func)"
        ></td>
      </tr>
    </table>

    <table>
      <tr>
        <th>Formaty</th>
        <th v-for="col in glue" :key="`th-${col.label}`" v-html="col.label"></th>
      </tr>
      <tr v-for="row in size" :key="`tr-${row.label}`">
        <th v-html="row.label"></th>
        <td
          v-for="col in glue"
          :key="`td-${col.label}`"
          v-html="allStocks(row.func, col.func)"
        ></td>
      </tr>
    </table>
    <table>
      <tr>
        <th>Formaty</th>
        <th v-for="col in glue" :key="`th-${col.label}`" v-html="col.label"></th>
      </tr>
      <tr v-for="row in size" :key="`tr-${row.label}`">
        <th v-html="row.label"></th>
        <td
          v-for="col in glue"
          :key="`td-${col.label}`"
          v-html="lamStocks(row.func, col.func)"
        ></td>
      </tr>
    </table>
  </section>
</template>

<style scoped>
table {
  margin-block: 1rem;
}
:is(th, td) {
  padding: 0.3ch 1ch;
}

:is(th, td):not(:first-child) {
  border-left: solid 1px var(--accent-lighter);
}

tr:nth-of-type(2n) {
  background-color: var(--accent-lightest);
}

th {
  width: 12ch;
}

td {
  text-align: right;
}
</style>
