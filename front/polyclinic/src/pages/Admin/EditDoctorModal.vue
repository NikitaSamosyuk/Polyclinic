<script setup lang="ts">
import EditDoctorProfile from '@/pages/doctor/EditDoctorProfile.vue'

const props = defineProps<{ doctor: any }>()
const emit = defineEmits(['close', 'updated'])
</script>

<template>
  <EditDoctorProfile :doctor="doctor" @close="$emit('close')" @updated="$emit('updated')" />
</template>
