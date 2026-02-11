export default {
 async fetch(req, env) {
  const url = new URL(req.url);

  // === DATABASE (KV) ===
  const DB = env.V35_DB;

  // === TẠO USER KEY (ADMIN) ===
  if (url.pathname === "/admin/create") {
   const key = "V35-" + Math.random().toString(36).substring(2,10).toUpperCase();
   await DB.put(key, JSON.stringify({ credit: 0 }));
   return json({ key });
  }

  // === CỘNG CREDIT (ADMIN) ===
  if (url.pathname === "/admin/add") {
   const { key, amount } = await req.json();
   const data = JSON.parse(await DB.get(key) || "{}");
   data.credit = (data.credit || 0) + Number(amount);
   await DB.put(key, JSON.stringify(data));
   return json({ ok: true, credit: data.credit });
  }

  // === KHÁCH DÙNG CREDIT ===
  if (url.pathname === "/use") {
   const { key } = await req.json();
   const data = JSON.parse(await DB.get(key) || "{}");
   if (!data.credit || data.credit <= 0)
     return json({ error: "NO_CREDIT" }, 403);

   data.credit--;
   await DB.put(key, JSON.stringify(data));
   return json({ ok: true, credit: data.credit });
  }

  return new Response("V35 Worker OK");
 }
};

function json(data, status = 200) {
 return new Response(JSON.stringify(data), {
  status,
  headers: { "Content-Type": "application/json" }
 });
}
