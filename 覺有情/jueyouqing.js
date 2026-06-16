const SNIPPETS = [
    {
        author: "BOWEN",
        publishedAt: "2026-06-15T09:20:00",
        text: "新艾利都的霓虹永远不会为天亮而让路。比利说，子弹比路灯更懂正义的方向——孩子们，你们的骑士梦还亮着吗？",
        image: "../images/比利SP1.jpg"
    },
    {
        author: "BOWEN",
        publishedAt: "2026-06-13T22:10:00",
        text: "抽卡池水资源枯竭的那个夜里，我终于明白：骑士梦不是抽到 S，而是还敢再垫一刀。"
    },
    {
        author: "BOWEN",
        publishedAt: "2026-06-11T14:35:00",
        text: "走格子走累了，就停下来看看空洞边缘的云。朱鸢在巡逻，我在巡逻自己的心。",
        image: "../images/ZZZ3.0.1.jpg"
    },
    {
        author: "BOWEN",
        publishedAt: "2026-06-09T08:00:00",
        text: "1.4 上半全员原始人？问？？\n也许版本更迭里，老角色的温柔谎言，才是留给骑士团最后的体面。"
    },
    {
        author: "BOWEN",
        publishedAt: "2026-06-07T19:45:00",
        text: "电队怎会如此……现在加入骑士团还来得及吗。少安毋躁，想清楚再决定培养资源的投入。",
        image: "../images/jqlzy.jpg"
    },
    {
        author: "BOWEN",
        publishedAt: "2026-06-04T11:30:00",
        text: "AI 可以穷举极限帧率，但它模拟不出你一血极限状态下、手心冒汗却依然敲下闪避键的心跳。"
    },
    {
        author: "BOWEN",
        publishedAt: "2026-06-02T16:00:00",
        text: "人类正在退出人类。智能 Agent 当道，我们连走格子都不需要亲自参与——这是解放，还是温水？",
        image: "../images/骑士梦1.jpg"
    },
    {
        author: "BOWEN",
        publishedAt: "2026-05-30T21:15:00",
        text: "你就是不敢。面对 1.4 卡池，你真的是在等最优解，还是根本不敢面对赌失败的风险？"
    },
    {
        author: "BOWEN",
        publishedAt: "2026-05-28T13:40:00",
        text: "创造力是温柔的谎言吗。玩法机制创新，究竟是降维打击，还是编织给老玩家的温柔谎言？",
        image: "../images/ZZZzhe1.jpg"
    },
    {
        author: "BOWEN",
        publishedAt: "2026-05-25T07:50:00",
        text: "凌晨三点的六课办公室，咖啡凉了，驱动盘还没洗出暴击。骑士不会下班，治安局也不会。"
    },
    {
        author: "BOWEN",
        publishedAt: "2026-05-22T18:20:00",
        text: "今日宜：弹刀、极限闪避、对空洞说「不」。\n忌：在深渊里和策划讲道理。",
        image: "../images/ZZZ.jpg"
    },
    {
        author: "BOWEN",
        publishedAt: "2026-05-18T10:05:00",
        text: "廣行饒益，利樂有情。对队友宽容一点，对自己的骑士梦再苛刻一点——绝区零教会我的事。"
    }
];

const grid = document.getElementById("snippet-grid");

function getRelativeTime(dateStr) {
    const now = new Date("2026-06-16T12:00:00");
    const past = new Date(dateStr);
    const diffMs = now - past;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "今天";
    if (diffDays < 7) return `${diffDays} 天前`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 5) return `${diffWeeks} 周前`;
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} 个月前`;
}

function renderSnippets() {
    if (!grid) return;

    grid.innerHTML = SNIPPETS.map((item) => {
        const imageHtml = item.image
            ? `<img class="snippet-image" src="${item.image}" alt="" loading="lazy">`
            : "";

        return `
            <article class="snippet-card">
                <div class="snippet-head">
                    <span class="snippet-author">${item.author}</span>
                    <time class="snippet-time" datetime="${item.publishedAt}">${getRelativeTime(item.publishedAt)}</time>
                </div>
                <p class="snippet-text">${item.text}</p>
                ${imageHtml}
            </article>
        `;
    }).join("");
}

document.addEventListener("DOMContentLoaded", () => {
    renderSnippets();

    window.BowenMusic?.bindToggle(
        document.getElementById("music-toggle"),
        document.getElementById("music-icon"),
        { play: "../images/音乐打开键.jpg", mute: "../images/音乐关闭键.jpg" }
    );
});
