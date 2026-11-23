<script setup lang="ts">
import { ref } from 'vue'
import Select, { type ISelectOption } from '@/components/input/Select.vue'

// The review page for Select, one example per prop (see pages/examples/).
const SELECT_OPTIONS: ISelectOption[] = [
  { label: 'กรุงเทพมหานคร', value: 'bkk' },
  { label: 'เชียงใหม่', value: 'cnx' },
  { label: 'ขอนแก่น', value: 'kkc' },
  { label: 'ภูเก็ต', value: 'hkt' },
  { label: 'สงขลา (ไม่เปิดให้เลือก)', value: 'sgz', disabled: true },
]

const selectSingle = ref<string | number>('')
const selectFilled = ref<string | number>('cnx')
const selectSearch = ref<string | number>('')
const selectMulti = ref<(string | number)[]>(['bkk', 'hkt'])
const selectClearable = ref<string | number>('kkc')
const selectDisabled = ref<string | number>('bkk')
const selectRequired = ref<string | number>('')
const selectHelper = ref<string | number>('')
const selectLoading = ref<string | number>('')
</script>

<template>
  <div class="flex flex-col gap-8 px-5 pb-8">
    <section class="flex flex-col gap-4">
      <h2 class="text-20 font-bold text-content">Select</h2>

      <Select
        v-model="selectSingle"
        label="เลือกจังหวัด"
        placeholder="เลือก"
        :options="SELECT_OPTIONS"
      />
      <Select v-model="selectFilled" label="มีค่าอยู่แล้ว" :options="SELECT_OPTIONS" />
      <Select
        v-model="selectSearch"
        label="ค้นหาได้"
        placeholder="พิมพ์เพื่อค้นหา"
        searchable
        search-placeholder="ค้นหาจังหวัด"
        no-options-text="ไม่พบข้อมูล"
        :options="SELECT_OPTIONS"
      />
      <Select v-model="selectMulti" label="เลือกได้หลายอัน" multiple :options="SELECT_OPTIONS" />
      <Select v-model="selectClearable" label="Clearable" clearable :options="SELECT_OPTIONS" />
      <Select v-model="selectDisabled" label="Disabled" disabled :options="SELECT_OPTIONS" />
      <Select
        v-model="selectHelper"
        label="มีข้อความช่วย"
        placeholder="เลือก"
        helper-text="ข้อความช่วยใต้ช่องเลือก"
        :options="SELECT_OPTIONS"
      />
      <Select
        v-model="selectRequired"
        label="จำเป็นต้องเลือก"
        placeholder="เลือก"
        required
        required-message="กรุณาเลือกจังหวัด"
        :options="SELECT_OPTIONS"
      />
      <Select
        v-model="selectLoading"
        label="กำลังโหลด"
        loading
        loading-text="กำลังโหลด..."
        :options="[]"
      />
    </section>
  </div>
</template>
