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
          <div class="mt-2 text-16 text-gray-600">
            ค่าที่เลือก: {{ optionLabelFor(province, provinceOptions) }}
          </div>
          <div class="text-16 text-gray-600">v-model: {{ province || '(ยังไม่ได้เลือก)' }}</div>
        </div>
      </div>

      <hr />

      <div id="demo-option-slot">
        <div class="mb-2 text-18 font-bold">
          slot: option — ใช้ครบทั้ง 4 scope prop (option / index / selected / highlighted)
        </div>
        <div class="max-w-xs">
          <Select
            v-model="provinceWithIcon"
            label="จังหวัด (option แบบ custom เต็มรูปแบบ)"
            placeholder="เลือกจังหวัด"
            :options="provinceOptions"
            :option-height="56"
          >
            <template #option="{ option, index, selected, highlighted }">
              <!-- icon นำหน้า — เทาตอน disabled -->
              <Svg
                src="common/info-circle"
                class="size-4 shrink-0"
                :class="option.disabled && 'opacity-40'"
              />

              <!-- 2 บรรทัด: label + บรรทัดรองที่ derive จาก option/index เอง (ไม่ได้มาจาก ISelectOption ตรงๆ) -->
              <span class="min-w-0 flex-1">
                <span
                  class="block truncate"
                  :class="option.disabled && 'text-gray-400'"
                  >{{ option.label }}</span
                >
                <span class="block truncate text-12 text-gray-500">
                  ลำดับที่ {{ index + 1 }} · value: {{ option.value }}
                </span>
              </span>

              <!-- badge ตอน disabled -->
              <span
                v-if="option.disabled"
                class="shrink-0 rounded bg-gray-200 px-1.5 py-0.5 text-12 text-gray-500"
              >
                ปิดใช้งาน
              </span>

              <!-- ลูกศรตอน highlighted (hover/กด arrow key ไล่มาถึง) -->
              <Svg
                v-if="highlighted && !option.disabled"
                src="common/arrow-right"
                class="size-3 shrink-0"
              />

              <!-- checkmark ของเราเอง ตอน selected -->
              <Svg
                v-if="selected"
                src="common/check"
                class="size-4 shrink-0"
                color="#f61414"
              />
            </template>
          </Select>
          <div class="mt-2 text-16 text-gray-600">
            ค่าที่เลือก: {{ optionLabelFor(provinceWithIcon, provinceOptions) }}
          </div>
          <div class="text-16 text-gray-600">
            v-model: {{ provinceWithIcon || '(ยังไม่ได้เลือก)' }}
          </div>
          <div class="mt-2 text-16 text-gray-600">
            แถวสูงขึ้นเพราะมี 2 บรรทัด เลยต้องเพิ่ม
            <code>:option-height="56"</code>
            (ปกติ default 44) ด้วย ไม่งั้น virtual-scroll คำนวณตำแหน่งพลาดเพราะความสูงจริงไม่ตรงกับที่บอกไว้
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-option-slot-multiple">
        <div class="mb-2 text-18 font-bold">slot: option + multiple (ต้องวาด checkbox เองด้วย)</div>
        <div class="max-w-xs">
          <Select
            v-model="tagsWithCustomCheckbox"
            multiple
            label="แท็ก (checkbox ทรงกลม custom เอง)"
            placeholder="เลือกแท็ก"
            :options="tagOptions"
          >
            <template #option="{ option, selected }">
              <!-- multiple ไม่มี checkbox สี่เหลี่ยม default ให้อัตโนมัติแล้วตอนใส่ slot — วาดเองตรงนี้ -->
              <span
                class="flex size-4 shrink-0 items-center justify-center rounded-full border-2"
                :class="selected ? 'border-main-1 bg-main-1' : 'border-gray-300'"
              >
                <span
                  v-if="selected"
                  class="size-1.5 rounded-full bg-white"
                ></span>
              </span>
              <span class="flex-1 truncate">{{ option.label }}</span>
            </template>
          </Select>
          <div class="mt-2 text-16 text-gray-600">
            ค่าที่เลือก: {{ optionLabelFor(tagsWithCustomCheckbox, tagOptions) }}
          </div>
          <div class="text-16 text-gray-600">
            v-model: {{ tagsWithCustomCheckbox.join(', ') || '(ยังไม่ได้เลือก)' }}
          </div>
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
          <div class="mt-2 text-16 text-gray-600">
            ค่าที่เลือก: {{ optionLabelFor(tags, tagOptions) }}
          </div>
          <div class="text-16 text-gray-600">
            v-model: {{ tags.join(', ') || '(ยังไม่ได้เลือก)' }}
          </div>
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
          <div class="mt-2 text-16 text-gray-600">
            ค่าที่เลือก: {{ optionLabelFor(searchableProvince, provinceOptions) }}
          </div>
          <div class="text-16 text-gray-600">
            v-model: {{ searchableProvince || '(ยังไม่ได้เลือก)' }}
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-emit-value-true">
        <div class="mb-2 text-18 font-bold">emitValue: true (default — v-model ได้ value ดิบ)</div>
        <div class="max-w-xs">
          <Select
            v-model="provinceemit"
            emit-value
            label="จังหวัด (ได้ value ดิบ)"
            placeholder="เลือกจังหวัด"
            :options="provinceOptions"
          />
          <div class="mt-2 text-16 text-gray-600">
            ค่าที่เลือก: {{ optionLabelFor(provinceemit, provinceOptions) }}
          </div>
          <div class="text-16 text-gray-600">v-model: {{ provinceemit || '(ยังไม่ได้เลือก)' }}</div>
        </div>
      </div>

      <hr />

      <div id="demo-emit-value-false">
        <div class="mb-2 text-18 font-bold">
          emitValue: false, mapOptions: true (v-model ได้ option object เต็มๆ)
        </div>
        <div class="max-w-xs">
          <Select
            v-model="provinceObject"
            :emit-value="false"
            label="จังหวัด (ได้ object เต็มๆ)"
            placeholder="เลือกจังหวัด"
            :options="provinceOptions"
          />
          <div class="mt-2 text-16 text-gray-600">
            ค่าที่เลือก: {{ optionLabelFor(provinceObject, provinceOptions) }}
          </div>
          <div class="text-16 text-gray-600">
            v-model: {{ provinceObject || '(ยังไม่ได้เลือก)' }}
          </div>
          <div class="text-16 text-gray-600">
            ตัวอย่างที่จะเอาไปใช้ (provinceObject.label):
            {{ (provinceObject && provinceObject.label) || '(ยังไม่ได้เลือก)' }}
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-map-options">
        <div class="mb-2 text-18 font-bold">
          mapOptions: false (trigger โชว์ค่าดิบ ไม่ resolve label)
        </div>
        <div class="max-w-xs">
          <Select
            v-model="provinceRaw"
            :map-options="false"
            label="จังหวัด (โชว์ value ดิบ)"
            placeholder="เลือกจังหวัด"
            :options="provinceOptions"
          />
          <div class="mt-2 text-16 text-gray-600">
            ค่าที่เลือก (raw, ไม่ resolve label): {{ provinceRaw || '(ยังไม่ได้เลือก)' }}
          </div>
          <div class="text-16 text-gray-600">v-model: {{ provinceRaw || '(ยังไม่ได้เลือก)' }}</div>
          <div class="mt-2 text-16 text-gray-600">
            เทียบกับ demo แรก (mapOptions default true) — เลือกจังหวัดเดียวกัน trigger จะโชว์ value
            ดิบ เช่น "chiang-mai" แทน "เชียงใหม่"
          </div>
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
            ค่าที่เลือก: {{ optionLabelFor(longValue, longOptions) }}
          </div>
          <div class="text-16 text-gray-600">v-model: {{ longValue || '(ยังไม่ได้เลือก)' }}</div>
          <div class="mt-2 text-16 text-gray-600">
            เปิด dev tools แล้วตรวจ DOM — จะมีแค่ option ส่วนน้อยที่ถูก render จริงในแต่ละขณะ
            ไม่ใช่ทั้ง 1,000 ตัว
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
          <div class="mt-2 text-16 text-gray-600">
            ค่าที่เลือก: {{ optionLabelFor(clearableProvince, provinceOptions) }}
          </div>
          <div class="text-16 text-gray-600">
            v-model: {{ clearableProvince || '(ยังไม่ได้เลือก)' }}
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-disabled-readonly">
        <div class="mb-2 text-18 font-bold">disabled / readonly</div>
        <div class="flex max-w-xs flex-col gap-3">
          <div>
            <Select
              v-model="disabledValue"
              disabled
              label="disabled"
              placeholder="เลือกจังหวัด"
              :options="provinceOptions"
            />
            <div class="mt-2 text-16 text-gray-600">
              ค่าที่เลือก: {{ optionLabelFor(disabledValue, provinceOptions) }}
            </div>
            <div class="text-16 text-gray-600">
              v-model: {{ disabledValue || '(ยังไม่ได้เลือก)' }}
            </div>
          </div>
          <div>
            <Select
              v-model="readonlyValue"
              readonly
              label="readonly"
              :options="provinceOptions"
            />
            <div class="mt-2 text-16 text-gray-600">
              ค่าที่เลือก: {{ optionLabelFor(readonlyValue, provinceOptions) }}
            </div>
            <div class="text-16 text-gray-600">
              v-model: {{ readonlyValue || '(ยังไม่ได้เลือก)' }}
            </div>
          </div>
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
          <div class="mt-2 text-16 text-gray-600">
            ค่าที่เลือก: {{ optionLabelFor(selectedUser, userOptions) }}
          </div>
          <div class="text-16 text-gray-600">v-model: {{ selectedUser || '(ยังไม่ได้เลือก)' }}</div>
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
          <div class="mt-2 text-16 text-gray-600">
            ค่าที่เลือก: {{ optionLabelFor(requiredValue, provinceOptions) }}
          </div>
          <div class="text-16 text-gray-600">
            v-model: {{ requiredValue || '(ยังไม่ได้เลือก)' }}
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-custom-style">
        <div class="mb-2 text-18 font-bold">
          customStyle (รวมสี hover/highlight/selected ใน panel)
        </div>
        <div class="max-w-xs">
          <Select
            v-model="customStyleValue"
            label="จังหวัด"
            placeholder="เลือกจังหวัด"
            :options="provinceOptions"
            :custom-style="{
              rounded: 'full',
              borderColor: '#0d6efd',
              focusColor: '#0d6efd',
              optionHoverColor: '#e0edff',
              optionSelectedColor: '#0d6efd',
              optionSelectedTextColor: '#ffffff',
            }"
          />
          <div class="mt-2 text-16 text-gray-600">
            ค่าที่เลือก: {{ optionLabelFor(customStyleValue, provinceOptions) }}
          </div>
          <div class="text-16 text-gray-600">
            v-model: {{ customStyleValue || '(ยังไม่ได้เลือก)' }}
          </div>
          <div class="mt-2 text-16 text-gray-600">
            เปิด dropdown แล้วลองเอาเมาส์วางบน option (สีฟ้าอ่อน) เทียบกับแถวที่เลือกไว้แล้ว
            (สีฟ้าเข้ม + ตัวอักษรขาว)
          </div>
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
            ค่าที่เลือก: {{ optionLabelFor(dynamicValue, dynamicOptions) }}
          </div>
          <div class="text-16 text-gray-600">v-model: {{ dynamicValue || '(ยังไม่ได้เลือก)' }}</div>
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

  type SelectDisplayValue = string | number | ISelectOption | (string | number)[] | ISelectOption[]

  // แสดง label ที่อ่านง่ายคู่กับ v-model ดิบในแต่ละ demo — ให้เห็นชัดว่า v-model เก็บ value/object อะไรจริงๆ ส่วน label ที่ผู้ใช้เห็นถูก resolve กับ options ต่างหาก
  const optionLabelFor = (value: SelectDisplayValue, options: ISelectOption[]): string => {
    const resolveOne = (entry: string | number | ISelectOption): string | undefined =>
      typeof entry === 'object'
        ? entry.label
        : options.find(option => option.value === entry)?.label

    if (Array.isArray(value)) {
      const labels = value.map(resolveOne).filter((label): label is string => !!label)
      return labels.length ? labels.join(', ') : '(ยังไม่ได้เลือก)'
    }

    if (value === '' || value == null) return '(ยังไม่ได้เลือก)'

    return resolveOne(value) ?? '(ยังไม่ได้เลือก)'
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
  const provinceWithIcon = ref('')
  const tags = ref<(string | number)[]>([])
  const tagsWithCustomCheckbox = ref<(string | number)[]>([])
  const searchableProvince = ref('')
  const provinceemit = ref('')
  const provinceObject = ref<ISelectOption | ''>('')
  const provinceRaw = ref('')
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
