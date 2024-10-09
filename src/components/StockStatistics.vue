<script setup lang="ts">
import { ref } from 'vue'
import { escapeNonword } from '@/exports/common_functions'

const stockList = JSON.parse(localStorage.getItem('SB5_stockList') || '[]')
const collator = new Intl.Collator(undefined, {
  usage: 'sort',
  numeric: true
})
const reduceCubic = (acc: number, item: Plywood) => (acc += item.quantityCubicTotal)

const footSizeSet = new Set() as Set<string>
const faceTypeSet = new Set() as Set<string>
const colorSet = new Set() as Set<string>

stockList
  .filter((item: Plywood) => item.quantityStatus > 0)
  .map((item: Plywood) => {
    if (item.attr.footSize) footSizeSet.add(item.attr.footSize)
    if (item.attr.faceType) faceTypeSet.add(item.attr.faceType)
    if (item.attr.color) colorSet.add(item.attr.color)
  })

const footSizeValues = Array.from(footSizeSet)
  .sort(collator.compare)
  .map((val) => {
    return { label: val, filter_fn: (item: Plywood) => item.attr.footSize === val }
  })
footSizeValues.unshift({ label: 'Razem', filter_fn: () => true })

const active = ref(0)
const collection = [
  {
    label: 'Laminaty - Surowe',
    stats: [
      { label: 'Razem', filter_fn: () => true },
      { label: 'Laminaty', filter_fn: (item: Plywood) => item.attr.faceGroup === 'laminat' },
      { label: 'Surowe', filter_fn: (item: Plywood) => item.attr.faceGroup === 'surowa' }
    ]
  },
  {
    label: 'WD - MR',
    stats: [
      { label: 'Razem', filter_fn: () => true },
      { label: 'WD', filter_fn: (item: Plywood) => item.attr.glueType === 'WD' },
      { label: 'MR', filter_fn: (item: Plywood) => item.attr.glueType === 'MR' }
    ]
  },
  {
    label: 'Laminaty WD - MR',
    stats: [
      { label: 'Razem', filter_fn: (item: Plywood) => item.attr.faceGroup === 'laminat' },
      {
        label: 'WD',
        filter_fn: (item: Plywood) =>
          item.attr.faceGroup === 'laminat' && item.attr.glueType === 'WD'
      },
      {
        label: 'MR',
        filter_fn: (item: Plywood) =>
          item.attr.faceGroup === 'laminat' && item.attr.glueType === 'MR'
      }
    ]
  },
  {
    label: 'Surowe WD - MR',
    stats: [
      { label: 'Razem', filter_fn: (item: Plywood) => item.attr.faceGroup === 'surowa' },
      {
        label: 'WD',
        filter_fn: (item: Plywood) =>
          item.attr.faceGroup === 'surowa' && item.attr.glueType === 'WD'
      },
      {
        label: 'MR',
        filter_fn: (item: Plywood) =>
          item.attr.faceGroup === 'surowa' && item.attr.glueType === 'MR'
      }
    ]
  },
  {
    label: 'F/W - F/F',
    stats: [
      { label: 'Razem', filter_fn: (item: Plywood) => item.attr.faceGroup === 'laminat' },
      {
        label: 'H+',
        filter_fn: (item: Plywood) =>
          item.attr.faceGroup === 'laminat' && item.attr.faceType.match(/\b(Heksa)\b/)
      },
      {
        label: 'F/W',
        filter_fn: (item: Plywood) =>
          item.attr.faceGroup === 'laminat' && item.attr.faceType.match(/\b(W)\b/)
      },
      {
        label: 'F/F',
        filter_fn: (item: Plywood) =>
          item.attr.faceGroup === 'laminat' && !item.attr.faceType.match(/\b(W|Heksa)\b/)
      }
    ]
  },
  {
    label: 'Pod Laser',
    stats: [
      {
        label: 'Razem',
        filter_fn: (item: Plywood) => item.attr.color?.match(/\bc\.less|honey|opal\b/i)
      },
      {
        label: 'C.less',
        filter_fn: (item: Plywood) => item.attr.color?.match(/\bc\.less\b/i)
      },
      {
        label: 'Opal',
        filter_fn: (item: Plywood) => item.attr.color?.match(/\bopal\b/i)
      },
      {
        label: 'Honey',
        filter_fn: (item: Plywood) => item.attr.color?.match(/\bhoney\b/i)
      }
    ]
  },
  {
    label: 'Brown',
    stats: [
      {
        label: 'Razem',
        filter_fn: (item: Plywood) => item.attr.color?.match(/\bbrown\b/i)
      },
      {
        label: 'H+',
        filter_fn: (item: Plywood) =>
          item.attr.color?.match(/\bbrown\b/i) && item.attr.faceType.match(/\b(Heksa)\b/)
      },
      {
        label: 'F/W',
        filter_fn: (item: Plywood) =>
          item.attr.color?.match(/\bbrown\b/i) && item.attr.faceType.match(/\b(W)\b/)
      },
      {
        label: 'F/F',
        filter_fn: (item: Plywood) =>
          item.attr.color?.match(/\bbrown\b/i) && !item.attr.faceType.match(/\b(W|Heksa)\b/)
      }
    ]
  },
  {
    label: 'White',
    stats: [
      {
        label: 'Razem',
        filter_fn: (item: Plywood) => item.attr.color?.match(/\bwhite\b/i)
      },
      {
        label: 'F/W',
        filter_fn: (item: Plywood) =>
          item.attr.color?.match(/\bwhite\b/i) && item.attr.faceType.match(/\b(W|Heksa)\b/)
      },
      {
        label: 'F/F',
        filter_fn: (item: Plywood) =>
          item.attr.color?.match(/\bwhite\b/i) && !item.attr.faceType.match(/\b(W|Heksa)\b/)
      }
    ]
  },
  {
    label: 'Grey',
    stats: [
      {
        label: 'Razem',
        filter_fn: (item: Plywood) => item.attr.color?.match(/\bgrey\b/i)
      },
      {
        label: 'H+',
        filter_fn: (item: Plywood) =>
          item.attr.color?.match(/\bgrey\b/i) && item.attr.faceType.match(/\b(Heksa)\b/)
      },
      {
        label: 'F/W',
        filter_fn: (item: Plywood) =>
          item.attr.color?.match(/\bgrey\b/i) && item.attr.faceType.match(/\b(W)\b/)
      },
      {
        label: 'F/F',
        filter_fn: (item: Plywood) =>
          item.attr.color?.match(/\bgrey\b/i) && !item.attr.faceType.match(/\b(W|Heksa)\b/)
      }
    ]
  },
  {
    label: 'Black',
    stats: [
      {
        label: 'Razem',
        filter_fn: (item: Plywood) => item.attr.color?.match(/\bblack\b/i)
      },
      {
        label: 'H+',
        filter_fn: (item: Plywood) =>
          item.attr.color?.match(/\bblack\b/i) && item.attr.faceType.match(/\b(Heksa)\b/)
      },
      {
        label: 'F/W',
        filter_fn: (item: Plywood) =>
          item.attr.color?.match(/\bblack\b/i) && item.attr.faceType.match(/\b(W)\b/)
      },
      {
        label: 'F/F',
        filter_fn: (item: Plywood) =>
          item.attr.color?.match(/\bblack\b/i) && !item.attr.faceType.match(/\b(W|Heksa)\b/)
      }
    ]
  }
]

function showHTML(rowFilter: Function, colFilter: Function) {
  const result = stockList.filter(rowFilter).filter(colFilter).reduce(reduceCubic, 0).toFixed(0)
  return `${result}<small>m<sup>3</sup></small>`
}
</script>

<template>
  <section id="stock-stats">
    <h2>Staystyki produktów</h2>

    <div class="toolbar">
      <button
        v-for="(item, index) in collection"
        :key="item.label"
        :class="{ active: active === index }"
        class="switch compact"
        @click="active = index"
      >
        {{ item.label }}
      </button>
    </div>

    <table>
      <tr>
        <th>Formaty</th>
        <th
          v-for="col in collection[active].stats"
          :key="`header-${escapeNonword(col.label)}`"
          v-html="col.label"
        ></th>
      </tr>

      <tr v-for="size in footSizeValues" :key="`size-row-${escapeNonword(size.label)}`">
        <th>{{ size.label }}</th>
        <td
          v-for="col in collection[active].stats"
          :key="`size-col-${escapeNonword(col.label)}`"
          v-html="showHTML(size.filter_fn, col.filter_fn)"
        ></td>
      </tr>
    </table>
  </section>
</template>

<style scoped>
#stock-stats {
  padding: 1ch;
}

.toolbar {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.toolbar button {
  width: auto;
}

table {
  margin-block: 1rem;
  border: solid 1px var(--accent-lighter);
  width: min(100%, 45ch);
}

tr:first-of-type th {
  background-color: var(--accent-lighter);
  color: var(--font-color);
}

tr:nth-of-type(2n) {
  background-color: var(--accent-lightest);
}

:is(th, td) {
  padding: 0.3ch 1ch;
}

:is(th, td):not(:first-child) {
  border-left: solid 1px var(--accent-lighter);
}

td {
  text-align: right;
}

td > div {
  display: grid;
  grid-template-columns: auto auto;
  gap: 1ch;
}

td > div:not(:first-of-type) {
  font-size: 0.85em;
}

td > div > :first-child {
  place-self: start;
  color: var(--grey-color);
}
</style>
