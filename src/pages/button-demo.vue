<template>
  <div class="container">
    <div>Button Demo</div>

    <div class="mt-6 flex flex-col gap-6">
      <div>
        <div class="mb-2 text-14 font-bold">variant</div>
        <div class="flex flex-wrap gap-3">
          <Button
            variant="primary"
            label="primary"
          />
          <Button
            variant="secondary"
            label="secondary"
          />
          <Button
            variant="outline"
            label="outline"
          />
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">label (แทนการใส่ slot)</div>
        <div class="flex flex-wrap gap-3">
          <Button label="กดฉัน" />
          <Button
            variant="secondary"
            label="secondary label"
          />
          <Button label="มี slot ทับ label">มี slot ทับ label</Button>
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">size</div>
        <div class="flex flex-wrap items-center gap-3">
          <Button
            size="sm"
            label="sm"
          />
          <Button
            size="md"
            label="md"
          />
          <Button
            size="lg"
            label="lg"
          />
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">round</div>
        <div class="flex flex-wrap gap-3">
          <Button
            round="none"
            label="none"
          />
          <Button
            round="sm"
            label="sm"
          />
          <Button
            round="md"
            label="md"
          />
          <Button
            round="lg"
            label="lg"
          />
          <Button
            round="xl"
            label="xl"
          />
          <Button
            round="full"
            label="full"
          />
          <Button round="circle">
            <Svg
              src="common/arrow-left"
              class="size-4"
            />
          </Button>
          <Button
            round="10px"
            label="10px"
          />
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">width</div>
        <div class="flex max-w-xs flex-col gap-3 rounded-lg bg-gray-100 p-3">
          <Button label="default (เนื้อหากำหนดความกว้าง)" />
          <Button
            :custom-size="{ width: 'full' }"
            label="full"
          />
          <Button
            :custom-size="{ width: 'fit' }"
            label="fit"
          />
          <Button
            :custom-size="{ width: '120px' }"
            label="120px"
          />
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">height</div>
        <div class="flex flex-wrap items-center gap-3">
          <Button label="default" />
          <Button
            :custom-size="{ height: '32px' }"
            label="32px"
          />
          <Button
            :custom-size="{ height: '64px' }"
            label="64px"
          />
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">fontSize</div>
        <div class="flex flex-wrap items-center gap-3">
          <Button label="default" />
          <Button
            :custom-size="{ fontSize: '10px' }"
            label="10px"
          />
          <Button
            :custom-size="{ fontSize: '20px' }"
            label="20px"
          />
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">height + width + padding</div>
        <div class="flex flex-wrap items-center gap-3">
          <Button
            :custom-size="{ height: '28px', width: '109px', fontSize: '18px', padding: '4px 8px' }"
            label="32px"
          >
            <template #start-icon>
              <Svg
                src="common/arrow-left"
                class="size-5"
              />
            </template>

            <template #end-icon>
              <Svg
                src="common/arrow-right"
                class="size-5"
              />
            </template>
          </Button>
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">padding</div>
        <div class="flex flex-wrap items-center gap-3">
          <Button label="default" />
          <Button
            :custom-size="{ padding: '0 12px' }"
            label="0 12px"
          />
          <Button
            :custom-size="{ padding: '4px' }"
            label="4px"
          />
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">disabled</div>
        <div class="flex flex-wrap gap-3">
          <Button
            variant="primary"
            disabled
            label="primary"
          />
          <Button
            variant="secondary"
            disabled
            label="secondary"
          />
          <Button
            variant="outline"
            disabled
            label="outline"
          />
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">loading</div>
        <div class="flex flex-wrap gap-3">
          <Button
            variant="primary"
            :loading="loading"
            label="กดเพื่อลอง loading"
            @click="handleToggleLoading"
          />
          <Button
            variant="secondary"
            loading
            label="secondary"
          />
          <Button
            variant="outline"
            loading
            label="outline"
          />
          <Button
            variant="primary"
            :loading="loading"
            :disabled="loading"
            label="กดเพื่อลอง loading + disabled"
            @click="handleToggleLoading"
          />
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">color / textColor (ทับสีเฉพาะจุด)</div>
        <div class="flex flex-wrap gap-3">
          <Button
            color="#0d6efd"
            label="color (primary bg)"
          />
          <Button
            variant="secondary"
            color="#0d6efd"
            label="color (secondary border/text)"
          />
          <Button
            color="#0d6efd"
            text-color="#111827"
            label="color + textColor"
          />
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">start-icon / end-icon slot</div>
        <div class="flex flex-wrap gap-3">
          <Button label="ย้อนกลับ">
            <template #start-icon>
              <Svg
                src="common/arrow-left"
                class="size-4"
              />
            </template>
          </Button>
          <Button
            variant="secondary"
            label="แลกเลย"
          >
            <template #end-icon>
              <Svg
                src="navbar/gift"
                class="size-4"
              />
            </template>
          </Button>
          <Button
            variant="outline"
            label="ประวัติ"
          >
            <template #start-icon>
              <Svg
                src="navbar/clock"
                class="size-4"
              />
            </template>
            <template #end-icon>
              <Svg
                src="navbar/user"
                class="size-4"
              />
            </template>
          </Button>
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">ripple (Boolean | Object เหมือน Quasar)</div>
        <div class="flex flex-wrap gap-3">
          <Button
            ripple
            label="ripple: true (default, ตำแหน่งนิ้ว/เมาส์)"
          />
          <Button
            :ripple="{ center: true }"
            label="ripple: { center: true }"
          />
          <Button
            :ripple="{ color: '#00c2a8' }"
            label="ripple: { color: '#00c2a8' }"
          />
          <Button
            variant="secondary"
            :ripple="false"
            label="ripple: false"
          />
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">scaleOnPress (ลองกดค้างแล้วสังเกตขนาดปุ่ม)</div>
        <div class="flex flex-wrap gap-3">
          <Button label="default (ไม่ย่อ)" />
          <Button
            variant="secondary"
            scale-on-press
            label="scaleOnPress"
          />
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">type (submit / reset ในฟอร์มตัวอย่าง)</div>
        <form
          class="flex flex-col gap-3"
          @submit.prevent="handleSubmit"
          @reset="handleReset"
        >
          <Input
            v-model="formValue"
            placeholder="input ที่ 1"
          />

          <Input
            v-model="formValue2"
            placeholder="input ที่ 2"
          />
          <div class="flex flex-wrap gap-3">
            <Button
              type="submit"
              label="submit"
            />
            <Button
              variant="secondary"
              type="reset"
              label="reset"
            />
          </div>
          <div
            v-if="submitResult"
            class="text-14 text-gray-600"
          >
            {{ submitResult }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  const loading = ref(false)
  const formValue = ref('')
  const formValue2 = ref('')
  const submitResult = ref('')

  const handleToggleLoading = () => {
    loading.value = true
    setTimeout(() => {
      loading.value = false
    }, 1500)
  }

  const handleSubmit = () => {
    submitResult.value = `submit แล้ว: "${formValue.value}", "${formValue2.value}"`
  }

  const handleReset = () => {
    formValue.value = ''
    formValue2.value = ''
    submitResult.value = 'reset แล้ว'
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
    back_to: '/example'
    title: 'Button Demo'
  main:
    image: true
  navbottom:
    active: false
    current: 'example'
</route>
