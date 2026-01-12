interface ButtonConfig {
  action: 'submit' | 'cancel'
  text: string
  disabled?: boolean
}

//Dialog Default
export const dialogsDefault = reactive({
  isOpen: false,
  type: '',
  title: '',
  content: '',
  buttons: [] as Array<ButtonConfig>,
  submit: undefined as undefined | (() => void),
  cancel: undefined as undefined | (() => void),
})

export async function showDefaultDialog(
  type: string,
  title: string,
  content: string,
  buttons: ButtonConfig[],
  submit?: () => void,
  cancel?: () => void,
  delay: number = 200
) {
  // ถ้า dialog เปิดอยู่แล้ว ให้ปิดก่อน
  if (dialogsDefault.isOpen) {
    dialogsDefault.isOpen = false
    await nextTick()
  }

  // รอตาม delay ที่กำหนด
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  dialogsDefault.isOpen = true
  dialogsDefault.type = type
  dialogsDefault.title = title
  dialogsDefault.content = content
  dialogsDefault.buttons = buttons
  dialogsDefault.submit = submit
  dialogsDefault.cancel = cancel
}

//Dialog Address
// export const dialogsAddress = reactive({
//   isOpen: false,
//   privilegeData: null as IPrivilegeList | IPrivilegeList[] | SpinRewardData[] | null,
//   addressData: {} as IAdressStore,
//   submit: undefined as undefined | (() => void),
//   cancel: undefined as undefined | (() => void),
// })

// export async function showAddressDialog(
//   privilegeData: IPrivilegeList | IPrivilegeList[] | SpinRewardData[], // รองรับทั้ง single object และ array รวมถึง SpinRewardData
//   addressData: IAdressStore,
//   submit?: () => void,
//   cancel?: () => void,
//   delay: number = 200
// ) {
//   // ถ้า dialog เปิดอยู่แล้ว ให้ปิดก่อน
//   if (dialogsAddress.isOpen) {
//     dialogsAddress.isOpen = false
//     await nextTick()
//   }

//   // รอตาม delay ที่กำหนด
//   if (delay > 0) {
//     await new Promise(resolve => setTimeout(resolve, delay))
//   }

//   dialogsAddress.isOpen = true
//   dialogsAddress.privilegeData = privilegeData
//   dialogsAddress.addressData = addressData
//   dialogsAddress.submit = submit
//   dialogsAddress.cancel = cancel
// }

// //Dialog OTP
// export const dialogsOTP = reactive({
//   isOpen: false,
//   mobileNo: '',
//   requestOTPData: {} as IRequestOTP | null,
//   pointTotal: 0,
//   submit: undefined as undefined | (() => void),
//   cancel: undefined as undefined | (() => void),
// })

// export async function showOTPDialog(
//   mobileNo: string,
//   requestOTPData: IRequestOTP | null,
//   submit?: (otpToken?: string) => void,
//   cancel?: () => void,
//   delay: number = 200
// ) {
//   // ถ้า dialog เปิดอยู่แล้ว ให้ปิดก่อน
//   if (dialogsOTP.isOpen) {
//     dialogsOTP.isOpen = false
//     await nextTick()
//   }

//   // รอตาม delay ที่กำหนด
//   if (delay > 0) {
//     await new Promise(resolve => setTimeout(resolve, delay))
//   }

//   dialogsOTP.isOpen = true
//   dialogsOTP.mobileNo = mobileNo
//   dialogsOTP.requestOTPData = requestOTPData
//   dialogsOTP.submit = submit
//   dialogsOTP.cancel = cancel
// }

// //Dialog Used Code
// export const dialogsUseCode = reactive({
//   isOpen: false,
//   privilegeDetail: {} as IPrivilegeDetail | null,
//   buttons: [] as Array<ButtonConfig>,
//   showCountdown: false,

//   submit: undefined as undefined | ((otpToken?: string) => void),
//   cancel: undefined as undefined | (() => void),
// })

// export async function showUsedCodeDialog(
//   privilegeDetail: IPrivilegeDetail | null,
//   buttons: ButtonConfig[],
//   submit?: () => void,
//   cancel?: () => void,
//   delay: number = 200
// ) {
//   // ถ้า dialog เปิดอยู่แล้ว ให้ปิดก่อน
//   if (dialogsOTP.isOpen) {
//     dialogsOTP.isOpen = false
//     await nextTick()
//   }

//   // รอตาม delay ที่กำหนด
//   if (delay > 0) {
//     await new Promise(resolve => setTimeout(resolve, delay))
//   }

//   dialogsUseCode.isOpen = true
//   dialogsUseCode.privilegeDetail = privilegeDetail
//   dialogsDefault.buttons = buttons
//   dialogsUseCode.submit = submit
//   dialogsUseCode.cancel = cancel
// }

// //Dialog contact
// export const dialogsContact = reactive({
//   isOpen: false,
//   contact: '',
//   contactExtra: '',
//   submit: undefined as undefined | (() => void),
//   cancel: undefined as undefined | (() => void),
// })

// export async function showcontactDialog(
//   contact: string,
//   contactExtra: string,
//   submit?: () => void,
//   cancel?: () => void,
//   delay: number = 200
// ) {
//   // ถ้า dialog เปิดอยู่แล้ว ให้ปิดก่อน
//   if (dialogsContact.isOpen) {
//     dialogsContact.isOpen = false
//     await nextTick()
//   }

//   // รอตาม delay ที่กำหนด
//   if (delay > 0) {
//     await new Promise(resolve => setTimeout(resolve, delay))
//   }

//   dialogsContact.isOpen = true
//   dialogsContact.contact = contact
//   dialogsContact.contactExtra = contactExtra
//   dialogsContact.submit = submit
//   dialogsContact.cancel = cancel
// }

// //Dialog Example Upload
// export const dialogsExampleUpload = reactive({
//   isOpen: false,
//   submit: undefined as undefined | (() => void),
//   cancel: undefined as undefined | (() => void),
// })

// export async function showExampleUploadDialog(
//   submit?: () => void,
//   cancel?: () => void,
//   delay: number = 200
// ) {
//   // ถ้า dialog เปิดอยู่แล้ว ให้ปิดก่อน
//   if (dialogsExampleUpload.isOpen) {
//     dialogsExampleUpload.isOpen = false
//     await nextTick()
//   }

//   // รอตาม delay ที่กำหนด
//   if (delay > 0) {
//     await new Promise(resolve => setTimeout(resolve, delay))
//   }

//   dialogsExampleUpload.isOpen = true
//   dialogsExampleUpload.submit = submit
//   dialogsExampleUpload.cancel = cancel
// }

// //Dialog Activity Conditions
// export const dialogsActivityConditions = reactive({
//   isOpen: false,
//   activityData: {} as IArticleDataList | null,
//   submit: undefined as undefined | (() => void),
//   cancel: undefined as undefined | (() => void),
// })

// export async function showActivityConditionsDialog(
//   activityData: IArticleDataList,
//   submit?: () => void,
//   cancel?: () => void,
//   delay: number = 200
// ) {
//   // ถ้า dialog เปิดอยู่แล้ว ให้ปิดก่อน
//   if (dialogsActivityConditions.isOpen) {
//     dialogsActivityConditions.isOpen = false
//     await nextTick()
//   }

//   // รอตาม delay ที่กำหนด
//   if (delay > 0) {
//     await new Promise(resolve => setTimeout(resolve, delay))
//   }

//   dialogsActivityConditions.isOpen = true
//   dialogsActivityConditions.activityData = activityData
//   dialogsActivityConditions.submit = submit
//   dialogsActivityConditions.cancel = cancel
// }

// //Dialog Error
// export const dialogsError = reactive({
//   isOpen: false,
//   title: '',
//   content: '',
//   buttons: [] as Array<ButtonConfig>,
//   submit: undefined as undefined | (() => void),
//   cancel: undefined as undefined | (() => void),
// })

// export async function showErrorDialog(
//   title: string,
//   content: string,
//   buttons: ButtonConfig[] = [{ action: 'submit', text: 'ปิด' }],
//   submit?: () => void,
//   cancel?: () => void,
//   delay: number = 200
// ) {
//   // ถ้า dialog เปิดอยู่แล้ว ให้ปิดก่อน
//   if (dialogsError.isOpen) {
//     dialogsError.isOpen = false
//     await nextTick()
//   }

//   // รอตาม delay ที่กำหนด
//   if (delay > 0) {
//     await new Promise(resolve => setTimeout(resolve, delay))
//   }

//   dialogsError.isOpen = true
//   dialogsError.title = title
//   dialogsError.content = content
//   dialogsError.buttons = buttons
//   dialogsError.submit = submit
//   dialogsError.cancel = cancel
// }
