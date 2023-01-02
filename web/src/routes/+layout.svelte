<script>
  import { initContextClient, gql } from '@urql/svelte'
  import { dedupExchange, fetchExchange, errorExchange } from '@urql/svelte'
  import { offlineExchange } from '@urql/exchange-graphcache'
  import { makeDefaultStorage } from '@urql/exchange-graphcache/default-storage'
  import online from '$lib/stores/online'
  import urql from '$lib/stores/urql'

  const storage = makeDefaultStorage({
    idbName: 'graphcache-v3', // The name of the IndexedDB database
    maxAge: 7, // The maximum age of the persisted data in days
  });

  const offlineCache = offlineExchange({
    // schema,
    storage,
    updates: {
      // Mutation: {
      //   itemMod: (result, args, cache) => {
      //     const { id, title } = args
      //     console.log('- updates ->', id, title, result)
      //     return {
      //       __typename: 'Item',
      //       id,
      //       title
      //     }
      //   }
      // }
    },
    optimistic: {
      itemMod: (args, cache) => {
        const { id, title } = args
        const f = cache.readFragment(gql(`fragment _ on Item { id title }`), { id })
        console.log('- optimistic ->', id, title, 'fragment->', f)
        return {
          __typename: 'Item',
          id,
          title: title + ' [optimistic]'
        }
      }
    },
    resolvers: {
    },
  })

  const client = initContextClient({
    url: 'http://127.0.0.1:3000/graphql',
    requestPolicy: 'cache-and-network',
    exchanges: [
      dedupExchange,
      offlineCache,
      errorExchange({
        onResult: ({ error }) => {
          console.log('- onResult->', error?.networkError)
          if (error?.networkError) {
            // online -> offline
            online.set(false)
          } else {
            // offline -> online + dispatching 'online' event to notify URQL to reexec mutations queued in offline
            online.set(true)
            window.dispatchEvent(new Event('online')) 
          }
        },
      }),
      fetchExchange,
    ]
  })

  urql.set(client)

  // window.addEventListener('online', () => console.log('- on Online!'))
</script>

<svelte:head>
  <title>Offline-First</title>
</svelte:head>

<p>App is <b>{$online?'online':'offline'}</b></p>

<slot />

