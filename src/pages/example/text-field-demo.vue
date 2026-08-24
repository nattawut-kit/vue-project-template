<template>
  <div class="container">
    <div>TextField Demo</div>

    <div class="mt-6 flex max-w-xs flex-col gap-6">
      <div>
        <div class="mb-2 text-14 font-bold">label / placeholder</div>
        <div class="flex flex-col gap-3">
          <TextField
            v-model="basic"
            required
            label="ชื่อ-นามสกุล"
          />
          <TextField
            v-model="noLabel"
            placeholder="ไม่มี label"
          />
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">title (หัวข้อนิ่งเหนือกล่อง แทน label ลอย)</div>
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
            v-model="typeEmail"
            type="email"
            label="อีเมล"
          />
          <TextField
            v-model="typeNumber"
            type="number"
            label="ตัวเลข"
          />
          <TextField
            v-model="typeTel"
            type="tel"
            label="เบอร์โทร"
          />
          <TextField
            v-model="typePassword"
            type="password"
            label="รหัสผ่าน"
          />
          <TextField
            v-model="typeCurrency"
            type="currency"
            label="จำนวนเงิน"
          />
          <TextField
            v-model="typeTextarea"
            type="textarea"
            label="ข้อความยาว"
          />
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">required + rules (blur เพื่อ validate)</div>
        <TextField
          v-model="ruleValue"
          label="อีเมล"
          required
          :rules="emailRules"
        />
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">helperText</div>
        <TextField
          v-model="helperValue"
          label="ชื่อผู้ใช้"
          helper-text="ใช้ตัวอักษรและตัวเลขเท่านั้น"
        />
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">maxLength</div>
        <TextField
          v-model="maxLengthValue"
          label="โค้ด (สูงสุด 6 ตัว)"
          :max-length="6"
        />
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">formatFunc (ตัวพิมพ์ใหญ่ทั้งหมด)</div>
        <TextField
          v-model="formatValue"
          label="รหัสคูปอง"
          :format-func="(value: string) => value.toUpperCase()"
        />
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">disabled / readonly</div>
        <div class="flex flex-col gap-3">
          <TextField
            v-model="disabledValue"
            label="disabled"
            disabled
          />
          <TextField
            v-model="readonlyValue"
            label="readonly"
            readonly
          />
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">textarea: rows / autoResize / resizable</div>
        <div class="flex flex-col gap-3">
          <TextField
            v-model="textareaRows"
            type="textarea"
            label="rows คงที่"
            :rows="3"
          />
          <TextField
            v-model="textareaAutoResize"
            type="textarea"
            label="autoResize"
            auto-resize
          />
          <TextField
            v-model="textareaResizable"
            type="textarea"
            label="resizable"
            resizable
          />
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">start-icon / end-icon slot</div>
        <TextField
          v-model="iconValue"
          label="ค้นหา"
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
    </div>
  </div>
</template>

<script setup lang="ts">
  const basic = ref('')
  const noLabel = ref('')
  const titleValue = ref('')
  const titleRequiredValue = ref('')
  const typeEmail = ref('')
  const typeNumber = ref('')
  const typeTel = ref('')
  const typePassword = ref('')
  const typeCurrency = ref('')
  const typeTextarea = ref('')
  const ruleValue = ref('')
  const helperValue = ref('')
  const maxLengthValue = ref('')
  const formatValue = ref('')
  const disabledValue = ref('กรอกไว้แล้ว')
  const readonlyValue = ref('แก้ไขไม่ได้')
  const textareaRows = ref('')
  const textareaAutoResize = ref('')
  const textareaResizable = ref('')
  const iconValue = ref('')

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
    back_to: '/example'
    title: 'TextField Demo'
  main:
    image: true
  navbottom:
    active: false
    current: 'example'
</route>
