import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const html = `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>היומן והמשימות של מטיב</title>
    <script src="https://cdn.jsdelivr.net/npm/@instantdb/core@0.1.0/dist/index.js"></script>
    <style>
        body { font-family: system-ui, sans-serif; background: #f0f2f5; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #1c1e21; text-align: center; }
        .input-group { display: flex; gap: 10px; margin-bottom: 20px; }
        input { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
        button { padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        ul { list-style: none; padding: 0; }
        li { padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        .delete-btn { color: red; cursor: pointer; }
    </style>
</head>
<body>
    <div class="container">
        <h1>היומן והמשימות שלי</h1>
        <div class="input-group">
            <input type="text" id="taskInput" placeholder="מה המשימה הבאה?">
            <button onclick="addTask()">הוסף</button>
        </div>
        <ul id="taskList"></ul>
    </div>

    <script>
        const db = InstantDB.init({ appId: "${Deno.env.get("INSTANTDB_APP_ID")}" });

        function addTask() {
            const text = document.getElementById('taskInput').value;
            if (!text) return;
            db.transact(db.tx.tasks[InstantDB.id()].update({ text, createdAt: Date.now(), status: 'pending' }));
            document.getElementById('taskInput').value = '';
        }

        db.subscribe({ tasks: {} }, (result) => {
            const list = document.getElementById('taskList');
            list.innerHTML = '';
            if (result.data && result.data.tasks) {
                result.data.tasks.forEach(task => {
                    const li = document.createElement('li');
                    li.innerHTML = \`
                        <span>\${task.text}</span>
                        <span class="delete-btn" onclick="deleteTask('\${task.id}')">❌</span>
                    \`;
                    list.appendChild(li);
                });
            }
        });

        function deleteTask(id) {
            db.transact(db.tx.tasks[id].delete());
        }
    </script>
</body>
</html>
`;

serve((req) => {
  return new Response(html, {
    headers: { "content-type": "text/html; charset=UTF-8" },
  });
});
