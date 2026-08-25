<template>
  <div class="container">
    <div>input แบบ title</div>

    <div class="mt-4 rounded-lg border border-gray-300 bg-white p-3 text-16">
      <div class="mb-1 font-bold">วิธีใช้</div>
      <ul class="list-disc space-y-1 pl-4 leading-relaxed">
        <li>
          ใส่ <code class="rounded bg-gray-100 px-1">label</code> เฉยๆ (ไม่ต้องใส่ prop อื่นเพิ่ม)
          label จะอยู่นิ่งด้านบนเสมอเป็น default อยู่แล้ว (ไม่ลอย) — ดูวิธีใช้แบบลอยได้ที่หน้า
          "input แบบ label"
        </li>
        <li>
          field ที่ไม่มี label แต่ต้องเรียงตรงกับ field อื่นที่มี label ในกลุ่มเดียวกัน
          (เช่นตัวอย่างที่สองในหัวข้อ "title / placeholder" ด้านล่าง) ไม่ต้องใส่อะไรเพิ่มเช่นกัน
          เพราะ default กันพื้นที่ไว้ให้อยู่แล้ว
        </li>
      </ul>
    </div>

    <TextFieldDocs class="mb-4" />

    <hr />

    <div class="mt-6 flex flex-col gap-6">
      <div id="demo-basic">
        <div class="mb-2 text-18 font-bold">title / placeholder</div>
        <div class="flex flex-col gap-3">
          <TextField
            v-model="titleValue"
            label="ชื่อ-นามสกุล"
            placeholder="กรอกชื่อ-นามสกุล"
          />
          <div class="flex gap-2">
            <TextField
              v-model="titleRequiredValue"
              label="อีเมล"
              placeholder="กรอกอีเมล"
              required
            />

            <TextField
              v-model="titleRequiredValue"
              placeholder="กรอกอีเมล"
            />
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-type">
        <div class="mb-2 text-18 font-bold">type</div>
        <div class="flex flex-col gap-3">
          <TextField
            v-model="titleTypeEmail"
            type="email"
            label="อีเมล"
            placeholder="กรอกอีเมล"
          />
          <TextField
            v-model="titleTypeTel"
            type="tel"
            label="เบอร์โทร"
            placeholder="กรอกเบอร์โทร"
          />
          <TextField
            v-model="titleTypeNumber"
            type="number"
            label="ตัวเลข"
            placeholder="กรอกตัวเลข"
          />
          <TextField
            v-model="titleTypePassword"
            :type="titlePasswordVisible ? 'text' : 'password'"
            label="รหัสผ่าน"
            placeholder="กรอกรหัสผ่าน"
          >
            <template #end-icon>
              <button
                type="button"
                class="flex"
                @click="titlePasswordVisible = !titlePasswordVisible"
              >
                <Svg
                  :src="titlePasswordVisible ? 'common/eye-off' : 'common/eye'"
                  class="size-5"
                  color="black"
                />
              </button>
            </template>
          </TextField>
          <TextField
            v-model="titleTypeCurrency"
            type="currency"
            label="จำนวนเงิน"
            placeholder="กรอกจำนวนเงิน"
          />
        </div>
      </div>

      <hr />

      <div id="demo-rules">
        <div class="mb-2 text-18 font-bold">required + rules (blur เพื่อ validate)</div>
        <TextField
          v-model="titleRuleValue"
          label="อีเมล"
          placeholder="กรอกอีเมล"
          required
          :rules="emailRules"
        />
      </div>

      <hr />

      <div id="demo-helper-text">
        <div class="mb-2 text-18 font-bold">helperText</div>
        <TextField
          v-model="titleHelperValue"
          label="ชื่อผู้ใช้"
          placeholder="กรอกชื่อผู้ใช้"
          helper-text="ใช้ตัวอักษรและตัวเลขเท่านั้น"
        />
      </div>

      <hr />

      <div id="demo-max-length">
        <div class="mb-2 text-18 font-bold">maxLength</div>
        <TextField
          v-model="titleMaxLengthValue"
          label="โค้ด (สูงสุด 6 ตัว)"
          placeholder="กรอกโค้ด"
          :max-length="6"
        />
      </div>

      <hr />

      <div id="demo-format-func">
        <div class="mb-2 text-18 font-bold">formatFunc (ตัวพิมพ์ใหญ่ทั้งหมด)</div>
        <TextField
          v-model="titleFormatValue"
          label="รหัสคูปอง"
          placeholder="กรอกรหัสคูปอง"
          :format-func="(value: string) => value.toUpperCase()"
        />
      </div>

      <hr />

      <div id="demo-disabled-readonly">
        <div class="mb-2 text-18 font-bold">disabled / readonly</div>
        <div class="flex flex-col gap-3">
          <TextField
            v-model="titleDisabledValue"
            label="disabled"
            placeholder="กรอกข้อมูล"
            disabled
          />
          <TextField
            v-model="titleReadonlyValue"
            label="readonly"
            placeholder="กรอกข้อมูล"
            readonly
          />
        </div>
      </div>

      <hr />

      <div id="demo-clearable">
        <div class="mb-2 text-18 font-bold">clearable</div>
        <TextField
          v-model="titleClearableValue"
          label="ค้นหา"
          placeholder="ค้นหา..."
          clearable
        />
      </div>

      <hr />

      <div id="demo-prefix-suffix">
        <div class="mb-2 text-18 font-bold">prefix / suffix</div>
        <div class="flex flex-col gap-3">
          <TextField
            v-model="titlePrefixValue"
            type="number"
            label="ราคา"
            placeholder="0.00"
            prefix="฿"
          />
          <TextField
            v-model="titleSuffixValue"
            type="number"
            label="น้ำหนัก"
            placeholder="0"
            suffix="กก."
          />
          <!-- ใส่ prefix พร้อม start-icon slot พร้อมกันได้เลย component จะเรียง icon ไว้ริมขอบแล้วต่อด้วยข้อความ prefix ให้เอง -->
          <TextField
            v-model="titlePrefixIconTextValue"
            label="อีเมล"
            placeholder="กรอกอีเมล"
            prefix="mail"
          >
            <template #start-icon>
              <Svg
                src="navbar/user"
                class="size-4"
              />
            </template>
          </TextField>
        </div>
      </div>

      <hr />

      <div id="demo-mask">
        <div class="mb-2 text-18 font-bold">mask</div>
        <div class="flex flex-col gap-3">
          <TextField
            v-model="titleMaskPhoneValue"
            label="เบอร์โทร (mask)"
            placeholder="081-234-5678"
            mask="###-###-####"
          />
          <TextField
            v-model="titleMaskDateValue"
            label="วันเกิด (fillMask)"
            mask="##/##/####"
            fill-mask
          />
          <TextField
            v-model="titleMaskMoneyValue"
            label="จำนวนเงิน (reverseFillMask)"
            mask="#,###,###.##"
            fill-mask
            reverse-fill-mask
          />
          <div>
            <TextField
              v-model="titleMaskCouponValue"
              label="รหัสคูปอง (unmaskedValue)"
              mask="AAA-####"
              unmasked-value
            />
            <div class="mt-1 text-12 text-gray-500">
              v-model (ไม่มีตัวคั่น): {{ titleMaskCouponValue }}
            </div>
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-custom-style">
        <div class="mb-2 text-18 font-bold">customStyle</div>
        <div class="flex flex-col gap-3">
          <TextField
            v-model="titleCustomRoundedValue"
            label="rounded: 'full'"
            placeholder="กรอกข้อมูล"
            :custom-style="{ rounded: 'full' }"
          />
          <TextField
            v-model="titleCustomRoundedCornersValue"
            label="rounded: { tl: 'lg', br: 'lg' } (คุมทีละมุม)"
            placeholder="กรอกข้อมูล"
            :custom-style="{ rounded: { tl: 'lg', br: 'lg' } }"
          />
          <TextField
            v-model="titleCustomRoundedRawValue"
            label="rounded: '12px' (ค่าดิบ ไม่ใช่ preset)"
            placeholder="กรอกข้อมูล"
            :custom-style="{ rounded: '12px' }"
          />
          <TextField
            v-model="titleCustomColorValue"
            label="bgColor / labelColor / textColor"
            placeholder="กรอกข้อมูล"
            :custom-style="{
              bgColor: '#fef3c7',
              labelColor: '#b45309',
              textColor: '#78350f',
            }"
          />
          <TextField
            v-model="titleCustomOutlinedValue"
            label="outlined"
            placeholder="กรอกข้อมูล"
            outlined
          />
          <TextField
            v-model="titleCustomBorderlessValue"
            label="borderless"
            placeholder="กรอกข้อมูล"
            borderless
          />
          <TextField
            v-model="titleCustomBorderFocusValue"
            label="borderColor / focusColor"
            placeholder="กรอกข้อมูล"
            :custom-style="{ borderColor: '#78350f', focusColor: '#7c3aed' }"
          />
          <TextField
            v-model="titleCustomDisabledValue"
            label="disabled (customStyle ไม่มีผล)"
            placeholder="กรอกข้อมูล"
            disabled
            :custom-style="{ bgColor: '#fef3c7', borderColor: '#a855f7' }"
          />
        </div>
      </div>

      <hr />

      <div id="demo-icon-slot">
        <div class="mb-2 text-18 font-bold">start-icon / end-icon slot</div>
        <TextField
          v-model="titleIconValue"
          label="ค้นหา"
          placeholder="ค้นหา..."
        >
          <template #start-icon>
            <Svg
              src="navbar/user"
              class="size-4"
            />
          </template>
          <template #end-icon>
            <Svg
              src="common/arrow-right"
              class="size-4"
              color="black"
            />
          </template>
        </TextField>
      </div>

      <hr />

      <div>
        <div class="mb-2 text-18 font-bold">
          end-icon-error เฉยๆ ไม่มี end-icon ปกติ (required, blur เพื่อ validate)
        </div>
        <TextField
          v-model="titleIconErrorOnlyValue"
          label="อีเมล"
          placeholder="กรอกอีเมล"
          :rules="emailRules"
          required
        >
          <template #end-icon-error>
            <Svg
              src="common/info-circle"
              class="size-4"
            />
          </template>
        </TextField>
      </div>

      <div>
        <div class="mb-2 text-18 font-bold">
          มี end-icon ปกติ แล้วสลับเป็น end-icon-error (required, blur เพื่อ validate)
        </div>
        <TextField
          v-model="titleIconErrorValue"
          label="อีเมล"
          placeholder="กรอกอีเมล"
          required
        >
          <template #start-icon>
            <Svg
              src="navbar/user"
              class="size-4"
            />
          </template>
          <!-- <template #start-icon-error>
            <Svg
              src="common/x-close"
              class="size-4"
            />
          </template> -->
          <template #end-icon>
            <Svg
              src="common/info-circle"
              class="size-4"
              color="black"
            />
          </template>
          <template #end-icon-error>
            <Svg
              src="common/x-close"
              class="size-4"
            />
          </template>
        </TextField>
      </div>

      <hr />

      <div id="demo-form">
        <div class="mb-2 text-18 font-bold">form (validate ทุก field ตอนกด submit)</div>
        <form
          class="flex flex-col gap-3"
          @submit.prevent="handleFormSubmit"
        >
          <TextField
            ref="formFirstNameRef"
            v-model="formFirstName"
            label="ชื่อ"
            placeholder="กรอกชื่อ"
            required
          />
          <TextField
            ref="formLastNameRef"
            v-model="formLastName"
            label="นามสกุล"
            placeholder="กรอกนามสกุล"
            required
          />
          <TextField
            ref="formAddressRef"
            v-model="formAddress"
            label="ที่อยู่"
            placeholder="กรอกที่อยู่"
            required
          />
          <Button
            label="ส่งข้อมูล"
            type="submit"
          />
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import TextFieldDocs from './_components/TextFieldDocs.vue'

  const titleValue = ref('')
  const titleRequiredValue = ref('')
  const titleTypeEmail = ref('')
  const titleTypeTel = ref('')
  const titleTypeNumber = ref('')
  const titleTypePassword = ref('')
  const titlePasswordVisible = ref(false)
  const titleTypeCurrency = ref('')
  const titleRuleValue = ref('')
  const titleHelperValue = ref('')
  const titleMaxLengthValue = ref('')
  const titleFormatValue = ref('')
  const titleDisabledValue = ref('กรอกไว้แล้ว')
  const titleReadonlyValue = ref('แก้ไขไม่ได้')
  const titleIconValue = ref('')
  const titleClearableValue = ref('ลบข้อความนี้ได้')
  const titlePrefixValue = ref('')
  const titleSuffixValue = ref('')
  const titlePrefixIconTextValue = ref('')
  const titleMaskPhoneValue = ref('')
  const titleMaskDateValue = ref('')
  const titleMaskMoneyValue = ref('')
  const titleMaskCouponValue = ref('')
  const titleCustomRoundedValue = ref('')
  const titleCustomRoundedCornersValue = ref('')
  const titleCustomRoundedRawValue = ref('')
  const titleCustomColorValue = ref('')
  const titleCustomOutlinedValue = ref('')
  const titleCustomBorderlessValue = ref('')
  const titleCustomBorderFocusValue = ref('')
  const titleCustomDisabledValue = ref('กรอกไว้แล้ว')
  const titleIconErrorOnlyValue = ref('')
  const titleIconErrorValue = ref('')

  const emailRules: IValidationRule[] = [
    {
      // ค่าว่างให้ผ่านไปก่อน เพื่อให้ required (เช็คหลัง rules ใน TextField) เป็นคนขึ้น error "กรุณากรอก..." ก่อน แล้วค่อยเช็ครูปแบบเมื่อมีการพิมพ์
      validator: value => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: 'รูปแบบอีเมลไม่ถูกต้อง',
    },
  ]

  const formFirstName = ref('')
  const formLastName = ref('')
  const formAddress = ref('')

  // ใช้ shape ของ instance ที่ TextField defineExpose ออกมา แทนการ import type ของ component (auto-registered ผ่าน unplugin-vue-components เลยไม่มี identifier ให้ import ใน script)
  interface TextFieldExposed {
    hasError: boolean
    errorMessage: string
    validate: () => void
  }

  const formFirstNameRef = ref<TextFieldExposed | null>(null)
  const formLastNameRef = ref<TextFieldExposed | null>(null)
  const formAddressRef = ref<TextFieldExposed | null>(null)

  const handleFormSubmit = (): void => {
    const fields = [formFirstNameRef.value, formLastNameRef.value, formAddressRef.value]
    fields.forEach(field => field?.validate())

    if (fields.some(field => field?.hasError)) return

    showDialog(
      'success',
      'ส่งข้อมูลสำเร็จ',
      `ชื่อ: ${formFirstName.value}<br>นามสกุล: ${formLastName.value}<br>ที่อยู่: ${formAddress.value}`,
      [{ action: 'submit', text: 'ปิด' }]
    )
  }
</script>

<style scoped lang="scss">
  .container {
    padding: 12px;
  }
</style>

<route lang="yaml">
meta:
  layout: default
  navtop:
    back_to: '/example/text-field-demo'
    title: 'input แบบ title'
  main:
    image: true
  navbottom:
    active: false
    current: 'example'
</route>
