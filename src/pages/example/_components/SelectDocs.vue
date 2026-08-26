<template>
  <div class="mt-4 flex flex-col gap-4 rounded-lg border border-gray-300 bg-white p-3 text-18">
    <div>
      <div class="mb-2 font-bold">Props</div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[560px] border-collapse text-left text-16">
          <thead>
            <tr class="border-b border-gray-300">
              <th class="py-1 pr-2 font-bold">prop</th>
              <th class="py-1 pr-2 font-bold">type</th>
              <th class="py-1 pr-2 font-bold">default</th>
              <th class="py-1 font-bold">คำอธิบาย</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in propsTable"
              :key="row.name"
              class="border-b border-gray-100 align-top"
            >
              <td class="py-1.5 pr-2 whitespace-nowrap font-bold text-main-1">{{ row.name }}</td>
              <td class="py-1.5 pr-2 whitespace-nowrap text-gray-500">{{ row.type }}</td>
              <td class="py-1.5 pr-2 whitespace-nowrap text-gray-500">{{ row.default }}</td>
              <td class="py-1.5 leading-relaxed">{{ row.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div>
      <div class="mb-2 font-bold">customStyle (field ย่อยใน object)</div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[560px] border-collapse text-left text-16">
          <thead>
            <tr class="border-b border-gray-300">
              <th class="py-1 pr-2 font-bold">field</th>
              <th class="py-1 pr-2 font-bold">type</th>
              <th class="py-1 font-bold">คำอธิบาย</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in customStyleTable"
              :key="row.name"
              class="border-b border-gray-100 align-top"
            >
              <td class="py-1.5 pr-2 whitespace-nowrap font-bold text-main-1">{{ row.name }}</td>
              <td class="py-1.5 pr-2 whitespace-nowrap text-gray-500">{{ row.type }}</td>
              <td class="py-1.5 leading-relaxed">{{ row.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div>
      <div class="mb-2 font-bold">Slots</div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[560px] table-fixed border-collapse text-left text-16">
          <thead>
            <tr class="border-b border-gray-300">
              <th class="w-20 py-1 pr-2 font-bold">slot</th>
              <th class="w-32 py-1 pr-2 font-bold">scope</th>
              <th class="py-1 font-bold">คำอธิบาย</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in slotsTable"
              :key="row.name"
              class="border-b border-gray-100 align-top"
            >
              <td class="py-1.5 pr-2 font-bold text-main-1">{{ row.name }}</td>
              <td class="py-1.5 pr-2 text-14 break-words text-gray-500">{{ row.type }}</td>
              <td class="py-1.5 leading-relaxed">{{ row.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div>
      <div class="mb-2 font-bold">Events</div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[420px] border-collapse text-left text-16">
          <thead>
            <tr class="border-b border-gray-300">
              <th class="py-1 pr-2 font-bold">event</th>
              <th class="py-1 pr-2 font-bold">payload</th>
              <th class="py-1 font-bold">คำอธิบาย</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in eventsTable"
              :key="row.name"
              class="border-b border-gray-100 align-top"
            >
              <td class="py-1.5 pr-2 whitespace-nowrap font-bold text-main-1">{{ row.name }}</td>
              <td class="py-1.5 pr-2 whitespace-nowrap text-gray-500">{{ row.payload }}</td>
              <td class="py-1.5 leading-relaxed">{{ row.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div>
      <div class="mb-2 font-bold">defineExpose (เรียกผ่าน template ref)</div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[420px] border-collapse text-left text-16">
          <thead>
            <tr class="border-b border-gray-300">
              <th class="py-1 pr-2 font-bold">member</th>
              <th class="py-1 pr-2 font-bold">type</th>
              <th class="py-1 font-bold">คำอธิบาย</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in exposedTable"
              :key="row.name"
              class="border-b border-gray-100 align-top"
            >
              <td class="py-1.5 pr-2 whitespace-nowrap font-bold text-main-1">{{ row.name }}</td>
              <td class="py-1.5 pr-2 whitespace-nowrap text-gray-500">{{ row.type }}</td>
              <td class="py-1.5 leading-relaxed">{{ row.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div>
      <div class="mb-2 font-bold">ตัวอย่างการเขียนแต่ละ prop</div>
      <div class="flex flex-col gap-3">
        <div
          v-for="example in examples"
          :key="example.title"
        >
          <button
            type="button"
            class="mb-1 flex items-center gap-1 text-16 font-bold text-gray-500 hover:text-main-1"
            @click="scrollToDemo(example.target)"
          >
            {{ example.title }}
            <Svg
              src="common/arrow-right"
              class="size-3 rotate-90"
            />
          </button>
          <pre
            class="overflow-x-auto rounded-md bg-gray-900 p-2 text-[10px] leading-relaxed text-white"
            >{{ example.code }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  interface DocRow {
    name: string
    type: string
    default?: string
    payload?: string
    description: string
  }

  const propsTable: DocRow[] = [
    { name: 'label', type: 'string', default: "''", description: 'label แบบ stack อยู่เหนือ control' },
    {
      name: 'labelSpace',
      type: 'boolean',
      default: 'false',
      description: 'เว้นพื้นที่ label แม้ label ว่าง เพื่อเรียงให้ตรงกับ field อื่นที่มี label',
    },
    { name: 'placeholder', type: 'string', default: "''", description: 'ข้อความตอนยังไม่ได้เลือก' },
    { name: 'helperText', type: 'string', default: "''", description: 'ข้อความช่วยเหลือใต้ control' },
    {
      name: 'rules',
      type: 'IValidationRule[]',
      default: '[]',
      description: 'validator เรียงตามลำดับ ใช้ pattern เดียวกับ TextField',
    },
    {
      name: 'options',
      type: 'Record<string, unknown>[]',
      default: '(required)',
      description:
        'รายการตัวเลือก — ปกติเป็น { label, value, disabled? } ผ่านตรงๆ ได้เลย แต่ก็รับ shape อื่นได้ถ้าตั้ง optionValue/optionLabel/optionDisabled คู่กัน — เปลี่ยน options ระหว่างมีค่าเลือกอยู่ได้ปลอดภัย ค่าที่หาไม่เจอจะแสดงว่างแทนที่จะพัง',
    },
    {
      name: 'optionValue / optionLabel / optionDisabled',
      type: "string | ((option) => value)",
      default: "'value' / 'label' / 'disabled'",
      description:
        "แบบ Quasar's option-value/option-label/option-disabled — ใส่ชื่อ field (string) หรือฟังก์ชันดึงค่าเอง ใช้ตอน options ไม่ได้เป็น { label, value, disabled } ตรงๆ เช่น API ตอบ { id, name } ก็ใส่ option-value=\"id\" option-label=\"name\" โดยไม่ต้อง map array เองก่อน",
    },
    {
      name: 'dropdownIcon / clearIcon',
      type: 'string',
      default: "'common/chevron-down' / 'common/x-close'",
      description: "แบบ Quasar's dropdown-icon/clear-icon — เปลี่ยน path ไอคอนได้ (ใช้ convention Svg src เดียวกับที่ใช้ทั่วโปรเจกต์)",
    },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'ปิดการใช้งานทั้งหมด' },
    {
      name: 'readonly',
      type: 'boolean',
      default: 'false',
      description: 'ห้ามเปิด panel/เปลี่ยนค่า แต่ยัง focus/tab ได้',
    },
    {
      name: 'loading',
      type: 'boolean',
      default: 'false',
      description:
        'แสดง spinner แทนไอคอน chevron และกันเปิด panel ไว้ก่อน (เช่น ระหว่างรอ options โหลดจาก API) — ไม่ทำให้ trigger เทาเหมือน disabled',
    },
    { name: 'required', type: 'boolean', default: 'false', description: 'บังคับต้องมีค่าตอน validate' },
    {
      name: 'clearable',
      type: 'boolean',
      default: 'false',
      description: 'แสดงปุ่ม × ล้างค่า — multi-select ล้างเป็น [] โดยไม่ปิด panel',
    },
    {
      name: 'multiple',
      type: 'boolean',
      default: 'false',
      description: 'true = v-model เป็น array, false = v-model เป็นค่าเดี่ยว (string | number)',
    },
    {
      name: 'searchable',
      type: 'boolean',
      default: 'false',
      description: 'แสดงช่องค้นหาบนสุดของ panel กรอง options ตาม label เอง (local filter)',
    },
    {
      name: 'useInput',
      type: 'boolean',
      default: 'false',
      description:
        "แบบ Quasar's use-input — trigger กลายเป็น <input> พิมพ์ได้ตรงๆ แทนกล่อง search แยกใน panel (ปิด searchable box อัตโนมัติถ้าเปิดคู่กัน) ไม่ filter ให้เองเหมือน searchable — ต้องฟัง @filter แล้ว mutate options เองเสมอ ไม่งั้นพิมพ์แล้วลิสต์ไม่กรอง",
    },
    {
      name: 'inputDebounce',
      type: 'number',
      default: '500',
      description:
        "แบบ Quasar's input-debounce — หน่วง (ms) ก่อนยิง @filter จริงตอนพิมพ์ กันยิง API ทุกตัวอักษร ใส่ 0 = ยิงทันทีไม่หน่วง — ไม่มีผลตอน useInput=false, focus/clear ยิงทันทีเสมอไม่หน่วง",
    },
    {
      name: 'loadingText',
      type: 'string',
      default: "'กำลังค้นหา...'",
      description:
        'ข้อความตอน filteredOptions ว่างเปล่า "ระหว่าง" loading=true (เช่น รอ @filter แบบ async ตอบ) — แยกจาก noOptionsText ที่ใช้ตอนค้นจริงแล้วไม่เจอ (loading=false)',
    },
    {
      name: 'emitValue',
      type: 'boolean',
      default: 'true',
      description:
        "แบบ Quasar's emit-value — true (default) = v-model ได้ ISelectOption['value'] เดี่ยว/array, false = v-model ได้ ISelectOption เต็มๆ/array ของมัน",
    },
    {
      name: 'mapOptions',
      type: 'boolean',
      default: 'true',
      description:
        "แบบ Quasar's map-options — true (default) = resolve label จาก options มาโชว์ที่ trigger, false = โชว์ค่าดิบใน model.value ตรงๆ แทน label — มีผลเฉพาะตอน emitValue=true (ตอน emitValue=false model มี label ติดมากับ object อยู่แล้ว ไม่ต้อง resolve)",
    },
    {
      name: 'displayValue',
      type: 'string',
      default: "''",
      description:
        "แบบ Quasar's display-value — ทับข้อความที่ trigger โชว์ตรงๆ ไม่ว่า label ที่ resolve ได้จะเป็นอะไร ไม่กระทบ v-model/selection logic เลย เช่น multi-select ที่เลือกเยอะ อยากโชว์ 'เลือกไว้ N รายการ' แทนการต่อ label ยาวๆ — ปล่อยว่างไว้ (default) = โชว์ label ปกติ",
    },
    {
      name: 'optionHeight',
      type: 'number',
      default: '44',
      description: 'ความสูงแต่ละแถว (px) ใช้คำนวณ virtual-scroll — label ต้อง truncate ห้าม wrap',
    },
    {
      name: 'maxPanelHeight',
      type: 'number',
      default: '280',
      description: 'ความสูงสูงสุดของ panel (px) — ถูก clamp ลงอีกตามพื้นที่ viewport จริงตอนเปิด',
    },
    {
      name: 'noOptionsText',
      type: 'string',
      default: "'ไม่พบข้อมูล'",
      description: 'ข้อความตอนไม่มี options เหลือ (เช่น ค้นหาไม่เจอ)',
    },
    {
      name: 'searchPlaceholder',
      type: 'string',
      default: "'ค้นหา'",
      description: 'placeholder ของช่องค้นหา',
    },
    {
      name: 'customStyle',
      type: 'object',
      default: '{}',
      description: 'ปรับ rounded/สีเอง ผ่าน object เดียว (ดูตารางด้านล่าง)',
    },
  ]

  const customStyleTable: DocRow[] = [
    {
      name: 'rounded',
      type: "'none'|'sm'|'md'|'lg'|'full' | string",
      description: "ใส่ keyword ใช้ Tailwind class, ใส่ค่าอื่น (เช่น '4px') ใช้เป็น border-radius ตรงๆ",
    },
    { name: 'bgColor', type: 'string', description: 'สีพื้นหลัง control — ไม่มีผลตอน disabled' },
    { name: 'labelColor', type: 'string', description: 'สีตัวอักษร label' },
    { name: 'textColor', type: 'string', description: 'สีตัวอักษรใน control — ไม่มีผลตอน disabled' },
    { name: 'borderColor', type: 'string', description: 'สีขอบปกติ/hover — ไม่มีผลตอน disabled' },
    { name: 'focusColor', type: 'string', description: 'สีขอบตอน panel เปิดอยู่ — ไม่มีผลตอน disabled' },
    {
      name: 'optionHoverColor',
      type: 'string',
      description: 'สี background ตอน hover เมาส์/ไล่ด้วย arrow key บน option แถวหนึ่งใน panel',
    },
    {
      name: 'optionSelectedColor',
      type: 'string',
      description: 'สี background ของแถวที่ถูกเลือกอยู่ใน panel — ไม่ใส่ default main-1 tint จางๆ',
    },
    {
      name: 'optionSelectedTextColor',
      type: 'string',
      description: 'สีตัวอักษรของแถวที่ถูกเลือกอยู่ใน panel — ไม่ใส่ default เป็น main-1',
    },
  ]

  const slotsTable: DocRow[] = [
    {
      name: 'option',
      type: '{ option: ISelectOption; index: number; selected: boolean; highlighted: boolean }',
      description:
        'แทนที่เนื้อหาแต่ละแถวใน panel ทั้งหมด (default = checkbox ตอน multiple + label เฉยๆ ไม่มีไอคอน check) — ใช้เพิ่มไอคอนต่อ option, ปรับ layout เอง ฯลฯ ถ้าจะโชว์ checkbox/checkmark เองต้องเขียนเองในสล็อตด้วย option.raw คือ object ดิบก่อน normalize เผื่ออยาก field อื่นนอก label/value/disabled',
    },
    {
      name: 'selected',
      type: '{ selectedOptions: ISelectOption[]; displayText: string }',
      description:
        'แทนที่เนื้อหาที่ trigger โชว์ตอนไม่ได้อยู่โหมด useInput ทั้งหมด (default = text ธรรมดา) — selectedOptions คือ option object เต็มๆ ของทุกตัวที่เลือกอยู่ ใช้ทำ badge สี/icon ต่อรายการเองได้',
    },
    {
      name: 'prepend',
      type: '(ไม่มี scope)',
      description: 'เนื้อหาก่อนข้อความ/ช่องพิมพ์ใน trigger เช่น icon ค้นหานำหน้า',
    },
    {
      name: 'append',
      type: '(ไม่มี scope)',
      description: 'เนื้อหาหลังข้อความ/ช่องพิมพ์ใน trigger ก่อนปุ่ม clear/ไอคอน chevron',
    },
    {
      name: 'no-option',
      type: '(ไม่มี scope)',
      description:
        'แทนที่ข้อความ noOptionsText/loadingText ตอน filteredOptions ว่างเปล่า ใช้ใส่ icon/ปุ่มเสริม (เช่น "ล้างคำค้นหา") เองได้',
    },
  ]

  const eventsTable: DocRow[] = [
    {
      name: 'error',
      payload: '{ hasError: boolean; message: string }',
      type: '',
      description: 'ยิงทุกครั้งที่ validate() ทำงาน (ตอน panel ปิด หรือ rules เปลี่ยน)',
    },
    {
      name: 'blur',
      payload: 'FocusEvent | undefined',
      type: '',
      description:
        'ยิงตอน panel ปิด — มี FocusEvent จริงเฉพาะทาง native blur (เช่น กด Tab ออก) ทางอื่น (Escape/คลิกนอก/เลือกใน single mode) ส่ง undefined',
    },
    {
      name: 'filter',
      payload: '(value: string, update: (apply: () => void) => void, abort: () => void)',
      type: '',
      description:
        'แบบ Quasar — ยิงตอน useInput=true ทุกครั้งที่พิมพ์ (หน่วงตาม inputDebounce) รวมถึง value = \'\' แบบไม่หน่วงอีก 3 จังหวะ (ให้ consumer reset list กลับเป็นชุดเต็ม): panel เปิดจาก focus/คลิก chevron, กดปุ่ม clear, และเลือก option ใน multiple mode (input เคลียร์พร้อมกัน) ต้องเรียก update(() => { myOptions.value = ... }) เพื่อ mutate options ที่ผูกกับ :options เอง (sync หรือหลัง await fetch ก็ได้) ไม่เรียก update = list ไม่กรองเลย เรียก abort() แทนถ้าไม่อยากอัปเดต (เช่น response เก่ากว่าคำค้นล่าสุด)',
    },
    {
      name: 'popup-show / popup-hide',
      payload: '',
      type: '',
      description: 'ยิงตอน panel เปิด/ปิดจริง (ทุกทาง ไม่ใช่แค่คลิก trigger) ใช้ทำ analytics, lazy-load ข้อมูลรอบแรกตอนเปิด ฯลฯ',
    },
    {
      name: 'virtual-scroll',
      payload: "{ index: number; from: number; to: number; direction: 'increase' | 'decrease' }",
      type: '',
      description:
        'แบบ Quasar — ยิงทุกครั้งที่ window ของ virtual scroll เลื่อน ใช้ทำ infinite-scroll เช่น to ใกล้ options.length - 1 แล้วค่อยยิง API โหลดหน้าถัดไปเพิ่มเข้า options ที่ผูกไว้',
    },
  ]

  const exposedTable: DocRow[] = [
    { name: 'hasError', type: 'boolean', description: 'สถานะ error ปัจจุบัน' },
    { name: 'errorMessage', type: 'string', description: 'ข้อความ error ปัจจุบัน' },
    {
      name: 'validate',
      type: '() => void',
      description: 'สั่ง validate เองจากภายนอก (เช่น ตอนกด submit ฟอร์ม)',
    },
  ]

  interface ExampleRow {
    title: string
    code: string
    target: string
  }

  const examples: ExampleRow[] = [
    {
      title: 'slot: option — ครบ 4 scope prop (option / index / selected / highlighted)',
      target: 'demo-option-slot',
      code: `<Select
  v-model="province"
  label="จังหวัด"
  :options="provinceOptions"
  :option-height="56"
>
  <template #option="{ option, index, selected, highlighted }">
    <Svg src="common/info-circle" class="size-4 shrink-0" :class="option.disabled && 'opacity-40'" />
    <span class="min-w-0 flex-1">
      <span class="block truncate">{{ option.label }}</span>
      <span class="block truncate text-12 text-gray-500">ลำดับที่ {{ index + 1 }} · value: {{ option.value }}</span>
    </span>
    <span v-if="option.disabled" class="shrink-0 rounded bg-gray-200 px-1.5 py-0.5 text-12 text-gray-500">ปิดใช้งาน</span>
    <Svg v-if="highlighted && !option.disabled" src="common/arrow-right" class="size-3 shrink-0" />
    <Svg v-if="selected" src="common/check" class="size-4 shrink-0" color="#f61414" />
  </template>
</Select>
<!-- แถวสูงขึ้น (2 บรรทัด) ต้องปรับ optionHeight ให้ตรงความสูงจริงด้วย ไม่งั้น virtual-scroll เพี้ยน -->`,
    },
    {
      title: 'slot: option + multiple (ต้องวาด checkbox เองด้วย)',
      target: 'demo-option-slot-multiple',
      code: `<Select v-model="tags" multiple label="แท็ก" :options="tagOptions">
  <template #option="{ option, selected }">
    <span
      class="flex size-4 shrink-0 items-center justify-center rounded-full border-2"
      :class="selected ? 'border-main-1 bg-main-1' : 'border-gray-300'"
    >
      <span v-if="selected" class="size-1.5 rounded-full bg-white"></span>
    </span>
    <span class="flex-1 truncate">{{ option.label }}</span>
  </template>
</Select>
<!-- multiple ไม่มี checkbox สี่เหลี่ยม default ให้อัตโนมัติแล้วตอนใส่ slot — วาดเองตามต้องการ -->`,
    },
    {
      title: 'single-select พื้นฐาน',
      target: 'demo-basic',
      code: `<Select
  v-model="province"
  label="จังหวัด"
  placeholder="เลือกจังหวัด"
  :options="provinceOptions"
/>`,
    },
    {
      title: 'multiple',
      target: 'demo-multiple',
      code: `<Select
  v-model="tags"
  multiple
  label="แท็ก"
  placeholder="เลือกแท็ก"
  :options="tagOptions"
/>`,
    },
    {
      title: 'searchable',
      target: 'demo-searchable',
      code: `<Select
  v-model="province"
  searchable
  label="จังหวัด (ค้นหาได้)"
  :options="provinceOptions"
/>`,
    },
    {
      title: 'useInput + filter (กรองเอง แบบ sync ในเครื่อง)',
      target: 'demo-use-input',
      code: `<Select
  v-model="province"
  use-input
  clearable
  label="จังหวัด (พิมพ์กรองเอง)"
  :options="filteredProvinces"
  @filter="onFilter"
/>

const filteredProvinces = ref(provinceOptions)
function onFilter(value, update) {
  update(() => {
    const needle = value.toLowerCase()
    filteredProvinces.value = provinceOptions.filter(o => o.label.toLowerCase().includes(needle))
  })
}`,
    },
    {
      title: 'useInput + filter (autocomplete จาก API จริง)',
      target: 'demo-use-input-remote',
      code: `<Select
  v-model="selectedUserAsync"
  use-input
  :loading="filterLoading"
  label="ผู้ใช้ (พิมพ์ค้นหาจาก API จริง)"
  :options="userOptionsAsync"
  @filter="onFilterRemote"
/>

const userOptionsAsync = ref([])
const filterLoading = ref(false)
let filterToken = 0

async function onFilterRemote(value, update, abort) {
  const token = ++filterToken
  filterLoading.value = true
  try {
    const users = await apiRaw({ method: 'GET', url: 'https://jsonplaceholder.typicode.com/users' })
    if (token !== filterToken) return abort() // มีคำค้นใหม่กว่าเข้ามาแล้วระหว่างรอ ทิ้งผลลัพธ์เก่า
    const needle = value.toLowerCase()
    update(() => {
      userOptionsAsync.value = users
        .filter(u => u.name.toLowerCase().includes(needle))
        .map(u => ({ label: u.name, value: u.id }))
    })
  } finally {
    if (token === filterToken) filterLoading.value = false
  }
}
// ไม่ต้อง debounce เอง — inputDebounce default 500ms หน่วงให้แล้วก่อนยิง @filter จริง`,
    },
    {
      title: 'useInput + multiple + filter',
      target: 'demo-use-input-multiple',
      code: `<Select
  v-model="tags"
  use-input
  multiple
  label="แท็ก"
  :options="filteredTagOptions"
  @filter="onFilterTags"
/>

const filteredTagOptions = ref(tagOptions)
function onFilterTags(value, update) {
  update(() => {
    const needle = value.toLowerCase()
    filteredTagOptions.value = tagOptions.filter(o => o.label.toLowerCase().includes(needle))
  })
}
// เลือกแล้วช่องพิมพ์เคลียร์เป็นว่างทันที (ไม่โชว์รายการที่เลือกไว้ในตัว input — ไม่ทำ chips)`,
    },
    {
      title: 'emitValue: true (default — v-model ได้ value ดิบ)',
      target: 'demo-emit-value-true',
      code: `<Select
  v-model="province"
  emit-value
  label="จังหวัด (ได้ value ดิบ)"
  :options="provinceOptions"
/>
<!-- province === 'chiang-mai' -->`,
    },
    {
      title: 'emitValue: false (v-model ได้ option object เต็มๆ)',
      target: 'demo-emit-value-false',
      code: `<Select
  v-model="provinceObject"
  :emit-value="false"
  label="จังหวัด (ได้ object เต็มๆ)"
  :options="provinceOptions"
/>
<!-- provinceObject.value === { label: 'เชียงใหม่', value: 'chiang-mai' } -->`,
    },
    {
      title: 'mapOptions: false (trigger โชว์ค่าดิบ ไม่ resolve label)',
      target: 'demo-map-options',
      code: `<Select
  v-model="provinceRaw"
  :map-options="false"
  label="จังหวัด (โชว์ value ดิบ)"
  :options="provinceOptions"
/>
<!-- เลือก "เชียงใหม่" แล้ว trigger จะโชว์ "chiang-mai" ไม่ใช่ "เชียงใหม่" -->`,
    },
    {
      title: 'displayValue (ทับข้อความที่ trigger โชว์)',
      target: 'demo-display-value',
      code: `<Select
  v-model="tags"
  multiple
  label="แท็ก"
  :options="tagOptions"
  :display-value="tags.length > 2 ? \`เลือกไว้ \${tags.length} รายการ\` : ''"
/>
<!-- เลือก > 2 รายการ trigger จะโชว์ "เลือกไว้ N รายการ" แทนการต่อ label ยาวๆ -->`,
    },
    {
      title: 'ลิสต์ยาว (virtual scroll)',
      target: 'demo-virtual-scroll',
      code: `<Select
  v-model="longValue"
  searchable
  label="ตัวเลือก 1,000 รายการ"
  :options="longOptions"
  @popup-show="() => console.log('เปิด panel')"
  @popup-hide="() => console.log('ปิด panel')"
  @virtual-scroll="({ index, from, to, direction }) => console.log(direction, from, to)"
/>`,
    },
    {
      title: 'optionHeight / maxPanelHeight',
      target: 'demo-option-height',
      code: `<Select
  v-model="monthValue"
  label="เดือน"
  :options="monthOptions"
  :option-height="60"
  :max-panel-height="180"
/>
<!-- default: optionHeight 44px / maxPanelHeight 280px — สองค่านี้ต้องปรับคู่กันเสมอเวลาทำแถว custom สูงไม่เท่า default -->`,
    },
    {
      title: 'optionValue/optionLabel (options shape อื่น)',
      target: 'demo-custom-option-keys',
      code: `<Select
  v-model="cityValue"
  option-value="id"
  option-label="name"
  label="เมือง"
  :options="cityOptionsRaw"
/>
<!-- cityOptionsRaw: { id: number, name: string }[] — ไม่ต้อง map เป็น { value, label } เอง -->`,
    },
    {
      title: 'slot: selected (custom เนื้อหาที่ trigger โชว์)',
      target: 'demo-selected-slot',
      code: `<Select v-model="province" label="จังหวัด" :options="provinceOptions">
  <template #selected="{ selectedOptions, displayText }">
    <span v-if="selectedOptions.length" class="flex-1 truncate">
      <span class="rounded bg-main-1/10 px-1.5 py-0.5 text-main-1">{{ selectedOptions[0].value }}</span>
      {{ selectedOptions[0].label }}
    </span>
    <span v-else class="flex-1 truncate text-gray-500">{{ displayText || 'เลือกจังหวัด' }}</span>
  </template>
</Select>`,
    },
    {
      title: 'slot: prepend / append',
      target: 'demo-prepend-append',
      code: `<Select v-model="province" searchable label="จังหวัด" :options="provinceOptions">
  <template #prepend>
    <Svg src="common/info-circle" class="mr-2 size-4 shrink-0" />
  </template>
  <template #append>
    <span class="mr-2 rounded bg-gray-100 px-1.5 py-0.5 text-12">TH</span>
  </template>
</Select>`,
    },
    {
      title: 'dropdownIcon / clearIcon',
      target: 'demo-custom-icons',
      code: `<Select
  v-model="province"
  clearable
  dropdown-icon="common/arrow-right"
  clear-icon="common/eye-off"
  label="จังหวัด"
  :options="provinceOptions"
/>`,
    },
    {
      title: 'slot: no-option',
      target: 'demo-no-option-slot',
      code: `<Select v-model="province" searchable label="จังหวัด" :options="provinceOptions">
  <template #no-option>
    <div class="flex flex-col items-center gap-1 py-1">
      <Svg src="common/info-circle" class="size-5 text-gray-400" />
      <span>ไม่พบจังหวัดที่ค้นหา ลองคำอื่นดูนะ</span>
    </div>
  </template>
</Select>`,
    },
    {
      title: 'clearable',
      target: 'demo-clearable',
      code: `<Select
  v-model="province"
  clearable
  label="จังหวัด"
  :options="provinceOptions"
/>`,
    },
    {
      title: 'disabled / readonly',
      target: 'demo-disabled-readonly',
      code: `<Select disabled label="disabled" :options="provinceOptions" model-value="" />
<Select readonly label="readonly" :options="provinceOptions" v-model="province" />`,
    },
    {
      title: 'loading (โหลด options จาก API จริง)',
      target: 'demo-loading',
      code: `<Select
  v-model="selectedUser"
  :loading="loadingUsers"
  :options="userOptions"
  label="ผู้ใช้ (จาก API จริง)"
  :placeholder="loadingUsers ? 'กำลังโหลด...' : 'เลือกผู้ใช้'"
/>`,
    },
    {
      title: 'required + rules',
      target: 'demo-required-rules',
      code: `<Select
  ref="requiredSelectRef"
  v-model="requiredValue"
  required
  label="จังหวัด"
  :options="provinceOptions"
/>`,
    },
    {
      title: 'customStyle (รวมสี hover/highlight/selected ใน panel)',
      target: 'demo-custom-style',
      code: `<Select
  v-model="province"
  label="จังหวัด"
  :options="provinceOptions"
  :custom-style="{
    rounded: 'full',
    borderColor: '#0d6efd',
    focusColor: '#0d6efd',
    optionHoverColor: '#e0edff',
    optionSelectedColor: '#0d6efd',
    optionSelectedTextColor: '#ffffff',
  }"
/>`,
    },
    {
      title: 'options เปลี่ยนหลังมีค่าเลือกไว้แล้ว',
      target: 'demo-options-change',
      code: `<Select v-model="dynamicValue" label="ชุดข้อมูล" :options="dynamicOptions" />
<Button label="สลับชุด options" @click="swapDynamicOptions" />`,
    },
  ]

  const scrollToDemo = (targetId: string): void => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
</script>
