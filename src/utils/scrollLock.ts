/**
 * ล็อก scroll ของหน้าตอนเปิด overlay (modal/dialog) แล้วคืนตำแหน่ง scroll เดิมตอนปลดล็อก
 *
 * ใช้ position: fixed + top: -scrollY เพราะ overflow: hidden เฉย ๆ เอา iOS Safari ไม่อยู่
 * (body หลุดจาก flow -> document ไม่มีความสูงให้ scroll)
 *
 * นับซ้อน (lockCount) เพราะ dialog เปิดพร้อมกันได้หลายตัว — ปลดล็อกจริงเมื่อตัวสุดท้ายปิด
 * ถ้าใช้ flag boolean ตัวที่ปิดก่อนจะปลดล็อกทั้งที่ยังมี modal ค้างอยู่
 *
 * ไม่ต้องชดเชยความกว้าง scrollbar เพราะ html ใน style.css ใช้ scrollbar-gutter: stable
 * (gutter ถูกจองไว้ตลอด ความกว้าง body จึงไม่เปลี่ยนตอนล็อก — ใส่ padding เพิ่มจะทำให้เนื้อหาขยับ)
 */

let lockCount = 0
let lockedScrollY = 0

let originalStyles: {
  overflow: string
  position: string
  top: string
  width: string
} | null = null

export const lockScroll = () => {
  lockCount += 1

  if (lockCount > 1) return

  const { body } = document

  originalStyles = {
    overflow: body.style.overflow,
    position: body.style.position,
    top: body.style.top,
    width: body.style.width,
  }

  lockedScrollY = window.scrollY

  body.style.overflow = 'hidden'
  body.style.position = 'fixed'
  body.style.top = `-${lockedScrollY}px`
  body.style.width = '100%'
}

export const unlockScroll = () => {
  if (lockCount === 0) return

  lockCount -= 1

  if (lockCount > 0 || originalStyles === null) return

  const { body } = document

  body.style.overflow = originalStyles.overflow
  body.style.position = originalStyles.position
  body.style.top = originalStyles.top
  body.style.width = originalStyles.width
  originalStyles = null

  window.scrollTo(0, lockedScrollY)
}

/** เผื่อไล่เคส lock ค้าง (ปลดไม่ครบ) */
export const isScrollLocked = () => lockCount > 0
