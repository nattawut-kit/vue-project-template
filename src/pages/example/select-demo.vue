<template>
  <div class="container">
    <div>Select Demo</div>

    <SelectDocs class="mb-4" />

    <hr />

    <div class="mt-6 flex flex-col gap-6">
      <div id="demo-basic">
        <div class="mb-2 text-18 font-bold">single-select พื้นฐาน</div>
        <div class="max-w-xs">
          <Select
            v-model="province"
            label="จังหวัด"
            placeholder="เลือกจังหวัด"
            :options="provinceOptions"
          />
          <div class="mt-2 text-16 text-gray-600">
            ค่าที่เลือก: {{ optionLabelFor(province, provinceOptions) }}
          </div>
          <div class="text-16 text-gray-600">v-model: {{ province || '(ยังไม่ได้เลือก)' }}</div>
        </div>
      </div>

      <hr />

      <div id="demo-option-slot">
        <div class="mb-2 text-18 font-bold">
          slot: option — ใช้ครบทั้ง 4 scope prop (option / index / selected / highlighted)
        </div>
        <div class="max-w-xs">
          <Select
            v-model="provinceWithIcon"
            label="จังหวัด (option แบบ custom เต็มรูปแบบ)"
            placeholder="เลือกจังหวัด"
            :options="provinceOptions"
            :option-height="56"
          >
            <template #option="{ option, index, selected, highlighted }">
              <!-- icon นำหน้า — เทาตอน disabled -->
              <Svg
                src="common/info-circle"
                class="size-4 shrink-0"
                :class="option.disabled && 'opacity-40'"
              />

              <!-- 2 บรรทัด: label + บรรทัดรองที่ derive จาก option/index เอง (ไม่ได้มาจาก ISelectOption ตรงๆ) -->
              <span class="min-w-0 flex-1">
                <span
                  class="block truncate"
                  :class="option.disabled && 'text-gray-400'"
                  >{{ option.label }}</span
                >
                <span class="block truncate text-12 text-gray-500">
                  ลำดับที่ {{ index + 1 }} · value: {{ option.value }}
                </span>
              </span>

              <!-- badge ตอน disabled -->
              <span
                v-if="option.disabled"
                class="shrink-0 rounded bg-gray-200 px-1.5 py-0.5 text-12 text-gray-500"
              >
                ปิดใช้งาน
              </span>

              <!-- ลูกศรตอน highlighted (hover/กด arrow key ไล่มาถึง) -->
              <Svg
                v-if="highlighted && !option.disabled"
                src="common/arrow-right"
                class="size-3 shrink-0"
              />

              <!-- checkmark ของเราเอง ตอน selected -->
              <Svg
                v-if="selected"
                src="common/check"
                class="size-4 shrink-0"
                color="#f61414"
              />
            </template>
          </Select>
          <div class="mt-2 text-16 text-gray-600">
            ค่าที่เลือก: {{ optionLabelFor(provinceWithIcon, provinceOptions) }}
          </div>
          <div class="text-16 text-gray-600">
            v-model: {{ provinceWithIcon || '(ยังไม่ได้เลือก)' }}
          </div>
          <div class="mt-2 text-16 text-gray-600">
            แถวสูงขึ้นเพราะมี 2 บรรทัด เลยต้องเพิ่ม
            <code>:option-height="56"</code>
            (ปกติ default 44) ด้วย ไม่งั้น virtual-scroll คำนวณตำแหน่งพลาดเพราะความสูงจริงไม่ตรงกับที่บอกไว้
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-option-slot-multiple">
        <div class="mb-2 text-18 font-bold">slot: option + multiple (ต้องวาด checkbox เองด้วย)</div>
        <div class="max-w-xs">
          <Select
            v-model="tagsWithCustomCheckbox"
            multiple
            label="แท็ก (checkbox ทรงกลม custom เอง)"
            placeholder="เลือกแท็ก"
            :options="tagOptions"
          >
            <template #option="{ option, selected }">
              <!-- multiple ไม่มี checkbox สี่เหลี่ยม default ให้อัตโนมัติแล้วตอนใส่ slot — วาดเองตรงนี้ -->
              <span
                class="flex size-4 shrink-0 items-center justify-center rounded-full border-2"
                :class="selected ? 'border-main-1 bg-main-1' : 'border-gray-300'"
              >
                <span
                  v-if="selected"
                  class="size-1.5 rounded-full bg-white"
                ></span>
              </span>
              <span class="flex-1 truncate">{{ option.label }}</span>
            </template>
          </Select>
          <div class="mt-2 text-16 text-gray-600">
            ค่าที่เลือก: {{ optionLabelFor(tagsWithCustomCheckbox, tagOptions) }}
          </div>
          <div class="text-16 text-gray-600">
            v-model: {{ tagsWithCustomCheckbox.join(', ') || '(ยังไม่ได้เลือก)' }}
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-multiple">
        <div class="mb-2 text-18 font-bold">multiple</div>
        <div class="max-w-xs">
          <Select
            v-model="tags"
            multiple
            label="แท็ก"
            placeholder="เลือกแท็ก"
            :options="tagOptions"
          />
          <div class="mt-2 text-16 text-gray-600">
            ค่าที่เลือก: {{ optionLabelFor(tags, tagOptions) }}
          </div>
          <div class="text-16 text-gray-600">
            v-model: {{ tags.join(', ') || '(ยังไม่ได้เลือก)' }}
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-searchable">
        <div class="mb-2 text-18 font-bold">searchable</div>
        <div class="max-w-xs">
          <Select
            v-model="searchableProvince"
            searchable
            label="จังหวัด (ค้นหาได้)"
            placeholder="พิมพ์เพื่อค้นหา"
            :options="provinceOptions"
          />
          <div class="mt-2 text-16 text-gray-600">
            ค่าที่เลือก: {{ optionLabelFor(searchableProvince, provinceOptions) }}
          </div>
          <div class="text-16 text-gray-600">
            v-model: {{ searchableProvince || '(ยังไม่ได้เลือก)' }}
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-use-input">
        <div class="mb-2 text-18 font-bold">useInput + filter (กรองเอง แบบ sync ในเครื่อง)</div>
        <div class="max-w-xs">
          <Select
            v-model="provinceUseInput"
            use-input
            clearable
            label="จังหวัด (พิมพ์กรองเอง ผ่าน @filter)"
            placeholder="พิมพ์เพื่อค้นหา"
            :options="filteredProvinceOptions"
            @filter="onFilterProvince"
          />
          <div class="mt-2 text-16 text-gray-600">
            ค่าที่เลือก: {{ optionLabelFor(provinceUseInput, provinceOptions) }}
          </div>
          <div class="text-16 text-gray-600">
            v-model: {{ provinceUseInput || '(ยังไม่ได้เลือก)' }}
          </div>
          <div class="mt-2 text-16 text-gray-600">
            ต่างจาก searchable ตรงที่ trigger กลายเป็นช่องพิมพ์ตรงๆ และ Select เอง
            <b>ไม่กรองให้อัตโนมัติ</b> — ต้องฟัง @filter แล้ว mutate
            <code>filteredProvinceOptions</code> เอง (ในนี้กรองแบบ sync จาก provinceOptions ทั้งชุด)
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-use-input-remote">
        <div class="mb-2 text-18 font-bold">useInput + filter (autocomplete จาก API จริง)</div>
        <div class="max-w-xs">
          <Select
            v-model="selectedUserAsync"
            use-input
            :loading="filterLoading"
            label="ผู้ใช้ (พิมพ์ค้นหาจาก API จริง)"
            placeholder="พิมพ์ชื่อผู้ใช้ (เช่น a, e, l)"
            :options="userOptionsAsync"
            @filter="onFilterRemote"
          />
          <div class="mt-2 text-16 text-gray-600">
            ค่าที่เลือก: {{ optionLabelFor(selectedUserAsync, userOptionsAsync) }}
          </div>
          <div class="text-16 text-gray-600">
            v-model: {{ selectedUserAsync || '(ยังไม่ได้เลือก)' }}
          </div>
          <div class="mt-2 text-16 text-gray-600">
            หยุดพิมพ์ 500ms (default ของ inputDebounce) แล้วค่อยยิง API จริงไปที่
            jsonplaceholder.typicode.com/users แล้วกรองฝั่งเราเอง (จำลอง remote search) — ไม่ใช่ยิงทุก
            keystroke แล้ว มี token guard กันเคสตอบช้าสลับคิวกัน (คำค้นใหม่มาก่อน response เก่าจะกลับมา
            ก็ทิ้ง response เก่าผ่าน abort())
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-use-input-multiple">
        <div class="mb-2 text-18 font-bold">useInput + multiple + filter</div>
        <div class="max-w-xs">
          <Select
            v-model="tagsUseInput"
            use-input
            multiple
            label="แท็ก (พิมพ์กรองแล้วเลือกได้หลายตัว)"
            placeholder="พิมพ์เพื่อค้นหา"
            :options="filteredTagOptions"
            @filter="onFilterTags"
          />
          <div class="mt-2 text-16 text-gray-600">
            ค่าที่เลือก: {{ optionLabelFor(tagsUseInput, tagOptions) }}
          </div>
          <div class="text-16 text-gray-600">
            v-model: {{ tagsUseInput.join(', ') || '(ยังไม่ได้เลือก)' }}
          </div>
          <div class="mt-2 text-16 text-gray-600">
            multiple ไม่โชว์รายการที่เลือกไว้ในตัวช่องพิมพ์ (ไม่ทำ chips) — เลือกแล้วช่องพิมพ์เคลียร์เป็น
            ว่างพร้อม list กลับมาเป็นชุดเต็มให้ไล่ดูต่อได้ทันที (ไม่ค้างเป็นผลกรองคำก่อนหน้า)
            ดูรายการที่เลือกจริงได้จากบรรทัด "ค่าที่เลือก"/"v-model" ด้านล่างแทน
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-emit-value-true">
        <div class="mb-2 text-18 font-bold">emitValue: true (default — v-model ได้ value ดิบ)</div>
        <div class="max-w-xs">
          <Select
            v-model="provinceemit"
            emit-value
            label="จังหวัด (ได้ value ดิบ)"
            placeholder="เลือกจังหวัด"
            :options="provinceOptions"
          />
          <div class="mt-2 text-16 text-gray-600">
            ค่าที่เลือก: {{ optionLabelFor(provinceemit, provinceOptions) }}
          </div>
          <div class="text-16 text-gray-600">v-model: {{ provinceemit || '(ยังไม่ได้เลือก)' }}</div>
        </div>
      </div>

      <hr />

      <div id="demo-emit-value-false">
        <div class="mb-2 text-18 font-bold">
          emitValue: false, mapOptions: true (v-model ได้ option object เต็มๆ)
        </div>
        <div class="max-w-xs">
          <Select
            v-model="provinceObject"
            :emit-value="false"
            label="จังหวัด (ได้ object เต็มๆ)"
            placeholder="เลือกจังหวัด"
            :options="provinceOptions"
          />
          <div class="mt-2 text-16 text-gray-600">
            ค่าที่เลือก: {{ optionLabelFor(provinceObject, provinceOptions) }}
          </div>
          <div class="text-16 text-gray-600">
            v-model: {{ provinceObject || '(ยังไม่ได้เลือก)' }}
          </div>
          <div class="text-16 text-gray-600">
            ตัวอย่างที่จะเอาไปใช้ (provinceObject.label):
            {{ (provinceObject && provinceObject.label) || '(ยังไม่ได้เลือก)' }}
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-map-options">
        <div class="mb-2 text-18 font-bold">
          mapOptions: false (trigger โชว์ค่าดิบ ไม่ resolve label)
        </div>
        <div class="max-w-xs">
          <Select
            v-model="provinceRaw"
            :map-options="false"
            label="จังหวัด (โชว์ value ดิบ)"
            placeholder="เลือกจังหวัด"
            :options="provinceOptions"
          />
          <div class="mt-2 text-16 text-gray-600">
            ค่าที่เลือก (raw, ไม่ resolve label): {{ provinceRaw || '(ยังไม่ได้เลือก)' }}
          </div>
          <div class="text-16 text-gray-600">v-model: {{ provinceRaw || '(ยังไม่ได้เลือก)' }}</div>
          <div class="mt-2 text-16 text-gray-600">
            เทียบกับ demo แรก (mapOptions default true) — เลือกจังหวัดเดียวกัน trigger จะโชว์ value
            ดิบ เช่น "chiang-mai" แทน "เชียงใหม่"
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-display-value">
        <div class="mb-2 text-18 font-bold">displayValue (ทับข้อความที่ trigger โชว์)</div>
        <div class="max-w-xs">
          <Select
            v-model="tagsWithDisplayValue"
            multiple
            label="แท็ก (เลือกเกิน 2 แล้วสรุปเป็นจำนวน)"
            placeholder="เลือกแท็ก"
            :options="tagOptions"
            :display-value="tagsDisplayValue"
          />
          <div class="mt-2 text-16 text-gray-600">
            ค่าที่เลือกจริง: {{ optionLabelFor(tagsWithDisplayValue, tagOptions) }}
          </div>
          <div class="text-16 text-gray-600">
            v-model: {{ tagsWithDisplayValue.join(', ') || '(ยังไม่ได้เลือก)' }}
          </div>
          <div class="mt-2 text-16 text-gray-600">
            ลองเลือกเกิน 2 รายการ — trigger จะโชว์ "เลือกไว้ N รายการ" แทนการต่อ label ยาวๆ
            (เลือก ≤ 2 ยังโชว์ label ปกติ เพราะ displayValue เป็น '' ตอนนั้น)
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-virtual-scroll">
        <div class="mb-2 text-18 font-bold">
          ลิสต์ยาว 1,000 รายการ (virtual scroll) + @popup-show/@popup-hide + @virtual-scroll
        </div>
        <div class="max-w-xs">
          <Select
            v-model="longValue"
            searchable
            label="ตัวเลือก 1,000 รายการ"
            placeholder="เลือกตัวเลือก"
            :options="longOptions"
            @popup-show="logSelectEvent('popup-show')"
            @popup-hide="logSelectEvent('popup-hide')"
            @virtual-scroll="onLongListVirtualScroll"
          />
          <div class="mt-2 text-16 text-gray-600">
            ค่าที่เลือก: {{ optionLabelFor(longValue, longOptions) }}
          </div>
          <div class="text-16 text-gray-600">v-model: {{ longValue || '(ยังไม่ได้เลือก)' }}</div>
          <div class="mt-2 text-16 text-gray-600">
            เปิด dev tools แล้วตรวจ DOM — จะมีแค่ option ส่วนน้อยที่ถูก render จริงในแต่ละขณะ
            ไม่ใช่ทั้ง 1,000 ตัว
          </div>
          <div class="mt-2 text-16 text-gray-600">
            event log (เปิด/ปิด/scroll ล่าสุด 5 รายการ):
            <span
              v-for="(entry, i) in selectEventLog"
              :key="i"
              class="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-14"
              >{{ entry }}</span
            >
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-option-height">
        <div class="mb-2 text-18 font-bold">optionHeight / maxPanelHeight</div>
        <div class="max-w-xs">
          <Select
            v-model="monthValue"
            label="เดือน (แถวสูง 60px, panel สูงสุด 180px)"
            placeholder="เลือกเดือน"
            :options="monthOptions"
            :option-height="60"
            :max-panel-height="180"
          />
          <div class="mt-2 text-16 text-gray-600">
            v-model: {{ monthValue || '(ยังไม่ได้เลือก)' }}
          </div>
          <div class="mt-2 text-16 text-gray-600">
            default คือ <code>optionHeight</code> 44px / <code>maxPanelHeight</code> 280px —
            เปิด dropdown แล้วสังเกตว่าแถวสูงขึ้นชัดเจน (60px) และ panel เตี้ยลง (สูงสุด 180px)
            เห็นแค่ ~3 แถวก่อนต้อง scroll จาก 12 เดือนทั้งหมด — สองค่านี้ต้องปรับคู่กันเสมอเวลาทำแถว
            custom ที่สูงไม่เท่า default (ดู demo slot: option ด้านบนที่แถวสูงขึ้นเพราะมี 2 บรรทัด)
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-custom-option-keys">
        <div class="mb-2 text-18 font-bold">
          optionValue/optionLabel (options shape อื่น ไม่ใช่ { label, value })
        </div>
        <div class="max-w-xs">
          <Select
            v-model="cityValue"
            option-value="id"
            option-label="name"
            label="เมือง (options เป็น { id, name })"
            placeholder="เลือกเมือง"
            :options="cityOptionsRaw"
          />
          <div class="mt-2 text-16 text-gray-600">v-model: {{ cityValue || '(ยังไม่ได้เลือก)' }}</div>
          <div class="mt-2 text-16 text-gray-600">
            options ดิบเป็น <code>{ id: number, name: string }</code> ไม่ใช่
            <code>{ value, label }</code> — ไม่ต้อง <code>.map()</code> แปลงเองก่อนส่งเข้า
            <code>:options</code> เลย ใส่ <code>option-value="id"</code>
            <code>option-label="name"</code> ให้ Select ไปดึงเองแทน
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-selected-slot">
        <div class="mb-2 text-18 font-bold">slot: selected (custom เนื้อหาที่ trigger โชว์)</div>
        <div class="max-w-xs">
          <Select
            v-model="provinceSelectedSlot"
            label="จังหวัด (badge สีเอง)"
            placeholder="เลือกจังหวัด"
            :options="provinceOptions"
          >
            <template #selected="{ selectedOptions, displayText }">
              <span
                v-if="selectedOptions.length"
                class="flex-1 truncate text-17"
              >
                <span class="rounded bg-main-1/10 px-1.5 py-0.5 text-14 font-bold text-main-1">{{
                  selectedOptions[0].value
                }}</span>
                {{ selectedOptions[0].label }}
              </span>
              <span
                v-else
                class="flex-1 truncate text-17 text-gray-500"
                >{{ displayText || 'เลือกจังหวัด' }}</span
              >
            </template>
          </Select>
          <div class="mt-2 text-16 text-gray-600">
            v-model: {{ provinceSelectedSlot || '(ยังไม่ได้เลือก)' }}
          </div>
          <div class="mt-2 text-16 text-gray-600">
            trigger โชว์ badge รหัสจังหวัด (option.value) นำหน้าชื่อ — ข้อมูลมาจาก
            <code>selectedOptions</code> ของ slot นี้ ไม่ใช่แค่ string ธรรมดา
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-prepend-append">
        <div class="mb-2 text-18 font-bold">slot: prepend / append</div>
        <div class="max-w-xs">
          <Select
            v-model="provincePrependAppend"
            searchable
            label="จังหวัด (มี icon นำหน้า + badge ต่อท้าย)"
            placeholder="เลือกจังหวัด"
            :options="provinceOptions"
          >
            <template #prepend>
              <Svg
                src="common/info-circle"
                class="mr-2 size-4 shrink-0"
              />
            </template>
            <template #append>
              <span class="mr-2 shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-12 text-gray-600"
                >TH</span
              >
            </template>
          </Select>
          <div class="mt-2 text-16 text-gray-600">
            v-model: {{ provincePrependAppend || '(ยังไม่ได้เลือก)' }}
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-custom-icons">
        <div class="mb-2 text-18 font-bold">dropdownIcon / clearIcon</div>
        <div class="max-w-xs">
          <Select
            v-model="provinceCustomIcons"
            clearable
            dropdown-icon="common/arrow-right"
            clear-icon="common/eye-off"
            label="จังหวัด (ไอคอนเปลี่ยนเอง)"
            placeholder="เลือกจังหวัด"
            :options="provinceOptions"
          />
          <div class="mt-2 text-16 text-gray-600">
            v-model: {{ provinceCustomIcons || '(ยังไม่ได้เลือก)' }}
          </div>
          <div class="mt-2 text-16 text-gray-600">
            ลูกศร chevron เปลี่ยนเป็น <code>common/arrow-right</code> (หมุนได้ตามปกติตอนเปิด) ปุ่ม clear
            เปลี่ยนเป็น <code>common/eye-off</code> — จงใจใช้ icon แปลกๆ ให้เห็นชัดว่าเปลี่ยนได้จริง
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-no-option-slot">
        <div class="mb-2 text-18 font-bold">slot: no-option</div>
        <div class="max-w-xs">
          <Select
            v-model="provinceNoOptionSlot"
            searchable
            label="จังหวัด (custom ข้อความไม่พบข้อมูล)"
            placeholder="ลองพิมพ์ 'xyz'"
            :options="provinceOptions"
          >
            <template #no-option>
              <div class="flex flex-col items-center gap-1 py-1">
                <Svg
                  src="common/info-circle"
                  class="size-5 text-gray-400"
                />
                <span>ไม่พบจังหวัดที่ค้นหา ลองคำอื่นดูนะ</span>
              </div>
            </template>
          </Select>
          <div class="mt-2 text-16 text-gray-600">
            v-model: {{ provinceNoOptionSlot || '(ยังไม่ได้เลือก)' }}
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-clearable">
        <div class="mb-2 text-18 font-bold">clearable</div>
        <div class="max-w-xs">
          <Select
            v-model="clearableProvince"
            clearable
            label="จังหวัด"
            placeholder="เลือกจังหวัด"
            :options="provinceOptions"
          />
          <div class="mt-2 text-16 text-gray-600">
            ค่าที่เลือก: {{ optionLabelFor(clearableProvince, provinceOptions) }}
          </div>
          <div class="text-16 text-gray-600">
            v-model: {{ clearableProvince || '(ยังไม่ได้เลือก)' }}
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-disabled-readonly">
        <div class="mb-2 text-18 font-bold">disabled / readonly</div>
        <div class="flex max-w-xs flex-col gap-3">
          <div>
            <Select
              v-model="disabledValue"
              disabled
              label="disabled"
              placeholder="เลือกจังหวัด"
              :options="provinceOptions"
            />
            <div class="mt-2 text-16 text-gray-600">
              ค่าที่เลือก: {{ optionLabelFor(disabledValue, provinceOptions) }}
            </div>
            <div class="text-16 text-gray-600">
              v-model: {{ disabledValue || '(ยังไม่ได้เลือก)' }}
            </div>
          </div>
          <div>
            <Select
              v-model="readonlyValue"
              readonly
              label="readonly"
              :options="provinceOptions"
            />
            <div class="mt-2 text-16 text-gray-600">
              ค่าที่เลือก: {{ optionLabelFor(readonlyValue, provinceOptions) }}
            </div>
            <div class="text-16 text-gray-600">
              v-model: {{ readonlyValue || '(ยังไม่ได้เลือก)' }}
            </div>
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-loading">
        <div class="mb-2 text-18 font-bold">loading (โหลด options จาก API จริง)</div>
        <div class="max-w-xs">
          <Select
            v-model="selectedUser"
            :loading="loadingUsers"
            label="ผู้ใช้ (จาก jsonplaceholder.typicode.com)"
            :placeholder="loadingUsers ? 'กำลังโหลด...' : 'เลือกผู้ใช้'"
            :options="userOptions"
          />
          <Button
            class="mt-2"
            variant="secondary"
            :disabled="loadingUsers"
            label="โหลดใหม่"
            @click="fetchUsers"
          />
          <div class="mt-2 text-16 text-gray-600">
            ค่าที่เลือก: {{ optionLabelFor(selectedUser, userOptions) }}
          </div>
          <div class="text-16 text-gray-600">v-model: {{ selectedUser || '(ยังไม่ได้เลือก)' }}</div>
        </div>
      </div>

      <hr />

      <div id="demo-required-rules">
        <div class="mb-2 text-18 font-bold">required + rules</div>
        <div class="max-w-xs">
          <Select
            ref="requiredSelectRef"
            v-model="requiredValue"
            required
            label="จังหวัด"
            placeholder="เลือกจังหวัด"
            :options="provinceOptions"
          />
          <Button
            class="mt-2"
            variant="secondary"
            label="เช็ค validate()"
            @click="requiredSelectRef?.validate()"
          />
          <div class="mt-2 text-16 text-gray-600">
            ค่าที่เลือก: {{ optionLabelFor(requiredValue, provinceOptions) }}
          </div>
          <div class="text-16 text-gray-600">
            v-model: {{ requiredValue || '(ยังไม่ได้เลือก)' }}
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-custom-style">
        <div class="mb-2 text-18 font-bold">
          customStyle (รวมสี hover/highlight/selected ใน panel)
        </div>
        <div class="max-w-xs">
          <Select
            v-model="customStyleValue"
            label="จังหวัด"
            placeholder="เลือกจังหวัด"
            :options="provinceOptions"
            :custom-style="{
              rounded: 'full',
              borderColor: '#0d6efd',
              focusColor: '#0d6efd',
              optionHoverColor: '#e0edff',
              optionSelectedColor: '#0d6efd',
              optionSelectedTextColor: '#ffffff',
            }"
          />
          <div class="mt-2 text-16 text-gray-600">
            ค่าที่เลือก: {{ optionLabelFor(customStyleValue, provinceOptions) }}
          </div>
          <div class="text-16 text-gray-600">
            v-model: {{ customStyleValue || '(ยังไม่ได้เลือก)' }}
          </div>
          <div class="mt-2 text-16 text-gray-600">
            เปิด dropdown แล้วลองเอาเมาส์วางบน option (สีฟ้าอ่อน) เทียบกับแถวที่เลือกไว้แล้ว
            (สีฟ้าเข้ม + ตัวอักษรขาว)
          </div>
        </div>
      </div>

      <hr />

      <div id="demo-options-change">
        <div class="mb-2 text-18 font-bold">options เปลี่ยนหลังมีค่าเลือกไว้แล้ว</div>
        <div class="max-w-xs">
          <Select
            v-model="dynamicValue"
            label="ชุดข้อมูล"
            :options="dynamicOptions"
          />
          <Button
            class="mt-2"
            variant="secondary"
            label="สลับชุด options"
            @click="swapDynamicOptions"
          />
          <div class="mt-2 text-16 text-gray-600">
            ค่าที่เลือก: {{ optionLabelFor(dynamicValue, dynamicOptions) }}
          </div>
          <div class="text-16 text-gray-600">v-model: {{ dynamicValue || '(ยังไม่ได้เลือก)' }}</div>
          <div class="mt-2 text-16 text-gray-600">
            ค่าที่เลือกจากชุดเดิม (ที่อาจไม่มีอยู่ในชุดใหม่แล้ว) จะแสดงว่างอย่างสุภาพ ไม่ crash
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import SelectDocs from './_components/SelectDocs.vue'
  // ต้องเป็น relative path ห้ามใช้ '@/...' — alias จะ resolve ผ่าน ambient shim (*.vue มีแค่ default export) ทำให้มองไม่เห็น named type export นี้เลย ส่วน relative path ให้ vue-tsc ไปอ่าน SFC จริงได้ตรงๆ
  import type { ISelectOption } from '../../components/form/Select.vue'

  interface SelectExposed {
    hasError: boolean
    errorMessage: string
    validate: () => void
  }

  type SelectDisplayValue = string | number | ISelectOption | (string | number)[] | ISelectOption[]

  // แสดง label ที่อ่านง่ายคู่กับ v-model ดิบในแต่ละ demo — ให้เห็นชัดว่า v-model เก็บ value/object อะไรจริงๆ ส่วน label ที่ผู้ใช้เห็นถูก resolve กับ options ต่างหาก
  const optionLabelFor = (value: SelectDisplayValue, options: ISelectOption[]): string => {
    const resolveOne = (entry: string | number | ISelectOption): string | undefined =>
      typeof entry === 'object'
        ? entry.label
        : options.find(option => option.value === entry)?.label

    if (Array.isArray(value)) {
      const labels = value.map(resolveOne).filter((label): label is string => !!label)
      return labels.length ? labels.join(', ') : '(ยังไม่ได้เลือก)'
    }

    if (value === '' || value == null) return '(ยังไม่ได้เลือก)'

    return resolveOne(value) ?? '(ยังไม่ได้เลือก)'
  }

  const provinceOptions: ISelectOption[] = [
    { label: 'กรุงเทพมหานคร', value: 'bangkok' },
    { label: 'เชียงใหม่', value: 'chiang-mai' },
    { label: 'ขอนแก่น', value: 'khon-kaen' },
    { label: 'ภูเก็ต', value: 'phuket' },
    { label: 'ชลบุรี', value: 'chonburi' },
    { label: 'นครราชสีมา (ปิดใช้งาน)', value: 'nakhon-ratchasima', disabled: true },
  ]

  // options shape ไม่ตรง { label, value } ปกติ — จำลอง response จาก API จริงที่ไม่ได้ตั้งชื่อ field ตามที่ Select ต้องการ
  interface IRawCity {
    id: number
    name: string
  }

  const cityOptionsRaw: IRawCity[] = [
    { id: 1, name: 'กรุงเทพมหานคร' },
    { id: 2, name: 'เชียงใหม่' },
    { id: 3, name: 'ขอนแก่น' },
    { id: 4, name: 'ภูเก็ต' },
  ]

  const tagOptions: ISelectOption[] = [
    { label: 'ลูกค้าใหม่', value: 'new' },
    { label: 'ลูกค้าเก่า', value: 'returning' },
    { label: 'VIP', value: 'vip' },
    { label: 'สมัครสมาชิก', value: 'member' },
  ]

  const monthOptions: ISelectOption[] = [
    'มกราคม',
    'กุมภาพันธ์',
    'มีนาคม',
    'เมษายน',
    'พฤษภาคม',
    'มิถุนายน',
    'กรกฎาคม',
    'สิงหาคม',
    'กันยายน',
    'ตุลาคม',
    'พฤศจิกายน',
    'ธันวาคม',
  ].map((label, i) => ({ label, value: i + 1 }))

  const longOptions: ISelectOption[] = Array.from({ length: 1000 }, (_, i) => ({
    label: `ตัวเลือกที่ ${i + 1}`,
    value: i + 1,
  }))

  const dynamicOptionSets: ISelectOption[][] = [
    [
      { label: 'ชุด A - หนึ่ง', value: 'a1' },
      { label: 'ชุด A - สอง', value: 'a2' },
    ],
    [
      { label: 'ชุด B - หนึ่ง', value: 'b1' },
      { label: 'ชุด B - สอง', value: 'b2' },
    ],
  ]

  const province = ref('')
  const provinceWithIcon = ref('')
  const tags = ref<(string | number)[]>([])
  const tagsWithCustomCheckbox = ref<(string | number)[]>([])

  const tagsWithDisplayValue = ref<(string | number)[]>([])
  const tagsDisplayValue = computed(() =>
    tagsWithDisplayValue.value.length > 2 ? `เลือกไว้ ${tagsWithDisplayValue.value.length} รายการ` : ''
  )
  const searchableProvince = ref('')
  const monthValue = ref<number | ''>('')

  const cityValue = ref<number | ''>('')
  const provinceSelectedSlot = ref('')
  const provincePrependAppend = ref('')
  const provinceCustomIcons = ref('')
  const provinceNoOptionSlot = ref('')

  // เก็บ event log ล่าสุด 5 รายการไว้โชว์บนจอ — ไม่ใช่ pattern ที่ต้องทำตาม แค่สาธิตว่า event ยิงจริง
  const selectEventLog = ref<string[]>([])
  const logSelectEvent = (label: string): void => {
    selectEventLog.value = [...selectEventLog.value, label].slice(-5)
  }
  const onLongListVirtualScroll = (details: {
    index: number
    from: number
    to: number
    direction: 'increase' | 'decrease'
  }): void => {
    logSelectEvent(`scroll ${details.direction} → ${details.from}-${details.to}`)
  }

  const provinceUseInput = ref('')
  const filteredProvinceOptions = ref<ISelectOption[]>(provinceOptions)
  // @filter: value คือข้อความที่พิมพ์ล่าสุด, update(fn) เรียก fn() ให้เองแล้วเปิด/รีเฟรช panel ให้ — filter เองแบบ sync จาก provinceOptions ทั้งชุด (ไม่ผ่าน API)
  const onFilterProvince = (value: string, update: (apply: () => void) => void): void => {
    update(() => {
      const needle = value.trim().toLowerCase()
      filteredProvinceOptions.value = needle
        ? provinceOptions.filter(option => option.label.toLowerCase().includes(needle))
        : provinceOptions
    })
  }

  const tagsUseInput = ref<(string | number)[]>([])
  const filteredTagOptions = ref<ISelectOption[]>(tagOptions)
  const onFilterTags = (value: string, update: (apply: () => void) => void): void => {
    update(() => {
      const needle = value.trim().toLowerCase()
      filteredTagOptions.value = needle
        ? tagOptions.filter(option => option.label.toLowerCase().includes(needle))
        : tagOptions
    })
  }

  const provinceemit = ref('')
  const provinceObject = ref<ISelectOption | ''>('')
  const provinceRaw = ref('')
  const longValue = ref('')
  const clearableProvince = ref('bangkok')
  const disabledValue = ref('bangkok')
  const readonlyValue = ref('phuket')
  const requiredValue = ref('')
  const customStyleValue = ref('')
  const dynamicValue = ref('a1')

  const dynamicOptionSetIndex = ref(0)
  const dynamicOptions = computed(() => dynamicOptionSets[dynamicOptionSetIndex.value])

  const swapDynamicOptions = (): void => {
    dynamicOptionSetIndex.value = dynamicOptionSetIndex.value === 0 ? 1 : 0
  }

  const requiredSelectRef = ref<SelectExposed | null>(null)

  interface IJsonPlaceholderUser {
    id: number
    name: string
  }

  const loadingUsers = ref(false)
  const userOptions = ref<ISelectOption[]>([])
  const selectedUser = ref('')

  // เรียก API ภายนอกจริง (เหมือน api-demo.vue) เพื่อโชว์ loading prop ระหว่างรอ options มาจริงๆ ไม่ใช่ setTimeout จำลอง
  const fetchUsers = async (): Promise<void> => {
    loadingUsers.value = true
    selectedUser.value = ''

    try {
      const users = await apiRaw<IJsonPlaceholderUser[]>({
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/users',
      })
      userOptions.value = users.map(user => ({ label: user.name, value: user.id }))
    } catch (e) {
      const { title, message } = getErrorDisplay(e)
      showDialogError(title, message)
    } finally {
      loadingUsers.value = false
    }
  }

  onMounted(fetchUsers)

  const selectedUserAsync = ref('')
  const userOptionsAsync = ref<ISelectOption[]>([])
  const filterLoading = ref(false)
  // ไม่ใช้ ref เพราะไม่ต้องขับ template — กันแค่ response เก่ากลับมาช้ากว่าคำค้นใหม่ (race condition ปกติของ debounce-less remote search)
  let filterToken = 0

  const onFilterRemote = async (
    value: string,
    update: (apply: () => void) => void,
    abort: () => void
  ): Promise<void> => {
    const token = ++filterToken
    filterLoading.value = true

    try {
      const users = await apiRaw<IJsonPlaceholderUser[]>({
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/users',
      })
      // jsonplaceholder ตอบเร็วมาก (~10-20ms, มักโดน browser cache) — หน่วงเทียมไว้เฉยๆ ให้ loadingText
      // ใน demo นี้เห็นผลจริงบนจอ ไม่ใช่ pattern ที่ต้องทำตามตอนต่อ API จริงของหน้างาน
      await new Promise(resolve => setTimeout(resolve, 700))

      // มีคำค้นใหม่กว่ายิงเข้ามาระหว่างรอ response นี้อยู่ — ทิ้ง response เก่า ไม่ให้ทับผลลัพธ์ที่ใหม่กว่า
      if (token !== filterToken) {
        abort()
        return
      }

      const needle = value.trim().toLowerCase()
      update(() => {
        userOptionsAsync.value = users
          .filter(user => user.name.toLowerCase().includes(needle))
          .map(user => ({ label: user.name, value: user.id }))
      })
    } catch (e) {
      abort()
      const { title, message } = getErrorDisplay(e)
      showDialogError(title, message)
    } finally {
      if (token === filterToken) filterLoading.value = false
    }
  }
</script>

<style scoped lang="scss">
  .container {
    padding: 12px;
  }

  [id^='demo-'] {
    scroll-margin-top: 72px;
  }
</style>

<route lang="yaml">
meta:
  layout: default
  navtop:
    back_to: '/example'
    title: 'Select Demo'
  main:
    image: true
  navbottom:
    active: false
    current: 'example'
</route>
