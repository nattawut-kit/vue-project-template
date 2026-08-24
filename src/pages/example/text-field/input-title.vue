<template>
  <div class="container">
    <div>input แบบ title</div>

    <div class="mt-6 flex max-w-xs flex-col gap-6">
      <div>
        <div class="mb-2 text-14 font-bold">title / placeholder</div>
        <div class="flex flex-col gap-3">
          <TextField
            v-model="titleValue"
            title="ชื่อ-นามสกุล"
            placeholder="กรอกชื่อ-นามสกุล"
          />
          <TextField
            v-model="titleRequiredValue"
            title="อีเมล"
            placeholder="กรอกอีเมล"
            required
          />
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">type</div>
        <div class="flex flex-col gap-3">
          <TextField
            v-model="titleTypeEmail"
            type="email"
            title="อีเมล"
            placeholder="กรอกอีเมล"
          />
          <TextField
            v-model="titleTypeTel"
            type="tel"
            title="เบอร์โทร"
            placeholder="กรอกเบอร์โทร"
          />
          <TextField
            v-model="titleTypeNumber"
            type="number"
            title="ตัวเลข"
            placeholder="กรอกตัวเลข"
          />
          <TextField
            v-model="titleTypePassword"
            type="password"
            title="รหัสผ่าน"
            placeholder="กรอกรหัสผ่าน"
          />
          <TextField
            v-model="titleTypeCurrency"
            type="currency"
            title="จำนวนเงิน"
            placeholder="กรอกจำนวนเงิน"
          />
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">required + rules (blur เพื่อ validate)</div>
        <TextField
          v-model="titleRuleValue"
          title="อีเมล"
          placeholder="กรอกอีเมล"
          required
          :rules="emailRules"
        />
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">helperText</div>
        <TextField
          v-model="titleHelperValue"
          title="ชื่อผู้ใช้"
          placeholder="กรอกชื่อผู้ใช้"
          helper-text="ใช้ตัวอักษรและตัวเลขเท่านั้น"
        />
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">maxLength</div>
        <TextField
          v-model="titleMaxLengthValue"
          title="โค้ด (สูงสุด 6 ตัว)"
          placeholder="กรอกโค้ด"
          :max-length="6"
        />
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">formatFunc (ตัวพิมพ์ใหญ่ทั้งหมด)</div>
        <TextField
          v-model="titleFormatValue"
          title="รหัสคูปอง"
          placeholder="กรอกรหัสคูปอง"
          :format-func="(value: string) => value.toUpperCase()"
        />
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">disabled / readonly</div>
        <div class="flex flex-col gap-3">
          <TextField
            v-model="titleDisabledValue"
            title="disabled"
            placeholder="กรอกข้อมูล"
            disabled
          />
          <TextField
            v-model="titleReadonlyValue"
            title="readonly"
            placeholder="กรอกข้อมูล"
            readonly
          />
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">start-icon / end-icon slot</div>
        <TextField
          v-model="titleIconValue"
          title="ค้นหา"
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
    </div>
  </div>
</template>

<script setup lang="ts">
  const titleValue = ref('')
  const titleRequiredValue = ref('')
  const titleTypeEmail = ref('')
  const titleTypeTel = ref('')
  const titleTypeNumber = ref('')
  const titleTypePassword = ref('')
  const titleTypeCurrency = ref('')
  const titleRuleValue = ref('')
  const titleHelperValue = ref('')
  const titleMaxLengthValue = ref('')
  const titleFormatValue = ref('')
  const titleDisabledValue = ref('กรอกไว้แล้ว')
  const titleReadonlyValue = ref('แก้ไขไม่ได้')
  const titleIconValue = ref('')

  const emailRules: IValidationRule[] = [
    {
      validator: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: 'รูปแบบอีเมลไม่ถูกต้อง',
    },
  ]
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
