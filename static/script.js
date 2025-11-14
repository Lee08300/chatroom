/* ========= Mermaid 初始化 ========= */
mermaid.initialize({startOnLoad:false});

/* ===== 使用者暱稱 ===== */
let username = sessionStorage.getItem('chat_username');
if(!username){
  username = '使用者'+Math.floor(Math.random()*1000);
  sessionStorage.setItem('chat_username',username);
}


/* ===== 發訊息 ===== */
$("#send-button").on("click", send);
$("#message-input").on("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});


/* ===== 清空訊息 ===== */
$("#clear-btn").on("click", () => {
  if (confirm("確定要清空聊天？")) $("#chat-messages").empty();
});


/* ========= 滑到底部 ========= */
function scrollBottom() {
  const m = document.getElementById("chat-messages");
  m.scrollTop = m.scrollHeight;
}

/* ===== Markdown / Mermaid / Highlight ===== */
function format(txt) {
  txt = txt.trim();
  let html = marked.parse(txt);
  html = DOMPurify.sanitize(html);

  html = html.replace(/<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g, (m, c) => {
    const raw = c.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
    return `<div class="mermaid-container"><button class="copy-btn" onclick="copyText(this,'${encodeURIComponent(
      raw
    )}')">複製</button><pre class="mermaid">${raw}</pre></div>`;
  });

  html = html.replace(/<pre><code class="language-([\w]+)">([\s\S]*?)<\/code><\/pre>/g, (m, l, c) => {
    if (l === "mermaid") return m;
    return `<div class="code-block"><button class="copy-btn" onclick="copyText(this,'${encodeURIComponent(
      c
    )}')">複製</button><pre><code class="language-${l} hljs">${c}</code></pre></div>`;
  });

  return html;
}

// ===== 執行 Highlight.js 與 Mermaid 渲染 =====
function renderCode() {
  requestAnimationFrame(() => {
    document.querySelectorAll("pre code").forEach((b) => hljs.highlightElement(b));
    mermaid.init(undefined, ".mermaid");
  });
}

// ===== 複製按鈕功能 =====
function copyText(btn, encoded) {
  const text = decodeURIComponent(encoded);
  navigator.clipboard
    .writeText(text)
    .then(() => {
      btn.innerText = "已複製！";
      setTimeout(() => (btn.innerText = "複製"), 1500);
    })
    .catch(() => alert("複製失敗"));
}

function addMessage(content, isMe, sender) {
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const html = `
    <div class="message ${isMe ? "user-message" : "other-message"} clearfix">
      ${!isMe ? `<div class="user-info"><span class="user-name">${sender}</span></div>` : ""}
      <div class="message-content">${format(content)}</div>
      <div class="message-time">${time}</div>
    </div>`;
  $("#chat-messages").append(html);
  renderCode();
  scrollBottom();
}

/* ===== 表情選單（ ===== */
$(".emoji-btn").on("click", function () {
  const emojis = ["😊", "😂", "😍", "👍", "❤️", "😉", "🎉", "👋"];
  if ($(".emoji-menu").length) {
    $(".emoji-menu").remove();
    return;
  }
  let menu = '<div class="emoji-menu p-2 bg-white rounded shadow">';
  emojis.forEach((e) => (menu += `<span class="emoji-item p-1" style="cursor:pointer;font-size:1.5rem;">${e}</span>`));
  menu += "</div>";
  $(this).after(menu);
  $(".emoji-item").on("click", function () {
    $("#message-input").val($("#message-input").val() + $(this).text());
    $(".emoji-menu").remove();
  });
  $(document).one("click", (e) => {
    if (!$(e.target).hasClass("emoji-btn")) $(".emoji-menu").remove();
  });
});

function send(){
  const txt=$('#message-input').val().trim();
  if(!txt) return;
  addMessage(txt,true);
  $('#message-input').val('').height('auto');
  scrollBottom();
}
