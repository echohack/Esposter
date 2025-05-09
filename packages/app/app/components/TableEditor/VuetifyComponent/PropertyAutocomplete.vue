<script setup lang="ts">
import type { VuetifyComponentItem } from "#shared/models/tableEditor/vuetifyComponent/VuetifyComponentItem";
import type { Class } from "type-fest";

import { VuetifyComponentMap } from "#shared/services/tableEditor/vuetifyComponent/VuetifyComponentMap";
import { getPropertySchema } from "@/services/tableEditor/vuetifyComponent/getPropertySchema";
import { useTableEditorStore } from "@/store/tableEditor";
import { Vjsf } from "@koumoul/vjsf";

const tableEditorStore = useTableEditorStore<VuetifyComponentItem>();
const { editedItem } = storeToRefs(tableEditorStore);
const propertySchemaMap = computed<Record<string, Component>>(() => {
  const component = editedItem.value?.component;
  if (!component) return {};

  const result: Record<string, Component> = {};
  const props = VuetifyComponentMap[component].props as Record<string, { type?: Class<unknown> | Class<unknown>[] }>;

  for (const [name, prop] of Object.entries(props).filter((propEntry) => propEntry[1].type))
    if (Array.isArray(prop.type) && prop.type.length > 0) {
      const componentSchema = getPropertySchema(prop.type[0]);
      if (componentSchema) result[name] = markRaw(componentSchema);
    } else {
      const componentSchema = getPropertySchema(prop.type as Class<unknown>);
      if (componentSchema) result[name] = markRaw(componentSchema);
    }

  return result;
});
const properties = computed(() => Object.keys(propertySchemaMap.value));
const selectedProperty = ref<string>();

watch(
  () => editedItem.value?.component,
  () => {
    selectedProperty.value = undefined;
  },
);
</script>

<template>
  <template v-if="editedItem">
    <v-col cols="12">
      <v-autocomplete v-model="selectedProperty" label="Property" :items="properties" />
    </v-col>
    <v-col v-if="selectedProperty">
      <Vjsf v-model="editedItem.props[selectedProperty]" :schema="propertySchemaMap[selectedProperty]" />
    </v-col>
  </template>
</template>
