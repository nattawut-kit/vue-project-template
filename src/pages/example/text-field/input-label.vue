<template>
  <div class="container">
    <div>input แบบ label</div>

    <div class="mt-4 rounded-lg border border-gray-300 bg-white p-3 text-16">
      <div class="mb-1 font-bold">วิธีใช้</div>
      <ul class="list-disc space-y-1 pl-4 leading-relaxed">
        <li>
          ใส่ <code class="rounded bg-gray-100 px-1">label</code> คู่กับ
          <code class="rounded bg-gray-100 px-1">float-label</code> เพื่อให้ label ลอย — ซ้อนเป็น
          placeholder ตอนว่าง แล้วลอยขึ้นเป็นตัวอักษรเล็กตอน focus/มีค่า — ดูวิธีใช้แบบนิ่งด้านบน
          (default) ได้ที่หน้า "input แบบ title"
        </li>
        <li>
          field ที่ไม่มี label แต่ไม่ต้องการบล็อกนิ่งด้านบนเลย (เช่น "ไม่มี label" ด้านล่าง) ใส่
          <code class="rounded bg-gray-100 px-1">float-label</code> เปล่าๆ ไว้ได้เลย ไม่ต้องมีค่า
          label ก็ได้ — จะได้ไม่กินพื้นที่เพิ่ม
        </li>
      </ul>
    </div>

    <TextFieldDocs />

    <div class="mt-6 flex flex-col gap-6">
      <div id="demo-basic">
        <div class="mb-2 text-16 font-bold">label / placeholder</div>
        <div class="flex flex-col gap-3">
          <TextField
            v-model="basic"
            required
            label="ชื่อ-นามสกุล"
            float-label
          />
          <TextField
            v-model="noLabel"
            placeholder="ไม่มี label"
            float-label
          />
        </div>
      </div>

      <hr />

      <div id="demo-type">
        <div class="mb-2 text-16 font-bold">type</div>
        <div class="flex flex-col gap-3">
          <TextField
            v-model="typeEmail"
            type="email"
            label="อีเมล"
            float-label
          />
          <TextField
            v-model="typeTel"
            type="tel"
            label="เบอร์โทร"
            float-label
          />
          <TextField
            v-model="typeNumber"
            type="number"
            label="ตัวเลข"
            float-label
          />
          <TextField
            v-model="typePassword"
            :type="passwordVisible ? 'text' : 'password'"
            label="รหัสผ่าน"
            float-label
          >
            <template #end-icon>
              <button
                type="button"
                class="flex"
                @click="passwordVisible = !passwordVisible"
              >
                <Svg
                  :src="passwordVisible ? 'common/eye-off' : 'common/eye'"
                  class="size-4"
                  color="#808285"
                />
              </button>
            </template>
          </TextField>
          <TextField
            v-model="typeCurrency"
            type="currency"
            label="จำนวนเงิน"
            float-label
          />
        </div>
      </div>

      <hr />

      <div id="demo-rules">
        <div class="mb-2 text-16 font-bold">required + rules (blur เพื่อ validate)</div>
        <TextField
          v-model="ruleValue"
          label="อีเมล"
          float-label
          required
          :rules="emailRules"
        />
      </div>

      <hr />

      <div id="demo-helper-text">
        <div class="mb-2 text-16 font-bold">helperText</div>
        <TextField
          v-model="helperValue"
          label="ชื่อผู้ใช้"
          float-label
          helper-text="ใช้ตัวอักษรและตัวเลขเท่านั้น"
        />
      </div>

      <hr />

      <div id="demo-max-length">
        <div class="mb-2 text-16 font-bold">maxLength</div>
        <TextField
          v-model="maxLengthValue"
          label="โค้ด (สูงสุด 6 ตัว)"
          float-label
          :max-length="6"
        />
      </div>

      <hr />

      <div id="demo-format-func">
        <div class="mb-2 text-16 font-bold">formatFunc (ตัวพิมพ์ใหญ่ทั้งหมด)</div>
        <TextField
          v-model="formatValue"
          label="รหัสคูปอง"
          float-label
          :format-func="(value: string) => value.toUpperCase()"
        />
      </div>

      <hr />

      <div id="demo-disabled-readonly">
        <div class="mb-2 text-16 font-bold">disabled / readonly</div>
        <div class="flex flex-col gap-3">
          <TextField
            v-model="disabledValue"
            label="disabled"
            float-label
            disabled
          />
          <TextField
            v-model="readonlyValue"
            label="readonly"
            float-label
            readonly
          />
        </div>
      </div>

      <hr />

      <div id="demo-clearable">
        <div class="mb-2 text-16 font-bold">clearable</div>
        <TextField
          v-model="clearableValue"
          label="ค้นหา"
          float-label
          clearable
        />
      </div>

      <hr />

      <div id="demo-prefix-suffix">
        <div class="mb-2 text-16 font-bold">prefix / suffix</div>
        <div class="flex flex-col gap-3">
          <TextField
            v-model="prefixValue"
            type="number"
            label="ราคา"
            float-label
            prefix="฿"
          />
          <TextField
            v-model="suffixValue"
            type="number"
            label="น้ำหนัก"
            float-label
            suffix="กก."
          />
          <!-- ใส่ prefix พร้อม start-icon slot พร้อมกันได้เลย component จะเรียง icon ไว้ริมขอบแล้วต่อด้วยข้อความ prefix ให้เอง -->
          <TextField
            v-model="prefixIconTextValue"
            label="อีเมล"
            float-label
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
        <div class="mb-2 text-16 font-bold">mask</div>
        <div class="flex flex-col gap-3">
          <TextField
            v-model="maskPhoneValue"
            label="เบอร์โทร (mask)"
            float-label
            mask="0##-###-####"
          />
          <div class="mt-1 text-12 text-gray-500">v-model (ไม่มีตัวคั่น): {{ maskPhoneValue }}</div>

          <TextField
            v-model="maskDateValue"
            label="วันเกิด (fillMask)"
            float-label
            mask="##/##/####"
          />
          <TextField
            v-model="maskMoneyValue"
            label="จำนวนเงิน (reverseFillMask)"
            float-label
            mask="#,###,###.##"
            reverse-fill-mask
          />
          <div>
            <TextField
              v-model="maskCouponValue"
              label="รหัสคูปอง (unmaskedValue)"
              float-label
              mask="AAA-####"
              unmasked-value
            />
            <div class="mt-1 text-12 text-gray-500">
              v-model (ไม่มีตัวคั่น): {{ maskCouponValue }}
            </div>
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-custom-style">
        <div class="mb-2 text-16 font-bold">customStyle</div>
        <div class="flex flex-col gap-3">
          <TextField
            v-model="customRoundedValue"
            label="rounded: 'full'"
            float-label
            :custom-style="{ rounded: 'full' }"
          />
          <TextField
            v-model="customRoundedCornersValue"
            label="rounded: { tl: 'lg', br: 'lg' } (คุมทีละมุม)"
            float-label
            :custom-style="{ rounded: { tl: 'lg', br: 'lg' } }"
          />
          <TextField
            v-model="customRoundedRawValue"
            label="rounded: '12px' (ค่าดิบ ไม่ใช่ preset)"
            float-label
            :custom-style="{ rounded: '12px' }"
          />
          <TextField
            v-model="customColorValue"
            label="bgColor / labelColor / textColor"
            float-label
            :custom-style="{
              bgColor: '#fef3c7',
              labelColor: '#b45309',
              textColor: '#78350f',
            }"
          />
          <TextField
            v-model="customOutlinedValue"
            label="outlined"
            float-label
            outlined
          />
          <TextField
            v-model="customBorderlessValue"
            label="borderless"
            float-label
            borderless
          />
          <TextField
            v-model="customBorderFocusValue"
            label="borderColor / focusColor"
            float-label
            :custom-style="{ borderColor: '#a855f7', focusColor: '#7c3aed' }"
          />
          <TextField
            v-model="customDisabledValue"
            label="disabled (customStyle ไม่มีผล)"
            float-label
            disabled
            :custom-style="{ bgColor: '#fef3c7', borderColor: '#a855f7' }"
          />
        </div>
      </div>

      <hr />

      <div id="demo-icon-slot">
        <div class="mb-2 text-16 font-bold">start-icon / end-icon slot</div>
        <TextField
          v-model="iconValue"
          label="ค้นหา"
          float-label
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
            />
          </template>
        </TextField>
      </div>

      <hr />

      <div>
        <div class="mb-2 text-16 font-bold">
          end-icon-error เฉยๆ ไม่มี end-icon ปกติ (required, blur เพื่อ validate)
        </div>
        <TextField
          v-model="iconErrorOnlyValue"
          label="อีเมล"
          float-label
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
        <div class="mb-2 text-16 font-bold">
          มี end-icon ปกติ แล้วสลับเป็น end-icon-error (required, blur เพื่อ validate)
        </div>
        <TextField
          v-model="iconErrorValue"
          label="อีเมล"
          float-label
          required
        >
          <template #start-icon>
            <Svg
              src="navbar/user"
              class="size-4"
            />
          </template>
          <template #start-icon-error>
            <Svg
              src="common/x-close"
              class="size-4"
            />
          </template>
          <template #end-icon>
            <Svg
              src="common/info-circle"
              class="size-4"
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
        <div class="mb-2 text-16 font-bold">form (validate ทุก field ตอนกด submit)</div>
        <form
          class="flex flex-col gap-3"
          @submit.prevent="handleFormSubmit"
        >
          <TextField
            ref="formFirstNameRef"
            v-model="formFirstName"
            label="ชื่อ"
            float-label
            required
          />
          <TextField
            ref="formLastNameRef"
            v-model="formLastName"
            label="นามสกุล"
            float-label
            required
          />
          <TextField
            ref="formAddressRef"
            v-model="formAddress"
            label="ที่อยู่"
            float-label
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

  const basic = ref('')
  const noLabel = ref('')
  const typeEmail = ref('')
  const typeTel = ref('')
  const typeNumber = ref('')
  const typePassword = ref('')
  const passwordVisible = ref(false)
  const typeCurrency = ref('')
  const ruleValue = ref('')
  const helperValue = ref('')
  const maxLengthValue = ref('')
  const formatValue = ref('')
  const disabledValue = ref('กรอกไว้แล้ว')
  const readonlyValue = ref('แก้ไขไม่ได้')
  const iconValue = ref('')
  const clearableValue = ref('ลบข้อความนี้ได้')
  const prefixValue = ref('')
  const suffixValue = ref('')
  const prefixIconTextValue = ref('')
  const maskPhoneValue = ref('')
  const maskDateValue = ref('')
  const maskMoneyValue = ref('')
  const maskCouponValue = ref('')
  const customRoundedValue = ref('')
  const customRoundedCornersValue = ref('')
  const customRoundedRawValue = ref('')
  const customColorValue = ref('')
  const customOutlinedValue = ref('')
  const customBorderlessValue = ref('')
  const customBorderFocusValue = ref('')
  const customDisabledValue = ref('กรอกไว้แล้ว')
  const iconErrorOnlyValue = ref('')
  const iconErrorValue = ref('')

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
    title: 'input แบบ label'
  main:
    image: true
  navbottom:
    active: false
    current: 'example'
</route>
