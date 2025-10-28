# BasePopover Component

Komponen popover yang reusable dengan animasi dan positioning yang fleksibel.

## Features

- ✅ Multiple positioning options (bottom-left, bottom-right, top-left, top-right)
- ✅ Customizable width (auto, sm, md, lg, xl)
- ✅ Arrow indicator
- ✅ Click outside to close
- ✅ Smooth transitions
- ✅ Slot-based content
- ✅ Exposed methods untuk kontrol programmatic

## Props

| Prop                  | Type                                                           | Default         | Description                             |
| --------------------- | -------------------------------------------------------------- | --------------- | --------------------------------------- |
| `triggerText`         | `string`                                                       | `'Open'`        | Text untuk trigger button               |
| `position`            | `'bottom-left' \| 'bottom-right' \| 'top-left' \| 'top-right'` | `'bottom-left'` | Posisi popover relatif terhadap trigger |
| `width`               | `'auto' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                       | `'auto'`        | Lebar popover                           |
| `showArrow`           | `boolean`                                                      | `true`          | Tampilkan arrow indicator               |
| `customClass`         | `string`                                                       | `''`            | Custom class untuk trigger button       |
| `closeOnClickOutside` | `boolean`                                                      | `true`          | Close popover saat click di luar        |

## Events

| Event   | Payload | Description                    |
| ------- | ------- | ------------------------------ |
| `open`  | -       | Dipanggil saat popover dibuka  |
| `close` | -       | Dipanggil saat popover ditutup |

## Slots

### `trigger`

Custom trigger button content.

**Default:** Text dari prop `triggerText`

### `default`

Popover content. Menerima scoped slot dengan parameter:

- `close`: Function untuk menutup popover

## Exposed Methods

| Method            | Description               |
| ----------------- | ------------------------- |
| `togglePopover()` | Toggle open/close popover |
| `closePopover()`  | Close popover             |

## Usage Examples

### Basic Usage

```vue
<template>
  <BasePopover trigger-text="Click Me">
    <div class="p-4">
      <p>Popover content here</p>
    </div>
  </BasePopover>
</template>

<script setup lang="ts">
import BasePopover from "@/components/base/BasePopover.vue";
</script>
```

### With Custom Trigger

```vue
<template>
  <BasePopover position="bottom-right" width="md">
    <template #trigger>
      <span class="flex items-center gap-2">
        <svg>...</svg>
        Menu
      </span>
    </template>

    <template #default="{ close }">
      <div class="p-4">
        <button @click="handleAction(close)">Action</button>
      </div>
    </template>
  </BasePopover>
</template>
```

### With Programmatic Control

```vue
<template>
  <BasePopover ref="popoverRef">
    <div class="p-4">Content</div>
  </BasePopover>

  <button @click="openPopover">Open from outside</button>
</template>

<script setup lang="ts">
import { ref } from "vue";
import BasePopover from "@/components/base/BasePopover.vue";

const popoverRef = ref<InstanceType<typeof BasePopover> | null>(null);

const openPopover = () => {
  popoverRef.value?.togglePopover();
};
</script>
```

### Different Positions

```vue
<template>
  <div class="flex gap-4">
    <BasePopover position="bottom-left">Bottom Left</BasePopover>
    <BasePopover position="bottom-right">Bottom Right</BasePopover>
    <BasePopover position="top-left">Top Left</BasePopover>
    <BasePopover position="top-right">Top Right</BasePopover>
  </div>
</template>
```

### Different Widths

```vue
<template>
  <BasePopover width="sm">Small (w-64)</BasePopover>
  <BasePopover width="md">Medium (w-80)</BasePopover>
  <BasePopover width="lg">Large (w-96)</BasePopover>
  <BasePopover width="xl">Extra Large (w-[28rem])</BasePopover>
</template>
```

## Styling

Component menggunakan DaisyUI classes dan dapat di-customize melalui:

- `customClass` prop untuk trigger button
- Tailwind classes di slot content
- CSS variables untuk theme colors

## Accessibility

- Keyboard navigation support (ESC untuk close - coming soon)
- ARIA attributes (coming soon)
- Focus management (coming soon)
