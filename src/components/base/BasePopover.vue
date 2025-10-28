<template>
  <div class="relative" ref="popoverContainer">
    <!-- Trigger Button -->
    <button
      @click="togglePopover"
      :class="['btn btn-primary btn-sm', customClass]"
      type="button"
    >
      <slot name="trigger">
        {{ triggerText }}
      </slot>
    </button>

    <!-- Popover Content -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="isOpen"
        :class="[
          'absolute z-[1002] mt-2 rounded-lg shadow-lg',
          'bg-base-100 border border-base-300',
          positionClasses,
          widthClass,
        ]"
      >
        <!-- Arrow -->
        <div
          v-if="showArrow"
          :class="[
            'absolute w-3 h-3 bg-base-100 border-base-300',
            'transform rotate-45',
            arrowPositionClasses,
          ]"
        ></div>

        <!-- Content -->
        <div class="relative bg-base-100 rounded-lg">
          <slot :close="closePopover"></slot>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

interface Props {
  triggerText?: string;
  position?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
  width?: "auto" | "sm" | "md" | "lg" | "xl";
  showArrow?: boolean;
  customClass?: string;
  closeOnClickOutside?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  triggerText: "Open",
  position: "bottom-left",
  width: "auto",
  showArrow: true,
  customClass: "",
  closeOnClickOutside: true,
});

const emit = defineEmits<{
  open: [];
  close: [];
}>();

const isOpen = ref(false);
const popoverContainer = ref<HTMLElement | null>(null);

const positionClasses = computed(() => {
  const positions = {
    "bottom-left": "left-0 top-full",
    "bottom-right": "right-0 top-full",
    "top-left": "left-0 bottom-full mb-2",
    "top-right": "right-0 bottom-full mb-2",
  };
  return positions[props.position];
});

const arrowPositionClasses = computed(() => {
  const positions = {
    "bottom-left": "-top-1.5 left-4 border-l border-t",
    "bottom-right": "-top-1.5 right-4 border-l border-t",
    "top-left": "-bottom-1.5 left-4 border-r border-b",
    "top-right": "-bottom-1.5 right-4 border-r border-b",
  };
  return positions[props.position];
});

const widthClass = computed(() => {
  const widths = {
    auto: "w-auto min-w-[200px]",
    sm: "w-64",
    md: "w-80",
    lg: "w-96",
    xl: "w-[28rem]",
  };
  return widths[props.width];
});

const togglePopover = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    emit("open");
  } else {
    emit("close");
  }
};

const closePopover = () => {
  isOpen.value = false;
  emit("close");
};

const handleClickOutside = (event: MouseEvent) => {
  if (!props.closeOnClickOutside) return;

  if (
    popoverContainer.value &&
    !popoverContainer.value.contains(event.target as Node)
  ) {
    closePopover();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

defineExpose({
  isOpen,
  togglePopover,
  closePopover,
});
</script>
