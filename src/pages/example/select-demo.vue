<template>
  <div class="container">
    <div>Select Demo</div>

    <SelectDocs class="mb-4" />

    <hr />

    <div class="mt-6 flex flex-col gap-6">
      <div id="demo-basic">
        <div class="mb-2 text-18 font-bold">single-select พื้นฐาน</div>
        <div class="max-w-xs">
          <Select
            v-model="province"
            label="จังหวัด"
            placeholder="เลือกจังหวัด"
            :options="provinceOptions"
          />
          <div class="mt-2 text-16 text-gray-600">ค่าที่เลือก: {{ province || '(ยังไม่ได้เลือก)' }}</div>
        </div>
      </div>

      <hr />

      <div id="demo-multiple">
        <div class="mb-2 text-18 font-bold">multiple</div>
        <div class="max-w-xs">
          <Select
            v-model="tags"
            multiple
            label="แท็ก"
            placeholder="เลือกแท็ก"
            :options="tagOptions"
          />
          <div class="mt-2 text-16 text-gray-600">ค่าที่เลือก: {{ tags.join(', ') || '(ยังไม่ได้เลือก)' }}</div>
        </div>
      </div>

      <hr />

      <div id="demo-searchable">
        <div class="mb-2 text-18 font-bold">searchable</div>
        <div class="max-w-xs">
          <Select
            v-model="searchableProvince"
            searchable
            label="จังหวัด (ค้นหาได้)"
            placeholder="พิมพ์เพื่อค้นหา"
            :options="provinceOptions"
          />
        </div>
      </div>

      <hr />

      <div id="demo-virtual-scroll">
        <div class="mb-2 text-18 font-bold">ลิสต์ยาว 1,000 รายการ (virtual scroll)</div>
        <div class="max-w-xs">
          <Select
            v-model="longValue"
            searchable
            label="ตัวเลือก 1,000 รายการ"
            placeholder="เลือกตัวเลือก"
            :options="longOptions"
          />
          <div class="mt-2 text-16 text-gray-600">
            เปิด dev tools แล้วตรวจ DOM — จะมีแค่ option ส่วนน้อยที่ถูก render จริงในแต่ละขณะ ไม่ใช่ทั้ง 1,000 ตัว
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-clearable">
        <div class="mb-2 text-18 font-bold">clearable</div>
        <div class="max-w-xs">
          <Select
            v-model="clearableProvince"
            clearable
            label="จังหวัด"
            placeholder="เลือกจังหวัด"
            :options="provinceOptions"
          />
        </div>
      </div>

      <hr />

      <div id="demo-disabled-readonly">
        <div class="mb-2 text-18 font-bold">disabled / readonly</div>
        <div class="flex max-w-xs flex-col gap-3">
          <Select
            v-model="disabledValue"
            disabled
            label="disabled"
            placeholder="เลือกจังหวัด"
            :options="provinceOptions"
          />
          <Select
            v-model="readonlyValue"
            readonly
            label="readonly"
            :options="provinceOptions"
          />
        </div>
      </div>

      <hr />

      <div id="demo-loading">
        <div class="mb-2 text-18 font-bold">loading (โหลด options จาก API จริง)</div>
        <div class="max-w-xs">
          <Select
            v-model="selectedUser"
            :loading="loadingUsers"
            label="ผู้ใช้ (จาก jsonplaceholder.typicode.com)"
            :placeholder="loadingUsers ? 'กำลังโหลด...' : 'เลือกผู้ใช้'"
            :options="userOptions"
          />
          <Button
            class="mt-2"
            variant="secondary"
            :disabled="loadingUsers"
            label="โหลดใหม่"
            @click="fetchUsers"
          />
        </div>
      </div>

      <hr />

      <div id="demo-required-rules">
        <div class="mb-2 text-18 font-bold">required + rules</div>
        <div class="max-w-xs">
          <Select
            ref="requiredSelectRef"
            v-model="requiredValue"
            required
            label="จังหวัด"
            placeholder="เลือกจังหวัด"
            :options="provinceOptions"
          />
          <Button
            class="mt-2"
            variant="secondary"
            label="เช็ค validate()"
            @click="requiredSelectRef?.validate()"
          />
        </div>
      </div>

      <hr />

      <div id="demo-custom-style">
        <div class="mb-2 text-18 font-bold">customStyle</div>
        <div class="max-w-xs">
          <Select
            v-model="customStyleValue"
            label="จังหวัด"
            placeholder="เลือกจังหวัด"
            :options="provinceOptions"
            :custom-style="{ rounded: 'full', borderColor: '#0d6efd', focusColor: '#0d6efd' }"
          />
        </div>
      </div>

      <hr />

      <div id="demo-options-change">
        <div class="mb-2 text-18 font-bold">options เปลี่ยนหลังมีค่าเลือกไว้แล้ว</div>
        <div class="max-w-xs">
          <Select
            v-model="dynamicValue"
            label="ชุดข้อมูล"
            :options="dynamicOptions"
          />
          <Button
            class="mt-2"
            variant="secondary"
            label="สลับชุด options"
            @click="swapDynamicOptions"
          />
          <div class="mt-2 text-16 text-gray-600">
            ค่าที่เลือกจากชุดเดิม (ที่อาจไม่มีอยู่ในชุดใหม่แล้ว) จะแสดงว่างอย่างสุภาพ ไม่ crash
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import SelectDocs from './_components/SelectDocs.vue'
  // ต้องเป็น relative path ห้ามใช้ '@/...' — alias จะ resolve ผ่าน ambient shim (*.vue มีแค่ default export) ทำให้มองไม่เห็น named type export นี้เลย ส่วน relative path ให้ vue-tsc ไปอ่าน SFC จริงได้ตรงๆ
  import type { ISelectOption } from '../../components/form/Select.vue'

  interface SelectExposed {
    hasError: boolean
    errorMessage: string
    validate: () => void
  }

  const provinceOptions: ISelectOption[] = [
    { label: 'กรุงเทพมหานคร', value: 'bangkok' },
    { label: 'เชียงใหม่', value: 'chiang-mai' },
    { label: 'ขอนแก่น', value: 'khon-kaen' },
    { label: 'ภูเก็ต', value: 'phuket' },
    { label: 'ชลบุรี', value: 'chonburi' },
    { label: 'นครราชสีมา (ปิดใช้งาน)', value: 'nakhon-ratchasima', disabled: true },
  ]

  const tagOptions: ISelectOption[] = [
    { label: 'ลูกค้าใหม่', value: 'new' },
    { label: 'ลูกค้าเก่า', value: 'returning' },
    { label: 'VIP', value: 'vip' },
    { label: 'สมัครสมาชิก', value: 'member' },
  ]

  const longOptions: ISelectOption[] = Array.from({ length: 1000 }, (_, i) => ({
    label: `ตัวเลือกที่ ${i + 1}`,
    value: i + 1,
  }))

  const dynamicOptionSets: ISelectOption[][] = [
    [
      { label: 'ชุด A - หนึ่ง', value: 'a1' },
      { label: 'ชุด A - สอง', value: 'a2' },
    ],
    [
      { label: 'ชุด B - หนึ่ง', value: 'b1' },
      { label: 'ชุด B - สอง', value: 'b2' },
    ],
  ]

  const province = ref('')
  const tags = ref<(string | number)[]>([])
  const searchableProvince = ref('')
  const longValue = ref('')
  const clearableProvince = ref('bangkok')
  const disabledValue = ref('bangkok')
  const readonlyValue = ref('phuket')
  const requiredValue = ref('')
  const customStyleValue = ref('')
  const dynamicValue = ref('a1')

  const dynamicOptionSetIndex = ref(0)
  const dynamicOptions = computed(() => dynamicOptionSets[dynamicOptionSetIndex.value])

  const swapDynamicOptions = (): void => {
    dynamicOptionSetIndex.value = dynamicOptionSetIndex.value === 0 ? 1 : 0
  }

  const requiredSelectRef = ref<SelectExposed | null>(null)

  interface IJsonPlaceholderUser {
    id: number
    name: string
  }

  const loadingUsers = ref(false)
  const userOptions = ref<ISelectOption[]>([])
  const selectedUser = ref('')

  // เรียก API ภายนอกจริง (เหมือน api-demo.vue) เพื่อโชว์ loading prop ระหว่างรอ options มาจริงๆ ไม่ใช่ setTimeout จำลอง
  const fetchUsers = async (): Promise<void> => {
    loadingUsers.value = true
    selectedUser.value = ''

    try {
      const users = await apiRaw<IJsonPlaceholderUser[]>({
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/users',
      })
      userOptions.value = users.map(user => ({ label: user.name, value: user.id }))
    } catch (e) {
      const { title, message } = getErrorDisplay(e)
      showDialogError(title, message)
    } finally {
      loadingUsers.value = false
    }
  }

  onMounted(fetchUsers)
</script>

<style scoped lang="scss">
  .container {
    padding: 12px;
  }

  [id^='demo-'] {
    scroll-margin-top: 72px;
  }
</style>

<route lang="yaml">
meta:
  layout: default
  navtop:
    back_to: '/example'
    title: 'Select Demo'
  main:
    image: true
  navbottom:
    active: false
    current: 'example'
</route>
