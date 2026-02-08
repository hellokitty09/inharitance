const GRAPH_URL = "https://api.studio.thegraph.com/query/1722576/inheritance/v0.0.1";

const query = `
{
  adminAddeds(first: 5) {
    id
    adminAddress
    name
    region
  }
  adminRemoveds(first: 5) {
    id
    adminAddress
    name
    region
  }
}
`;

async function runQuery() {
  const res = await fetch(GRAPH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });

  const json = await res.json();

  console.log(JSON.stringify(json, null, 2));
}

runQuery();
