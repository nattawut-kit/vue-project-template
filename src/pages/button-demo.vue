<template>
  <div class="container">
    <div>Button Demo</div>

    <div class="mt-6 flex flex-col gap-6">
      <div>
        <div class="mb-2 text-14 font-bold">variant</div>
        <div class="flex flex-wrap gap-3">
          <Button variant="primary">primary</Button>
          <Button variant="secondary">secondary</Button>
          <Button variant="outline">outline</Button>
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">size</div>
        <div class="flex flex-wrap items-center gap-3">
          <Button size="sm">sm</Button>
          <Button size="md">md</Button>
          <Button size="lg">lg</Button>
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">round</div>
        <div class="flex flex-wrap gap-3">
          <Button round="none">none</Button>
          <Button round="sm">sm</Button>
          <Button round="md">md</Button>
          <Button round="lg">lg</Button>
          <Button round="xl">xl</Button>
          <Button round="full">full</Button>
          <Button round="circle">
            <Svg
              src="common/arrow-left"
              class="size-4"
            />
          </Button>
          <Button round="10px">10px</Button>
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">width</div>
        <div class="flex max-w-xs flex-col gap-3 rounded-lg bg-gray-100 p-3">
          <Button>default (เนื้อหากำหนดความกว้าง)</Button>
          <Button width="full">full</Button>
          <Button width="fit">fit</Button>
          <Button width="120px">120px</Button>
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">height</div>
        <div class="flex flex-wrap items-center gap-3">
          <Button>default</Button>
          <Button height="32px">32px</Button>
          <Button height="64px">64px</Button>
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">height + width + padding</div>
        <div class="flex flex-wrap items-center gap-3">
          <Button
            height="28px"
            width="109px"
            padding="4px 8px"
            >32px</Button
          >
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">padding</div>
        <div class="flex flex-wrap items-center gap-3">
          <Button>default</Button>
          <Button padding="0 12px">0 12px</Button>
          <Button padding="4px">4px</Button>
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">disabled</div>
        <div class="flex flex-wrap gap-3">
          <Button
            variant="primary"
            disabled
          >
            primary
          </Button>
          <Button
            variant="secondary"
            disabled
          >
            secondary
          </Button>
          <Button
            variant="outline"
            disabled
          >
            outline
          </Button>
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">loading</div>
        <div class="flex flex-wrap gap-3">
          <Button
            variant="primary"
            :loading="loading"
            @click="handleToggleLoading"
          >
            กดเพื่อลอง loading
          </Button>
          <Button
            variant="secondary"
            loading
          >
            secondary
          </Button>
          <Button
            variant="outline"
            loading
          >
            outline
          </Button>
          <Button
            variant="primary"
            :loading="loading"
            :disabled="loading"
            @click="handleToggleLoading"
          >
            กดเพื่อลอง loading + disabled
          </Button>
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">color / textColor (ทับสีเฉพาะจุด)</div>
        <div class="flex flex-wrap gap-3">
          <Button color="#0d6efd">color (primary bg)</Button>
          <Button
            variant="secondary"
            color="#0d6efd"
          >
            color (secondary border/text)
          </Button>
          <Button
            color="#0d6efd"
            text-color="#111827"
          >
            color + textColor
          </Button>
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">start-icon / end-icon slot</div>
        <div class="flex flex-wrap gap-3">
          <Button>
            <template #start-icon>
              <Svg
                src="common/arrow-left"
                class="size-4"
              />
            </template>
            ย้อนกลับ
          </Button>
          <Button variant="secondary">
            แลกเลย
            <template #end-icon>
              <Svg
                src="navbar/gift"
                class="size-4"
              />
            </template>
          </Button>
          <Button variant="outline">
            <template #start-icon>
              <Svg
                src="navbar/clock"
                class="size-4"
              />
            </template>
            ประวัติ
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
          <Button ripple>ripple: true (default, ตำแหน่งนิ้ว/เมาส์)</Button>
          <Button :ripple="{ center: true }">ripple: { center: true }</Button>
          <Button :ripple="{ color: '#00c2a8' }">ripple: { color: '#00c2a8' }</Button>
          <Button
            variant="secondary"
            :ripple="false"
          >
            ripple: false
          </Button>
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">scaleOnPress (ลองกดค้างแล้วสังเกตขนาดปุ่ม)</div>
        <div class="flex flex-wrap gap-3">
          <Button>default (ไม่ย่อ)</Button>
          <Button
            variant="secondary"
            scale-on-press
          >
            scaleOnPress
          </Button>
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
            placeholder="พิมพ์อะไรก็ได้แล้วลอง submit/reset"
          />
          <div class="flex flex-wrap gap-3">
            <Button type="submit">submit</Button>
            <Button
              variant="secondary"
              type="reset"
            >
              reset
            </Button>
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
  const submitResult = ref('')

  const handleToggleLoading = () => {
    loading.value = true
    setTimeout(() => {
      loading.value = false
    }, 1500)
  }

  const handleSubmit = () => {
    submitResult.value = `submit แล้ว: "${formValue.value}"`
  }

  const handleReset = () => {
    formValue.value = ''
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
