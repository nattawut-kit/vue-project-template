import { defineStore } from 'pinia'

export const useCustomerInformationStore = defineStore('customerInformation', () => {
  const name = ref('')
  const age = ref<number | null>(null)

  const setCustomerInformation = (newName: string, newAge: number) => {
    name.value = newName
    age.value = newAge
  }

  return { name, age, setCustomerInformation }
})
