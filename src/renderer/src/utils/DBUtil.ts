import { from, useObservable } from '@vueuse/rxjs'
import Dexie, { liveQuery } from 'dexie'
import { Ref } from 'vue'

export type DynamicListConfig<T, E> = {
  onSuccess?: (data: T[]) => void
  onError?: (error: E) => void
  onFinally?: () => void
  loading?: Ref<boolean>
}

export const getDynamicList = <T, E>(
  dataBase: Dexie.Table<T, number>,
  config?: DynamicListConfig<T, E>
) => {
  return useObservable(
    from(
      liveQuery(() =>
        dataBase
          .toArray()
          .then((res) => {
            if (config?.onSuccess) config.onSuccess(res)
            return res
          })
          .catch((error) => {
            if (config?.onError) config.onError(error)
            return []
          })
          .finally(() => {
            if (config?.loading) config.loading.value = false
            if (config?.onFinally) config.onFinally()
          })
      )
    )
  ) as Readonly<Ref<T[]>>
}
