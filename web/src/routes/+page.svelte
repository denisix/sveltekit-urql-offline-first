<script>
  import { getContextClient, queryStore, gql } from '@urql/svelte'
  import mutate from '$lib/mutate'

  const q = queryStore({
    client: getContextClient(),
    query: gql`{ itemAll { id title } }`,
  })

  let status = ''
  let counter = 0
  const mod = ({ id }) => () => {
    status = 'updating..'
    const title = 'upd ' + counter++

    mutate(gql`mutation($id: Int, $title: String) { itemMod(id: $id, title: $title) { id title } }`, { id: +id, title })
      .then(({ data, error, done }) => {
        status = done ? done : (error ? error.toString() : 'done')
        console.log('- then:', data, error?.toString(), done)
      })
      .catch(e => {
        status = 'catch: ' + e.toString()
        console.log('- catch:', e)
      })
  }
</script>


<h1>itemAll:</h1>

{#if $q.fetching}
  loading..
{/if}

{#if $q?.data?.itemAll}

  <ul>
    {#each $q.data.itemAll as item}
      <li><a href='#' on:click|preventDefault={mod(item)}>#{item.id} - {item.title}</a></li>  
    {/each}
  </ul>

{/if}

<p>Status: {status}</p>
