<template>
  <div class="container">
    <div>OtpInput Demo</div>

    <OtpInputDocs class="mb-4" />

    <hr class="border-gray-300" />

    <div id="demo-basic">
      <div class="mb-2 text-24 font-bold">basic</div>
      <OtpInput v-model="basicOtp" />
      <div class="mt-2 text-16 text-gray-500">ค่าปัจจุบัน: "{{ basicOtp }}"</div>
    </div>

    <hr class="my-4 border-gray-300" />

    <div id="demo-invalid">
      <div class="mb-2 text-24 font-bold">
        invalid / expired (ลองพิมพ์อย่างอื่นที่ไม่ใช่ 123456)
      </div>
      <OtpInput
        v-model="validatedOtp"
        :invalid="isInvalid"
        invalid-message="รหัส OTP ไม่ถูกต้อง"
        :expired="isExpired"
        expired-message="รหัส OTP หมดอายุแล้ว"
        :auto-focus="false"
        @clear-invalid="isInvalid = false"
      />
      <div class="mt-2 flex gap-2">
        <Button
          label="ตรวจสอบ"
          size="sm"
          @click="handleValidate"
        />
        <Button
          label="expire"
          size="sm"
          variant="outline"
          @click="
            () => {
              isExpired = true
              isInvalid = true
            }
          "
        />
      </div>
    </div>

    <hr />

    <div id="demo-message-class">
      <div class="mb-2 text-24 font-bold">messageClass (custom style ข้อความ)</div>
      <div class="flex flex-col gap-4">
        <div>
          <div class="mb-1 text-16 text-gray-500">default (text-center)</div>
          <OtpInput
            v-model="messageClassOtp"
            invalid
            invalid-message="รหัส OTP ไม่ถูกต้อง"
            :auto-focus="false"
          />
        </div>
        <div>
          <div class="mb-1 text-16 text-gray-500">
            message-class="text-left text-16 text-red-600"
          </div>
          <OtpInput
            v-model="messageClassOtp2"
            invalid
            invalid-message="รหัส OTP ไม่ถูกต้อง"
            message-class="text-left text-18 text-red-600"
            :auto-focus="false"
          />
        </div>
      </div>
    </div>

    <hr />

    <div id="demo-reset">
      <div class="mb-2 text-24 font-bold">reset() ผ่าน template ref</div>
      <OtpInput
        ref="resettableRef"
        v-model="resettableOtp"
        :auto-focus="false"
      />
      <Button
        class="mt-2"
        label="Reset"
        size="sm"
        variant="outline"
        @click="resettableRef?.reset()"
      />
    </div>

    <hr />

    <div id="demo-custom">
      <div class="mb-2 text-24 font-bold">digitCount + allowString + forceFormat</div>
      <OtpInput
        v-model="customOtp"
        :digit-count="4"
        allow-string
        force-format="uppercase"
        :auto-focus="false"
      />
      <div class="mt-2 text-16 text-gray-500">ค่าปัจจุบัน: "{{ customOtp }}"</div>
    </div>

    <hr />

    <div id="demo-shape">
      <div class="mb-2 text-24 font-bold">boxSize + boxGap + fontSize + shape</div>
      <div class="flex flex-col gap-3">
        <OtpInput
          v-model="shapeOtp"
          :box-size="40"
          :box-gap="8"
          :font-size="20"
          shape="circle"
          :auto-focus="false"
        />
        <OtpInput
          v-model="shapeOtp2"
          shape="underline"
          :auto-focus="false"
        />
      </div>
    </div>

    <hr class="my-4 border-gray-300" />

    <div id="demo-rounded">
      <div class="mb-2 text-24 font-bold">rounded (มุมกล่อง แยกอิสระจาก shape)</div>
      <div class="flex flex-col gap-3">
        <OtpInput
          v-model="roundedNoneOtp"
          rounded="none"
          :auto-focus="false"
        />
        <OtpInput
          v-model="roundedCircleLgOtp"
          shape="circle"
          rounded="lg"
          :auto-focus="false"
        />
        <OtpInput
          v-model="roundedCustomOtp"
          rounded="16px"
          :auto-focus="false"
        />
      </div>
    </div>

    <hr class="my-4 border-gray-300" />

    <div id="demo-color">
      <div class="mb-2 text-24 font-bold">borderColor + dotColor + gradientStart/End</div>
      <OtpInput
        class="mb-4"
        v-model="colorOtp"
        border-color="#8b5cf6"
        dot-color="#c4b5fd"
        gradient-start="#8b5cf6"
        gradient-end="#3b82f6"
        :auto-focus="false"
      />

      <OtpInput
        v-model="colorOtp"
        border-color="black"
        empty-char="*"
        dot-color="#c4b5fd"
        gradient-start="#8b5cf6"
        gradient-end="#3b82f6"
        :auto-focus="false"
      />
    </div>

    <hr class="my-4 border-gray-300" />

    <div id="demo-empty-animate">
      <div class="mb-2 text-24 font-bold">emptyChar + animate</div>
      <OtpInput
        v-model="emptyAnimateOtp"
        empty-char="_"
        :animate="false"
        :auto-focus="false"
      />
    </div>

    <hr class="my-4 border-gray-300" />

    <div id="demo-empty-font-size">
      <div class="mb-2 text-24 font-bold">emptyCharFontSize (แยกขนาดจากตัวเลข)</div>
      <OtpInput
        v-model="emptyFontSizeOtp"
        empty-char="●"
        :empty-char-font-size="6"
        :auto-focus="false"
      />
    </div>

    <hr class="my-4 border-gray-300" />

    <div id="demo-focus-indicator">
      <div class="mb-2 text-24 font-bold">focusIndicator (คลิกที่กล่องเพื่อดูไฮไลต์)</div>
      <OtpInput
        v-model="focusIndicatorOtp"
        focus-indicator
        :auto-focus="false"
      />
    </div>

    <hr class="my-4 border-gray-300" />

    <div id="demo-auto-focus">
      <div class="mb-2 text-24 font-bold">autoFocus (ปิด auto-focus ตอน mount)</div>
      <OtpInput
        v-model="autoFocusOtp"
        :auto-focus="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import OtpInputDocs from './_components/OtpInputDocs.vue'
  // ข้อความในหน้านี้ตั้งใจใช้ภาษาไทยล้วน ไม่ผ่าน i18n เพราะเป็นหน้าตัวอย่างสำหรับนักพัฒนา ไม่ใช่ UI จริงของโปรดักต์
  interface OtpInputExposed {
    reset: () => void
    focus: () => void
  }

  const basicOtp = ref('')

  const validatedOtp = ref('')
  const isInvalid = ref(false)
  const isExpired = ref(false)
  function handleValidate(): void {
    isInvalid.value = validatedOtp.value !== '123456'
    isExpired.value = false
  }

  const messageClassOtp = ref('')
  const messageClassOtp2 = ref('')

  const resettableOtp = ref('')
  const resettableRef = ref<OtpInputExposed | null>(null)

  const customOtp = ref('')

  const shapeOtp = ref('')
  const shapeOtp2 = ref('')
  const roundedNoneOtp = ref('')
  const roundedCircleLgOtp = ref('')
  const roundedCustomOtp = ref('')
  const colorOtp = ref('')
  const emptyAnimateOtp = ref('')
  const emptyFontSizeOtp = ref('')
  const focusIndicatorOtp = ref('')
  const autoFocusOtp = ref('')
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
    title: 'OtpInput Demo'
  main:
    image: true
  navbottom:
    active: false
</route>
