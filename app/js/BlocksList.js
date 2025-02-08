var cache = [];

export async function getBlocksList(dataBridge)
{
    if (cache.length !== 0) {
        return new Promise((resolve) => resolve(cache));
    }
    cache = await fetch(`https://unpkg.com/minecraft-data@3.83.1/minecraft-data/data/pc/${dataBridge.serverVersion}/blocks.json`, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
    }).then(res => res.json());
    return cache;
}