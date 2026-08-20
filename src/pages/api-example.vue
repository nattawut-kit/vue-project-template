<template>
  <div class="container">
    <div>API Call Examples</div>

    <div class="mt-6 flex flex-col gap-8">
      <div>
        <div class="mb-2 font-bold">GET — apiRaw (external, no envelope)</div>
        <Button
          :disabled="getRawLoading"
          @click="callGetRaw"
          >เรียก GET</Button
        >
        <div
          v-if="getRawLoading"
          class="mt-2"
        >
          กำลังเรียก API...
        </div>
        <div
          v-else-if="getRawError"
          class="mt-2"
        >
          โหลดไม่สำเร็จ: {{ getRawError }}
        </div>
        <div
          v-else-if="getRawResult"
          class="mt-2"
        >
          ปีที่ออกอากาศ: {{ getRawResult.yearsAired }}
        </div>
      </div>

      <div>
        <div class="mb-2 font-bold">POST — apiRaw with body (external, no envelope)</div>
        <Button
          :disabled="postRawLoading"
          @click="callPostRaw"
          >เรียก POST</Button
        >
        <div
          v-if="postRawLoading"
          class="mt-2"
        >
          กำลังส่งข้อมูล...
        </div>
        <div
          v-else-if="postRawError"
          class="mt-2"
        >
          โหลดไม่สำเร็จ: {{ postRawError }}
        </div>
        <div
          v-else-if="postRawResult"
          class="mt-2"
        >
          โพสต์สำเร็จ id: {{ postRawResult.id }}
        </div>
      </div>

      <div>
        <div class="mb-2 font-bold">POST — apiRaw with query params (external, no envelope)</div>
        <Button
          :disabled="postQueryLoading"
          @click="callPostQuery"
          >เรียก POST (query)</Button
        >
        <div
          v-if="postQueryLoading"
          class="mt-2"
        >
          กำลังส่งข้อมูล...
        </div>
        <div
          v-else-if="postQueryError"
          class="mt-2"
        >
          โหลดไม่สำเร็จ: {{ postQueryError }}
        </div>
        <div
          v-else-if="postQueryResult"
          class="mt-2"
        >
          โพสต์สำเร็จ id: {{ postQueryResult.id }}
        </div>
      </div>

      <div>
        <div class="mb-2 font-bold">GET — apiGet (ChocoCRM envelope)</div>
        <Button
          :disabled="getEnvelopeLoading"
          @click="callGetEnvelope"
          >เรียก GET (envelope)</Button
        >
        <div
          v-if="getEnvelopeLoading"
          class="mt-2"
        >
          กำลังเรียก API...
        </div>
        <div
          v-else-if="getEnvelopeResult"
          class="mt-2"
        >
          จำนวนสาขา: {{ getEnvelopeResult.first_name_th + ' ' + getEnvelopeResult.last_name_th }}
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">
          GET — apiGet with custom timeout (override default 30s)
        </div>
        <Button
          :disabled="customTimeoutLoading"
          @click="callGetEnvelopeCustomTimeout"
          >เรียก GET (timeout 0.1s)</Button
        >
        <div
          v-if="customTimeoutLoading"
          class="mt-2"
        >
          กำลังเรียก API...
        </div>
        <div
          v-else-if="customTimeoutResult"
          class="mt-2"
        >
          {{ customTimeoutResult.first_name_th + ' ' + customTimeoutResult.last_name_th }}
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">GET — error แบบปกติ (getErrorDisplay ล้วน ๆ)</div>
        <Button
          :disabled="normalErrorLoading"
          @click="callGetEnvelopeNormalError"
          >เรียก GET</Button
        >
        <div
          v-if="normalErrorLoading"
          class="mt-2"
        >
          กำลังเรียก API...
        </div>
        <div
          v-else-if="normalErrorResult"
          class="mt-2"
        >
          {{ normalErrorResult.first_name_th + ' ' + normalErrorResult.last_name_th }}
        </div>
      </div>

      <div>
        <div class="mb-2 text-14 font-bold">
          GET — error แบบ custom text (เจาะจง error code, fallback ไป getErrorDisplay)
        </div>
        <Button
          :disabled="customErrorLoading"
          @click="callGetEnvelopeCustomError"
          >เรียก GET</Button
        >
        <div
          v-if="customErrorLoading"
          class="mt-2"
        >
          กำลังเรียก API...
        </div>
        <div
          v-else-if="customErrorResult"
          class="mt-2"
        >
          {{ customErrorResult.first_name_th + ' ' + customErrorResult.last_name_th }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  interface IStoreListResult {
    first_name_th: string
    first_name_en: string
    last_name_th: string
    last_name_en: string
    consent_version: any
    image_profile_url: string
  }

  interface IFuturamaInfo {
    synopsis: string
    yearsAired: string
    creators: { name: string; url: string }[]
    id: number
  }

  const getRawLoading = ref(false)
  const getRawError = ref<string | null>(null)
  const getRawResult = ref<IFuturamaInfo | null>(null)

  const callGetRaw = async () => {
    getRawLoading.value = true
    getRawError.value = null

    try {
      const shows = await apiRaw<IFuturamaInfo[]>({
        method: 'GET',
        url: 'https://api.sampleapis.com/futurama/info',
      })

      getRawResult.value = shows[0]

      console.log(getRawResult.value.yearsAired)
    } catch (e) {
      const { title, message } = getErrorDisplay(e)
      await useDialog().confirm({ title, message })
    } finally {
      getRawLoading.value = false
    }
  }

  const postRawLoading = ref(false)
  const postRawError = ref<string | null>(null)
  const postRawResult = ref<{ id: number } | null>(null)

  const callPostRaw = async () => {
    postRawLoading.value = true
    postRawError.value = null

    try {
      postRawResult.value = await apiRaw<{ id: number }>({
        method: 'POST',
        url: 'https://jsonplaceholder.typicode.com/posts',
        data: { title: 'demo post', body: 'demo post from api-example', userId: 1 },
      })
    } catch (e) {
      const { title, message } = getErrorDisplay(e)
      await useDialog().confirm({ title, message })
    } finally {
      postRawLoading.value = false
    }
  }

  const postQueryLoading = ref(false)
  const postQueryError = ref<string | null>(null)
  const postQueryResult = ref<{ id: number } | null>(null)

  const callPostQuery = async () => {
    postQueryLoading.value = true
    postQueryError.value = null

    try {
      postQueryResult.value = await apiRaw<{ id: number }>({
        method: 'POST',
        url: 'https://jsonplaceholder.typicode.com/posts',
        params: { source: 'api-example', userId: 6 },
      })
    } catch (e) {
      const { title, message } = getErrorDisplay(e)
      await useDialog().confirm({ title, message })
    } finally {
      postQueryLoading.value = false
    }
  }

  const getEnvelopeLoading = ref(false)
  const getEnvelopeResult = ref<IStoreListResult | null>(null)

  const callGetEnvelope = async () => {
    getEnvelopeLoading.value = true

    try {
      getEnvelopeResult.value = await apiGet<IStoreListResult>('/api/v1/Customer/GetCustomerInfo')
    } catch (e) {
      const { title, message } = getErrorDisplay(e)
      await useDialog().confirm({ title, message })
    } finally {
      getEnvelopeLoading.value = false

      console.log(getEnvelopeLoading.value)
    }
  }

  const customTimeoutLoading = ref(false)
  const customTimeoutResult = ref<IStoreListResult | null>(null)

  const callGetEnvelopeCustomTimeout = async () => {
    customTimeoutLoading.value = true

    try {
      // config ตัวที่ 2 ของ apiGet คือ AxiosRequestConfig — ใส่ timeout ที่นี่
      // เพื่อ override ค่า default ของ httpClient (30000ms) เฉพาะ call นี้ call เดียว
      customTimeoutResult.value = await apiGet<IStoreListResult>(
        '/api/v1/Customer/GetMemberCardProfile',
        { timeout: 100 }
      )
    } catch (e) {
      const { title, message } = getErrorDisplay(e)
      await useDialog().confirm({ title, message })
    } finally {
      customTimeoutLoading.value = false
    }
  }

  const normalErrorLoading = ref(false)
  const normalErrorResult = ref<IStoreListResult | null>(null)

  const callGetEnvelopeNormalError = async () => {
    normalErrorLoading.value = true

    try {
      normalErrorResult.value = await apiGet<IStoreListResult>(
        '/api/v1/Customer/GetMemberCardProfile'
      )
    } catch (e) {
      // เคสปกติ: ใช้ข้อความจาก backend/interceptor ตรง ๆ ผ่าน getErrorDisplay
      const { title, message } = getErrorDisplay(e)
      await useDialog().confirm({ title, message })
    } finally {
      normalErrorLoading.value = false
    }
  }

  const customErrorLoading = ref(false)
  const customErrorResult = ref<IStoreListResult | null>(null)

  const callGetEnvelopeCustomError = async () => {
    customErrorLoading.value = true

    try {
      customErrorResult.value = await apiGet<IStoreListResult>(
        '/api/v1/Customer/GetMemberCardProfile'
      )
    } catch (e) {
      // custom text เฉพาะ error code ที่รู้จัก ส่วน error อื่น ๆ fallback ไปใช้ getErrorDisplay ตามปกติ
      if (isApiError(e) && e.code === 1000400) {
        await useDialog().confirm({
          title: 'ไม่พบข้อมูล',
          message: 'ไม่พบข้อมูลลูกค้ารายนี้ในระบบ',
        })
      } else {
        const { title, message } = getErrorDisplay(e)
        await useDialog().confirm({ title, message })
      }
    } finally {
      customErrorLoading.value = false
    }
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
    back_to: '/home'
    title: 'API Call Examples'
  main:
    image: true
  navbottom:
    active: false
    current: 'home'
</route>
