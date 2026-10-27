/* ------------------------------------------------------------------
   THE REGISTRY — the one part of the Office that holds anything.

   A team register is a file of designations a team has actually
   adopted, and when. It is opened by a token nobody but the team
   holds: the table keys on a SHA-256 of that token, never the token
   itself, so a copy of the table opens nothing.

   It accepts only names already on the public register. That is the
   abuse policy, the data-protection policy and the size limit at
   once: a public endpoint that stores free text becomes somebody's
   free storage, and a team's Jira board is not this office's to
   keep. A file can never hold more entries than the corpus does.

   The corpus is read from the site, not bundled here, so that adding
   a name is a deploy of the site and never a deploy of this function.

   Deliberately logs nothing about requests - no paths, no headers,
   no addresses. Only failures the Office did not expect.

   Served by a Lambda function URL. CORS is the URL's configuration,
   not this code's: answering preflights here as well would send the
   headers twice, which browsers reject.
------------------------------------------------------------------ */

import { createHash, randomBytes } from "node:crypto";
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  ConditionalCheckFailedException
} from "@aws-sdk/client-dynamodb";

const TABLE = process.env.TABLE_NAME;
const CORPUS_URL = process.env.CORPUS_URL;

const DAY = 86400;
/* An opened register nobody files anything in is a typo or a test. */
const EMPTY_TTL = 7 * DAY;
/* Refreshed on every filing. A team that names a sprint every two
   weeks never comes near it; a team that stopped has stopped. */
const ACTIVE_TTL = 548 * DAY;
const CORPUS_TTL_MS = 10 * 60 * 1000;
/* UpdateExpression is capped at 4 KB; fifty clauses stay well under. */
const CHUNK = 50;

const db = new DynamoDBClient({});

let corpus = null;
let corpusAt = 0;

async function loadCorpus(){
  if (corpus && Date.now() - corpusAt < CORPUS_TTL_MS) return corpus;
  try {
    const res = await fetch(CORPUS_URL, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error("corpus: HTTP " + res.status);
    const body = await res.json();
    corpus = new Set(body.names);
    corpusAt = Date.now();
  } catch (e) {
    /* A stale corpus is better than none: names are only ever added. */
    if (!corpus) throw e;
    console.error("corpus refresh failed, serving the cached copy:", e.message);
  }
  return corpus;
}

const json = (statusCode, body) => ({
  statusCode,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  body: JSON.stringify(body)
});

const now = () => Math.floor(Date.now() / 1000);
const fileId = token => createHash("sha256").update(token).digest("hex");

function bearer(event){
  const h = event.headers?.authorization || "";
  const m = h.match(/^Bearer ([A-Za-z0-9_-]{32})$/);
  return m ? m[1] : null;
}

function readBody(event){
  if (!event.body) return {};
  const raw = event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body;
  try { return JSON.parse(raw); } catch { return null; }
}

/* adopted is a map of name -> epoch ms, or 0 for "filed retrospectively". */
function present(item){
  const adopted = {};
  for (const [name, v] of Object.entries(item.adopted?.M || {})) adopted[name] = Number(v.N);
  return { adopted, opened: Number(item.created.N) * 1000 };
}

async function fetchFile(id){
  const { Item } = await db.send(new GetItemCommand({ TableName: TABLE, Key: { id: { S: id } } }));
  /* TTL deletion runs days behind; an expired file is already shredded. */
  if (!Item || Number(Item.expires.N) < now()) return null;
  return Item;
}

async function openRegister(){
  const token = randomBytes(24).toString("base64url");
  const t = now();
  await db.send(new PutItemCommand({
    TableName: TABLE,
    Item: {
      id: { S: fileId(token) },
      adopted: { M: {} },
      created: { N: String(t) },
      expires: { N: String(t + EMPTY_TTL) }
    },
    ConditionExpression: "attribute_not_exists(id)"
  }));
  return json(201, { token, adopted: {}, opened: t * 1000 });
}

async function file(id, names, when){
  const t = now();
  let item = null;
  for (let i = 0; i < names.length; i += CHUNK){
    const chunk = names.slice(i, i + CHUNK);
    const attrNames = {};
    const sets = chunk.map((n, j) => {
      attrNames["#n" + j] = n;
      return "adopted.#n" + j + " = if_not_exists(adopted.#n" + j + ", :d)";
    });
    const res = await db.send(new UpdateItemCommand({
      TableName: TABLE,
      Key: { id: { S: id } },
      UpdateExpression: "SET " + sets.join(", ") + ", expires = :exp",
      ConditionExpression: "attribute_exists(id) AND expires > :now",
      ExpressionAttributeNames: attrNames,
      ExpressionAttributeValues: {
        ":d": { N: String(when) },
        ":exp": { N: String(t + ACTIVE_TTL) },
        ":now": { N: String(t) }
      },
      ReturnValues: "ALL_NEW"
    }));
    item = res.Attributes;
  }
  return item;
}

async function withdraw(id, name){
  const t = now();
  const res = await db.send(new UpdateItemCommand({
    TableName: TABLE,
    Key: { id: { S: id } },
    UpdateExpression: "REMOVE adopted.#n SET expires = :exp",
    ConditionExpression: "attribute_exists(id) AND expires > :now",
    ExpressionAttributeNames: { "#n": name },
    ExpressionAttributeValues: { ":exp": { N: String(t + ACTIVE_TTL) }, ":now": { N: String(t) } },
    ReturnValues: "ALL_NEW"
  }));
  return res.Attributes;
}

async function route(event){
  const method = event.requestContext?.http?.method;
  const path = event.rawPath;

  if (method === "POST" && path === "/registers") return openRegister();

  if (path !== "/register" && path !== "/register/adopted") return json(404, { error: "No such form" });

  const token = bearer(event);
  if (!token) return json(401, { error: "No file number presented" });
  const id = fileId(token);

  if (method === "GET" && path === "/register"){
    const item = await fetchFile(id);
    return item ? json(200, present(item)) : json(404, { error: "No such file" });
  }

  const body = readBody(event);
  if (!body) return json(400, { error: "Illegible" });
  const known = await loadCorpus();

  if (method === "POST" && path === "/register/adopted"){
    if (!Array.isArray(body.names) || !body.names.length) return json(400, { error: "Nothing to file" });
    const names = [...new Set(body.names)].filter(n => typeof n === "string");
    const accepted = names.filter(n => known.has(n));
    const rejected = names.filter(n => !known.has(n));
    if (!accepted.length) return json(422, { error: "Not on the register", rejected });
    const item = await file(id, accepted, body.retrospective ? 0 : Date.now());
    return json(200, { ...present(item), rejected });
  }

  if (method === "DELETE" && path === "/register/adopted"){
    if (typeof body.name !== "string" || !known.has(body.name)) return json(400, { error: "Not on the register" });
    return json(200, present(await withdraw(id, body.name)));
  }

  return json(405, { error: "Not a procedure this office follows" });
}

export async function handler(event){
  try {
    return await route(event);
  } catch (e) {
    if (e instanceof ConditionalCheckFailedException) return json(404, { error: "No such file" });
    console.error(e);
    return json(503, { error: "The Office did not answer" });
  }
}
