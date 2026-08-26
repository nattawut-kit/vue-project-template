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
        <table class="w-full min-w-[560px] border-collapse text-left text-16">
          <thead>
            <tr class="border-b border-gray-300">
              <th class="py-1 pr-2 font-bold">slot</th>
              <th class="py-1 pr-2 font-bold">scope</th>
              <th class="py-1 font-bold">คำอธิบาย</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in slotsTable"
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
      type: 'ISelectOption[]',
      default: '(required)',
      description: "รายการตัวเลือก { label, value, disabled? } — เปลี่ยน options ระหว่างมีค่าเลือกอยู่ได้ปลอดภัย ค่าที่หาไม่เจอจะแสดงว่างแทนที่จะพัง",
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
      description: 'แสดงช่องค้นหาบนสุดของ panel กรอง options ตาม label',
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
        'แทนที่เนื้อหาแต่ละแถวใน panel ทั้งหมด (default = checkbox ตอน multiple + label เฉยๆ ไม่มีไอคอน check) — ใช้เพิ่มไอคอนต่อ option, ปรับ layout เอง ฯลฯ ถ้าจะโชว์ checkbox/checkmark เองต้องเขียนเองในสล็อตด้วย',
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
      title: 'ลิสต์ยาว (virtual scroll)',
      target: 'demo-virtual-scroll',
      code: `<Select
  v-model="longValue"
  searchable
  label="ตัวเลือก 1,000 รายการ"
  :options="longOptions"
/>`,
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
