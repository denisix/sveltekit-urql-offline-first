import { get } from 'svelte/store'
import online from '$lib/stores/online'
import urql from '$lib/stores/urql'

console.log('- get online ->', get(online))

const mutate = (query, vars) =>
  new Promise((resolve, reject) => {
    const client = get(urql)
    const q = client.mutation(query, vars).toPromise()

    const timeout = setTimeout(() => resolve({ done: 'timedout' }), 5000)

    q.then(({ data, error }) => {
      clearTimeout(timeout)
      resolve({ data, error, done: 'online' })
    }).catch(e => {
      clearTimeout(timeout)
      reject(e)
    })

    console.log('get online ->', get(online))
    if (!get(online)) {
      resolve({ done: 'offline' })

      setTimeout(() => {
        if (get(online)) {
          console.log('- was offline -> but came online within 5sec, rexec mutation')
          client
            .mutation(query, vars)
            .toPromise()
            .then(({ data, error }) => resolve({ data, error, done: 'online' }))
            .catch(reject)
        }
      }, 5000)
    }
  })

export default mutate
