const SNIPPETS = [
    {
        author: "BOWEN",
        publishedAt: "2026-06-27T09:15:00",
        text: "市场部的同事把 FTL 写进宣传册，旁边配了星空和曲率引擎的示意图。我拿着红笔圈了整整一页：我们卖的是毫秒级闭环，不是曲率。他愣了两秒，说那观众不懂控制论怎么办。我说，那就别让他们以为我们在造飞船。",
        image: "images/jyy-s01-control-loop.jpg"
    },
    {
        author: "BOWEN",
        publishedAt: "2026-06-26T20:40:00",
        text: "期末复习做到一道题，极限、积分、求和三层套在一起。我在公交上把 n 想成越来越密的格子，格子上的高度连起来像台阶，台阶抹平就是积分。到站时还没算完，但心里已经不慌了——符号只是同一件事的三种口音。",
        image: "images/jyy-s02-riemann-grid.jpg"
    },
    {
        author: "BOWEN",
        publishedAt: "2026-06-25T22:10:00",
        text: "实验室第一天，师兄没讲反应式，只让我把废液桶上的日期补全。我嫌麻烦，他说：日期不是给检查看的，是给未来的你认账用的。那天我什么都没合成，却记住了化学最先教的是可追溯，不是炫酷。",
        image: "images/jyy-s03-trace-log.jpg"
    },
    {
        author: "BOWEN",
        publishedAt: "2026-06-24T11:30:00",
        text: "彩排时魔方在定点上方轻轻「点头」。查了一小时，不是风，是 ESC 和 IMU 采样错相，控制律把振动当成了姿态误差。把采样对齐之后，点头消失了——小机身里，相位比参数名重要。",
        image: "images/jyy-s04-phase-sync.jpg"
    },
    {
        author: "BOWEN",
        publishedAt: "2026-06-22T16:05:00",
        text: "换元之后积分上限总是写错，室友说我「把 sin 的脾气当 cos 的」。后来我在纸边上画单位圆，只标出 0 到 30° 那一截——原来错误不在公式，在把整圆的习惯带进了半圆的题目。",
        image: "images/jyy-s05-unit-circle.jpg"
    },
    {
        author: "BOWEN",
        publishedAt: "2026-06-21T08:50:00",
        text: "MSDS 要大声读出来，是实验室的规矩。我第一次读「对水生生物有害」时声音发虚，师兄说：虚就对了，虚说明你在意后果。化学让人学会用喉咙确认风险，而不只是用眼睛扫一行字。",
        image: "images/jyy-s06-msds-terminal.jpg"
    },
    {
        author: "BOWEN",
        publishedAt: "2026-06-19T14:20:00",
        text: "展会中途换电池，观众以为是表演环节。其实我们在后台计时：必须在 47 秒内完成断电、更换、重标定、复飞。多一秒，后面的脚本就乱。飞行物落地，一半是算法，一半是换电池的人别手抖。",
        image: "images/jyy-s07-battery-swap.jpg"
    },
    {
        author: "BOWEN",
        publishedAt: "2026-06-17T19:00:00",
        text: "算出 5π²/72 那天，我没有庆祝，只是把数值代回去核对了一遍。π² 冒出来像老朋友——Basel 问题里见过它，只是换了一件衣服。分析学有时就是这样：答案不是终点，是提醒你以前学过的某个常数还在附近。",
        image: "images/jyy-s08-basel-constant.jpg"
    },
    {
        author: "BOWEN",
        publishedAt: "2026-06-15T23:30:00",
        text: "恒温水槽旁有张折角的便利贴：「离开前确认加热棒已关。」没人署名。我问是谁写的，师兄说可能是三年前的谁。实验室里很多规矩不是教授发明的，是不出事的那一代人留给下一届的沉默。",
        image: "images/jyy-s09-sticky-note.jpg"
    },
    {
        author: "BOWEN",
        publishedAt: "2026-06-13T10:45:00",
        text: "客户要求 iPad 实时改航点。试了一次，屏幕上的点和空中的点差半拍。我们后来写进合同：表演模式禁止地面实时调参。链路延迟不会因为你着急就变短，只能把人的耐心从关键路径上挪走。",
        image: "images/jyy-s10-latency-hud.jpg"
    },
    {
        author: "BOWEN",
        publishedAt: "2026-06-11T15:10:00",
        text: "给职中的学弟讲 Riemann 和，我让他先切苹果：切得越细，小块面积加起来越接近整片。他问这和爆炸有什么关系。我说没关系，和「把复杂拆成可数的简单」有关系——数学和实验室都靠这个活着。",
        image: "images/jyy-s11-apple-slices.jpg"
    },
    {
        author: "BOWEN",
        publishedAt: "2026-06-09T07:20:00",
        text: "有人在网上问「职中能不能学懂能爆的那套」。我没回复，把问题截图存进文件夹，文件名是「不要回答」。不是傲慢，是记得通风橱玻璃后面，教授签字栏空着的时候，最好什么都别开始。",
        image: "images/jyy-s12-locked-folder.jpg"
    }
];

const grid = document.getElementById("snippet-grid");

function getRelativeTime(dateStr) {
    const now = new Date("2026-06-28T12:00:00");
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
