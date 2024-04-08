import {
  h,
  ref,
  defineComponent,
  getCurrentInstance,
  resolveComponent,
  onMounted,
  onUpdated,
  onUnmounted,
  watch,
  computed,
  nextTick,
  PropType,
  HTMLAttributes
} from 'vue'

export type HtmlTransformAttrs = {
  x: number
  y: number
  scaleX: number
  scaleY: number
  rotation: number
  skewX: number
  skewY: number
}

export const KonvaHtml = defineComponent({
  name: 'KonvaHtml',
  props: {
    compnentPrefix: {
      type: String,
      default: 'v'
    },
    groupProps: {
      type: Object
    },
    divProps: {
      type: Object as PropType<HTMLAttributes>
    },
    transform: {
      type: Boolean,
      default: true
    },
    transformFunc: {
      type: Function as PropType<(attrs: HtmlTransformAttrs) => HtmlTransformAttrs>
    }
  },
  setup(props, { slots }) {
    const instance = getCurrentInstance()
    if (!instance) return

    const GroupComp = resolveComponent(`${props.compnentPrefix}Group`)

    const groupRef = ref()
    const contentRef = ref()

    const groupNode = computed(() => groupRef.value?.getNode())
    const shouldTransform = computed(() => props.transform)

    function handleTransform() {
      if (shouldTransform.value) {
        const tr = groupNode.value.getAbsoluteTransform()
        let attrs = tr.decompose()
        if (props.transformFunc) {
          attrs = props.transformFunc(attrs)
        }

        const parentAttrs = groupNode.value.parent?.attrs

        contentRef.value.style.position = 'absolute'
        contentRef.value.style.zIndex = '0'
        contentRef.value.style.top = '0px'
        contentRef.value.style.left = '0px'
        contentRef.value.style.width = parentAttrs.width ? parentAttrs.width + 'px' : 'auto'
        contentRef.value.style.height = parentAttrs.height ? parentAttrs.height + 'px' : 'auto'
        contentRef.value.style.transform = `translate(${attrs.x}px, ${attrs.y}px) rotate(${attrs.rotation}deg) scaleX(${attrs.scaleX}) scaleY(${attrs.scaleY})`
        contentRef.value.style.transformOrigin = 'top left'
      }
      const { style, ...restProps } = props.divProps || {}
      Object.assign(contentRef.value.style, style)
      Object.assign(contentRef.value, restProps)
    }

    async function mountHander() {
      await nextTick()

      const parent = groupNode.value.getStage()?.content
      if (!parent) {
        return
      }
      parent.prepend(contentRef.value)

      if (shouldTransform.value) {
        parent.style.position = 'relative'
        groupNode.value.on('absoluteTransformChange', handleTransform)
      } else {
        groupNode.value.off('absoluteTransformChange', handleTransform)
      }
      handleTransform()
    }

    function cleanHandler() {
      groupNode.value.off('absoluteTransformChange', handleTransform)
      contentRef.value.parentNode?.removeChild(contentRef.value)
    }

    watch(
      () => shouldTransform.value,
      (_, __, onCleanup) => {
        mountHander()
        onCleanup(cleanHandler)
      },
      {
        flush: 'post'
      }
    )

    watch([() => props.divProps, () => props.transformFunc], () => {
      handleTransform()
    })

    onMounted(() => {
      mountHander()
    })

    onUpdated(() => {
      cleanHandler()
      mountHander()
    })

    onUnmounted(() => {
      groupNode.value.destroy()
    })

    return () =>
      h(GroupComp, { ref: groupRef, config: props.groupProps }, () =>
        h('div', { ref: contentRef }, slots.default?.())
      )
  }
})
